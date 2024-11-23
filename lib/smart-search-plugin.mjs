import fs from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import JSON5 from "json5";

function smartSearchPlugin({ endpoint, accessToken }) {
  let isPluginExecuted = false;

  return {
    apply: (compiler) => {
      compiler.hooks.done.tapPromise("SmartSearchPlugin", async () => {
        if (isPluginExecuted) return;
        isPluginExecuted = true;

        if (compiler.options.mode !== "production") {
          console.log("Skipping indexing in non-production mode.");
          return;
        }

        try {
          const pages = await collectPages(path.join(cwd(), "app/docs"));
          console.log("Docs Pages collected for indexing:", pages.length);

          const newDocIds = pages.map((page) => page.id);
          await deleteExistingDocs(endpoint, accessToken, newDocIds);
          await sendPagesToEndpoint(pages, endpoint, accessToken);
        } catch (error) {
          console.error("Error in smartSearchPlugin:", error);
        }
      });
    },
  };
}

async function collectPages(directory) {
  const pages = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const subPages = await collectPages(entryPath);
      pages.push(...subPages);
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      const content = await fs.readFile(entryPath, "utf8");

      // Extract metadata using regex
      const metadataRegex = /export\s+const\s+metadata\s*=\s*({[\s\S]*?});/;
      const match = content.match(metadataRegex);

      if (!match || !match[1]) {
        console.warn(`No metadata found in ${entryPath}. Skipping.`);
        continue;
      }

      let metadata;
      try {
        metadata = JSON5.parse(match[1]);
      } catch (error) {
        console.error(`Error parsing metadata JSON in ${entryPath}:`, error);
        continue;
      }

      if (!metadata.title) {
        console.warn(`No title found in metadata of ${entryPath}. Skipping.`);
        continue;
      }

      const textContent = content;
      const cleanedPath = cleanPath(entryPath);
      const id = `mdx:${cleanedPath}`;

      console.log(`Indexing document with ID: ${id}, path: ${cleanedPath}`);

      pages.push({
        id,
        data: {
          title: metadata.title,
          content: textContent,
          path: cleanedPath,
          content_type: "mdx_doc",
        },
      });
    }
  }

  return pages;
}

function cleanPath(filePath) {
  const relativePath = path.relative(cwd(), filePath);
  return (
    "/" +
    relativePath
      .replace(/^pages\//, "")
      .replace(/^src\/pages\//, "")
      .replace(/^app\//, "")
      .replace(/\/index\.mdx$/, "")
      .replace(/\.mdx$/, "")
  );
}

async function deleteExistingDocs(endpoint, accessToken, newDocIds) {
  const queryDocuments = `
    query FindDocumentsToDelete($query: String!) {
      find(query: $query) {
        documents {
          id
        }
      }
    }
  `;

  const variablesForQuery = {
    query: 'content_type:"mdx_doc"',
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: queryDocuments,
        variables: variablesForQuery,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("Error fetching documents to delete:", result.errors);
      return;
    }

    const documentsToDelete = result.data.find.documents;

    if (!documentsToDelete || documentsToDelete.length === 0) {
      console.log("No documents to delete.");
      return;
    }

    for (const doc of documentsToDelete) {
      if (newDocIds.includes(doc.id)) {
        // Skip deleting documents that are being indexed
        continue;
      }

      const deleteMutation = `
        mutation DeleteDocument($id: ID!) {
          delete(id: $id) {
            code
            message
            success
          }
        }
      `;

      const variablesForDelete = {
        id: doc.id,
      };

      try {
        const deleteResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            query: deleteMutation,
            variables: variablesForDelete,
          }),
        });

        const deleteResult = await deleteResponse.json();

        if (deleteResult.errors) {
          console.error(
            `Error deleting document ID ${doc.id}:`,
            deleteResult.errors
          );
        } else {
          console.log(
            `Deleted document ID ${doc.id}:`,
            deleteResult.data.delete
          );
        }
      } catch (error) {
        console.error(`Network error deleting document ID ${doc.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error during deletion process:", error);
  }
}

const bulkIndexQuery = `
  mutation BulkIndex($documents: [DocumentInput!]!) {
    bulkIndex(input: { documents: $documents }) {
      code
      documents {
        id
      }
    }
  }
`;

async function sendPagesToEndpoint(pages, endpoint, accessToken) {
  if (pages.length === 0) {
    console.warn("No documents found for indexing.");
    return;
  }

  const documents = pages.map((page) => {
    const originalPath = page.data.path; // e.g., "/docs/test/page"

    // Remove the trailing "/page" segment
    const adjustedPath = path.posix.dirname(originalPath) + "/"; // "/docs/test/"

    return {
      id: page.id,
      data: {
        title: page.data.title,
        content: page.data.content,
        path: adjustedPath, // Use the adjusted path
        content_type: page.data.content_type,
      },
    };
  });

  const variables = { documents };

  // Logging the request details before the fetch call
  console.log("Sending bulk index request to endpoint:");
  console.log("Endpoint URL:", endpoint);
  console.log("Request Headers:", {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });
  console.log("GraphQL Query:", bulkIndexQuery);
  console.log("Variables:", JSON.stringify(variables, null, 2));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: bulkIndexQuery, variables }),
    });

    console.log("Response Status:", response.status, response.statusText);
    console.log("Response Headers:", [...response.headers.entries()]);

    const result = await response.json();

    // Logging the response body
    console.log("Response Body:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error(
        `Error during bulk indexing: ${response.status} ${response.statusText}`
      );
      console.error("Response Body:", JSON.stringify(result, null, 2));
      return;
    }

    if (result.errors) {
      console.error("GraphQL bulk indexing error:", result.errors);
    } else {
      console.log(`Indexed ${documents.length} documents successfully.`);
    }
  } catch (error) {
    console.error("Error during bulk indexing:", error);
  }
}

export default smartSearchPlugin;

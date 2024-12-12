import { hash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import { htmlToText } from "html-to-text";

const queryDocuments = `
query FindIndexedMdxDocs($query: String!) {
  find(query: $query) {
    documents {
      id
    }
  }
}
`;

const deleteMutation = `
mutation DeleteDocument($id: ID!) {
  delete(id: $id) {
    code
    message
    success
  }
}
`;

const bulkIndexQuery = `
mutation BulkIndex($input: BulkIndexInput!) {
  bulkIndex(input: $input) {
    code
    documents {
      id
    }
  }
}
`;

let isPluginExecuted = false;

function smartSearchPlugin({ endpoint, accessToken }) {
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

          await deleteOldDocs({ endpoint, accessToken }, pages);
          await sendPagesToEndpoint({ endpoint, accessToken }, pages);
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

      const metadataMatch = content.match(
        /export\s+const\s+metadata\s*=\s*(?<metadata>{[\S\s]*?});/
      );

      if (!metadataMatch?.groups?.metadata) {
        console.warn(`No metadata found in ${entryPath}. Skipping.`);
        continue;
      }

      let metadata = {};
      try {
        // eslint-disable-next-line no-eval
        metadata = eval(`(${metadataMatch.groups.metadata})`);
      } catch (error) {
        console.error("Error parsing metadata:", error);
        continue;
      }

      if (!metadata.title) {
        console.warn(`No title found in metadata of ${entryPath}. Skipping.`);
        continue;
      }

      const textContent = htmlToText(content);
      const cleanedPath = cleanPath(entryPath);

      const id = hash("sha-1", `mdx:${cleanedPath}`);

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
      .replace(/^src\/pages\//, "")
      .replace(/^pages\//, "")
      .replace(/^app\//, "")
      .replace(/\/index\.mdx$/, "")
      .replace(/\.mdx$/, "")
      // Remove trailing "/page" segment if it appears
      .replace(/\/page$/, "")
  );
}

async function deleteOldDocs({ endpoint, accessToken }, pages) {
  const currentMdxDocuments = new Set(pages.map((page) => page.id));
  const variablesForQuery = { query: 'content_type:"mdx_doc"' };

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
      console.error("Error fetching existing documents:", result.errors);
      return;
    }

    const existingIndexedDocuments = new Set(
      result.data.find.documents.map((doc) => doc.id)
    );

    const documentsToDelete = [...existingIndexedDocuments].filter(
      (id) => !currentMdxDocuments.has(id)
    );

    if (documentsToDelete.length === 0) {
      console.log("No documents to delete.");
      return;
    }

    for (const docId of documentsToDelete) {
      const variablesForDelete = { id: docId };

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
          const errorMessages = deleteResult.errors
            .map((err) => err.message)
            .join(", ");

          if (errorMessages.includes("no handler found for uri")) {
            console.warn(
              `Document with ID ${docId} was not found in the search index, skipping deletion.`
            );
          } else {
            console.error(
              `Error deleting document ID ${docId}:`,
              deleteResult.errors
            );
          }
        } else {
          console.log(
            `Deleted document ID ${docId}:`,
            deleteResult.data.delete
          );
        }
      } catch (error) {
        console.error(`Network error deleting document ID ${docId}:`, error);
      }
    }
  } catch (error) {
    console.error("Error during deletion process:", error);
  }
}

async function sendPagesToEndpoint({ endpoint, accessToken }, pages) {
  if (pages.length === 0) {
    console.warn("No documents found for indexing.");
    return;
  }

  const documents = pages.map((page) => ({
    id: page.id,
    data: page.data,
  }));

  const variables = { input: { documents } };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: bulkIndexQuery, variables }),
    });

    if (!response.ok) {
      console.error(
        `Error during bulk indexing: ${response.status} ${response.statusText}`
      );
      return;
    }

    const result = await response.json();

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

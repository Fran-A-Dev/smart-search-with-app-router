import { NextResponse } from "next/server";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import fs from "fs/promises";
import path from "path";

function cleanPath(filePath) {
  return (
    filePath
      .replace(/^\/?src\/pages/, "")
      .replace(/^\/?pages/, "")
      .replace(/\/index\.mdx$/, "")
      .replace(/\.mdx$/, "") || "/"
  );
}

async function searchMdxFiles(query) {
  const docsDir = path.join(process.cwd(), "app/docs");
  const results = [];

  try {
    const searchInDirectory = async (dir, basePath = "/docs") => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await searchInDirectory(fullPath, `${basePath}/${entry.name}`);
        } else if (entry.name === "page.mdx") {
          try {
            const content = await fs.readFile(fullPath, "utf8");

            // Extract metadata
            const metadataMatch = content.match(
              /export\s+const\s+metadata\s*=\s*({[\s\S]*?});/
            );

            let metadata = {};
            if (metadataMatch) {
              try {
                // Simple metadata extraction - look for title
                const titleMatch = metadataMatch[1].match(
                  /title:\s*["']([^"']+)["']/
                );
                if (titleMatch) {
                  metadata.title = titleMatch[1];
                }
              } catch (e) {
                console.warn("Error parsing metadata:", e);
              }
            }

            // Search in title and content
            const searchText = query.toLowerCase();
            const titleMatches = metadata.title
              ?.toLowerCase()
              .includes(searchText);
            const contentMatches = content.toLowerCase().includes(searchText);

            if (titleMatches || contentMatches) {
              results.push({
                id: `mdx:${basePath}`,
                title: metadata.title || entry.name.replace(".mdx", ""),
                path: basePath,
                type: "mdx_doc",
              });
            }
          } catch (error) {
            console.warn(`Error reading MDX file ${fullPath}:`, error);
          }
        }
      }
    };

    await searchInDirectory(docsDir);
    return results;
  } catch (error) {
    console.warn("Error searching MDX files:", error);
    return [];
  }
}

export async function GET(request) {
  const endpoint = process.env.NEXT_PUBLIC_SMART_SEARCH_URL;
  const accessToken = process.env.NEXT_PUBLIC_SMART_SEARCH_ACCESS_TOKEN;
  const wpEndpoint = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required." },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  console.log(`Searching for: "${query}"`);

  // Try the smart search endpoint first
  const smartSearchQuery = `
    query FindDocuments($query: String!) {
      find(query: $query) {
        total
        documents {
          id
          data
        }
      }
    }
  `;

  let smartSearchResults = [];
  let smartSearchWorking = false;

  try {
    console.log("Attempting smart search...");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: smartSearchQuery,
        variables: { query },
      }),
    });

    if (response.ok) {
      const result = await response.json();

      if (!result.errors && result.data?.find?.documents) {
        smartSearchWorking = true;
        console.log(
          `Smart search returned ${result.data.find.documents.length} results`
        );

        const seenIds = new Set();
        for (const content of result.data.find.documents) {
          const contentType =
            content.data.content_type || content.data.post_type || "mdx_doc";
          let item = null;

          if (contentType === "mdx_doc" && content.data.title) {
            const path = content.data.path ? cleanPath(content.data.path) : "/";
            item = {
              id: content.id,
              title: content.data.title,
              path,
              type: "mdx_doc",
            };
          } else if (
            (contentType === "wp_post" || contentType === "post") &&
            content.data.post_title &&
            content.data.post_name
          ) {
            item = {
              id: content.id,
              title: content.data.post_title,
              path: `/blog/${content.data.post_name}`,
              type: "post",
            };
          }

          if (item && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            smartSearchResults.push(item);
          }
        }
      }
    } else {
      console.log(
        `Smart search endpoint returned ${response.status}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.log("Smart search endpoint failed:", error.message);
  }

  // If smart search is working, return those results
  if (smartSearchWorking) {
    return NextResponse.json(smartSearchResults, { status: StatusCodes.OK });
  }

  // Fallback: Search both WordPress posts and local MDX files
  console.log("Falling back to WordPress and MDX search...");

  const allResults = [];

  // Search WordPress posts
  try {
    const wpSearchQuery = `
      query SearchPosts($search: String!) {
        posts(where: { search: $search }, first: 10) {
          nodes {
            id
            title
            slug
            excerpt
          }
        }
      }
    `;

    const wpResponse = await fetch(wpEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: wpSearchQuery,
        variables: { search: query },
      }),
    });

    if (wpResponse.ok) {
      const wpResult = await wpResponse.json();

      if (!wpResult.errors && wpResult.data?.posts?.nodes) {
        const wpResults = wpResult.data.posts.nodes.map((post) => ({
          id: post.id,
          title: post.title,
          path: `/blog/${post.slug}`,
          type: "post",
        }));

        allResults.push(...wpResults);
        console.log(`WordPress search returned ${wpResults.length} results`);
      }
    }
  } catch (wpError) {
    console.error("WordPress search failed:", wpError);
  }

  // Search local MDX files
  try {
    const mdxResults = await searchMdxFiles(query);
    allResults.push(...mdxResults);
    console.log(`MDX search returned ${mdxResults.length} results`);
  } catch (mdxError) {
    console.error("MDX search failed:", mdxError);
  }

  console.log(`Total search results: ${allResults.length}`);
  return NextResponse.json(allResults, { status: StatusCodes.OK });
}

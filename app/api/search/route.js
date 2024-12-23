import { NextResponse } from "next/server";

function cleanPath(filePath) {
  return (
    filePath
      .replace(/^\/?src\/pages/, "")
      .replace(/^\/?pages/, "")
      .replace(/\/index\.mdx$/, "")
      .replace(/\.mdx$/, "") || "/"
  );
}

export async function GET(request) {
  const endpoint = process.env.NEXT_PUBLIC_SEARCH_ENDPOINT;
  const accessToken = process.env.NEXT_SEARCH_ACCESS_TOKEN;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required." },
      { status: 400 }
    );
  }

  const graphqlQuery = `
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

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { query },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      return NextResponse.json({ errors: result.errors }, { status: 500 });
    }

    const formattedResults = result.data.find.documents
      .map((content) => {
        const contentType =
          content.data.content_type || content.data.post_type || "mdx_doc";

        if (contentType === "mdx_doc" && content.data.title) {
          const path = content.data.path ? cleanPath(content.data.path) : "/";
          return {
            id: content.id,
            title: content.data.title,
            path,
            type: "mdx_doc",
          };
        }

        if (
          (contentType === "wp_post" || contentType === "post") &&
          content.data.post_title &&
          content.data.post_name
        ) {
          return {
            id: content.id,
            title: content.data.post_title,
            path: `/blog/${content.data.post_name}`,
            type: "post",
          };
        }

        return null;
      })
      .filter((item) => item !== null);

    const seenIds = new Set();
    const uniqueResults = formattedResults.filter((item) => {
      if (seenIds.has(item.id)) {
        return false;
      }
      seenIds.add(item.id);
      return true;
    });

    return NextResponse.json(uniqueResults);
  } catch (error) {
    console.error("Error fetching search data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

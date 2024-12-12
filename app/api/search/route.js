import { NextResponse } from "next/server";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

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
      { status: StatusCodes.BAD_REQUEST }
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

    if (!response.ok) {
      return NextResponse.json(
        { error: ReasonPhrases.SERVICE_UNAVAILABLE },
        { status: StatusCodes.SERVICE_UNAVAILABLE }
      );
    }

    const result = await response.json();

    if (result.errors) {
      return NextResponse.json(
        { errors: result.errors },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      );
    }

    const seenIds = new Set();
    const formattedResults = [];

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
        formattedResults.push(item);
      }
    }

    return NextResponse.json(formattedResults, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error fetching search data:", error);
    return NextResponse.json(
      { error: ReasonPhrases.INTERNAL_SERVER_ERROR },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

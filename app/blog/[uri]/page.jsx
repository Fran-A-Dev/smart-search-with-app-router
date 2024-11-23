// app/blog/[uri]/page.jsx

import { Suspense } from "react";
import Loading from "../../loading";

// Utility function to fetch the post based on the URI
async function getPost(uri) {
  const query = `
    query GetPostByUri($uri: ID!) {
      post(id: $uri, idType: URI) {
        title
        content
      }
    }
  `;

  const variables = {
    uri,
  };

  const res = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Cache the response for 60 seconds
    next: {
      revalidate: 60,
    },
    body: JSON.stringify({ query, variables }),
  });

  // Handle non-OK responses
  if (!res.ok) {
    console.error(
      `GraphQL query failed with status ${res.status}: ${res.statusText}`
    );
    throw new Error("Failed to fetch the post");
  }

  const responseBody = await res.json();

  if (responseBody && responseBody.data && responseBody.data.post) {
    // Include the URI in the returned post object for key usage
    return {
      ...responseBody.data.post,
      uri,
    };
  } else {
    console.error("GraphQL response does not contain post data:", responseBody);
    throw new Error("Failed to fetch the post");
  }
}

export default async function PostDetails({ params }) {
  // Await the `params` promise before accessing its properties
  const { uri } = await params;

  let post;
  try {
    post = await getPost(uri);
  } catch (error) {
    // Optionally, you can handle the error more gracefully here
    // For example, redirect to a 404 page or display an error message
    // For now, we'll rethrow to let Next.js handle it with its error boundaries
    throw error;
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center py-12">
      <nav className="w-full">
        <h1 className="text-center text-4xl font-bold text-gray-900 mb-8">
          {post.title}
        </h1>
      </nav>
      <Suspense fallback={<Loading />}>
        <div
          key={post.uri} // Ensure `uri` is included in the post object
          className="prose prose-lg mx-auto max-w-3xl text-gray-700 leading-7 px-6"
        >
          {/* Render the post content safely */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </Suspense>
    </main>
  );
}

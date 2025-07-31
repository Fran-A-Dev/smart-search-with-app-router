import { fetchGraphQL } from "@/lib/graphqlClient";
import { GET_FEATURED_POSTS } from "@/lib/queries/posts";
import PostCard from "@/components/PostCard";
import Seo from "@/components/Seo";

export const revalidate = 60; // ISR

async function getAllPosts() {
  try {
    const data = await fetchGraphQL(GET_FEATURED_POSTS, { first: 20 });
    return data?.posts?.nodes || [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <>
      <Seo
        title="All Articles - Smart Search Media"
        description="Browse all articles and posts from Smart Search Media. Discover the latest news, insights, and stories."
        url="/blog"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Page Header */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                All Articles
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Discover our latest articles, insights, and stories covering
                technology, entertainment, and more.
              </p>
              <div className="mt-6">
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm">
                  {posts.length} articles
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-500 dark:text-gray-400">
                  <svg
                    className="mx-auto h-16 w-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">
                    No articles found
                  </h3>
                  <p>There are no articles available at the moment.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

import { fetchGraphQL } from "@/lib/graphqlClient";
import { GET_POSTS_BY_CATEGORY } from "@/lib/queries/categories";
import PostCard from "@/components/PostCard";
import Seo from "@/components/Seo";
import { notFound } from "next/navigation";

export const revalidate = 60; // ISR

async function getCategoryPosts(categorySlug, after = null) {
  try {
    const data = await fetchGraphQL(GET_POSTS_BY_CATEGORY, {
      categorySlug,
      first: 12,
      after,
    });
    return data?.category || null;
  } catch (error) {
    console.error("Error fetching category posts:", error);
    return null;
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const after = searchParams?.after || null;

  const categoryData = await getCategoryPosts(slug, after);

  if (!categoryData) {
    notFound();
  }

  const { name, description, posts } = categoryData;
  const { nodes: postNodes, pageInfo } = posts;

  return (
    <>
      <Seo
        title={`${name} - Smart Search Media`}
        description={
          description || `Browse all articles in the ${name} category`
        }
        url={`/category/${slug}`}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Category Header */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {name}
              </h1>
              {description && (
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  {description}
                </p>
              )}
              <div className="mt-6">
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm">
                  {categoryData.count} articles
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            {postNodes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {postNodes.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Load More Button */}
                {pageInfo.hasNextPage && (
                  <div className="text-center">
                    <a
                      href={`/category/${slug}?after=${pageInfo.endCursor}`}
                      className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
                    >
                      Load More Articles
                      <svg
                        className="ml-2 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </>
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
                  <p>There are no articles in this category yet.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

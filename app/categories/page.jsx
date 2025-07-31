import { fetchGraphQL } from "@/lib/graphqlClient";
import { GET_CATEGORIES } from "@/lib/queries/categories";
import Seo from "@/components/Seo";
import Link from "next/link";

export const revalidate = 60; // ISR

async function getAllCategories() {
  try {
    const data = await fetchGraphQL(GET_CATEGORIES, { first: 20 });
    return data?.categories?.nodes || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <>
      <Seo
        title="All Categories - Smart Search Media"
        description="Browse all content categories on Smart Search Media. Find articles organized by topic and interest."
        url="/categories"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Page Header */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                All Categories
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Explore our content organized by categories. Find articles that
                match your interests and discover new topics.
              </p>
              <div className="mt-6">
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm">
                  {categories.length} categories
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group bg-white dark:bg-gray-800 rounded-lg p-8 text-center hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
                  >
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                        <svg
                          className="w-8 h-8 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      {category.count}{" "}
                      {category.count === 1 ? "article" : "articles"}
                    </div>
                  </Link>
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">
                    No categories found
                  </h3>
                  <p>There are no categories available at the moment.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

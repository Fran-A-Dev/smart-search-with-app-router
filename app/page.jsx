import { fetchGraphQL } from "@/lib/graphqlClient";
import { GET_FEATURED_POSTS } from "@/lib/queries/posts";
import { GET_CATEGORIES } from "@/lib/queries/categories";
import FeaturedHero from "@/components/FeaturedHero";
import PostCard from "@/components/PostCard";
import Seo from "@/components/Seo";
import Link from "next/link";

export const revalidate = 60; // ISR

async function getFeaturedPosts() {
  try {
    const data = await fetchGraphQL(GET_FEATURED_POSTS, { first: 6 });
    return data?.posts?.nodes || [];
  } catch (error) {
    console.error("Error fetching featured posts:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const data = await fetchGraphQL(GET_CATEGORIES, { first: 6 });
    return data?.categories?.nodes || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function Home() {
  const [featuredPosts, categories] = await Promise.all([
    getFeaturedPosts(),
    getCategories(),
  ]);

  const heroPost = featuredPosts[0];
  const trendingPosts = featuredPosts.slice(1, 4);
  const recentPosts = featuredPosts.slice(4);

  return (
    <>
      <Seo
        title="Smart Search Media - Latest News & Articles"
        description="Stay updated with the latest news, articles, and media content. Discover trending stories and explore our comprehensive content library."
        url="/"
      />

      {/* Featured Hero Section */}
      {heroPost && <FeaturedHero post={heroPost} />}

      {/* Trending Section */}
      {trendingPosts.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Trending Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Explore Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {category.count} articles
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts Section */}
      {recentPosts.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Recent Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

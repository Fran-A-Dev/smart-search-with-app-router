import Link from "next/link";
import Image from "next/image";

export default function FeaturedHero({ post }) {
  if (!post) return null;

  const { title, slug, excerpt, date, featuredImage, author, categories } =
    post;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="relative bg-gray-900 text-white overflow-hidden">
      {featuredImage?.node?.sourceUrl && (
        <div className="absolute inset-0">
          <Image
            src={featuredImage.node.sourceUrl}
            alt={featuredImage.node.altText || title}
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        </div>
      )}

      <div className="relative container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-4xl">
          {categories?.nodes?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.nodes.slice(0, 3).map((category) => (
                <span
                  key={category.slug}
                  className="inline-block bg-blue-600 text-white text-sm px-3 py-1 rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            <Link
              href={`/blog/${slug}`}
              className="hover:text-blue-400 transition-colors"
            >
              {title}
            </Link>
          </h1>

          {excerpt && (
            <div
              className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-300">
            {author?.node?.name && (
              <div className="flex items-center">
                <span className="text-lg">By {author.node.name}</span>
              </div>
            )}
            <div className="hidden sm:block w-1 h-1 bg-gray-500 rounded-full" />
            <time dateTime={date} className="text-lg">
              {formatDate(date)}
            </time>
          </div>

          <div className="mt-8">
            <Link
              href={`/blog/${slug}`}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
            >
              Read Full Article
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

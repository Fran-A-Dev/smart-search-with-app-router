import Link from "next/link";
import Image from "next/image";

export default function PostCard({ post }) {
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
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {featuredImage?.node?.sourceUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={featuredImage.node.sourceUrl}
            alt={featuredImage.node.altText || title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {categories?.nodes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.nodes.slice(0, 2).map((category) => (
              <span
                key={category.slug}
                className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-xl font-semibold mb-3 line-clamp-2">
          <Link
            href={`/blog/${slug}`}
            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {title}
          </Link>
        </h3>

        {excerpt && (
          <div
            className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            {author?.node?.name && <span>By {author.node.name}</span>}
          </div>
          <time dateTime={date}>{formatDate(date)}</time>
        </div>
      </div>
    </article>
  );
}

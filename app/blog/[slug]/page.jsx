import { fetchGraphQL } from "@/lib/graphqlClient";
import { GET_POST_BY_SLUG, GET_RELATED_POSTS } from "@/lib/queries/posts";
import RelatedContent from "@/components/RelatedContent";
import MediaPlayer from "@/components/MediaPlayer";
import Seo from "@/components/Seo";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 60; // ISR

async function getPost(slug) {
  try {
    const data = await fetchGraphQL(GET_POST_BY_SLUG, { slug });
    return data?.post || null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

async function getRelatedPosts(categoryIds, excludeId) {
  try {
    const data = await fetchGraphQL(GET_RELATED_POSTS, {
      categoryIn: categoryIds,
      notIn: [excludeId],
      first: 3,
    });
    return data?.posts?.nodes || [];
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return [];
  }
}

function extractMediaFromContent(content) {
  const mediaItems = [];

  // Extract YouTube videos
  const youtubeRegex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/g;
  let match;
  while ((match = youtubeRegex.exec(content)) !== null) {
    mediaItems.push({
      type: "youtube",
      src: match[1],
      title: "YouTube Video",
    });
  }

  // Extract Vimeo videos
  const vimeoRegex = /vimeo\.com\/(\d+)/g;
  while ((match = vimeoRegex.exec(content)) !== null) {
    mediaItems.push({
      type: "vimeo",
      src: match[1],
      title: "Vimeo Video",
    });
  }

  return mediaItems;
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const categoryIds = post.categories?.nodes?.map((cat) => cat.id) || [];
  const relatedPosts = await getRelatedPosts(categoryIds, post.id);

  const mediaItems = extractMediaFromContent(post.content);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const shareUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  }/blog/${slug}`;

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt?.replace(/<[^>]*>/g, "") || ""}
        image={post.featuredImage?.node?.sourceUrl}
        url={`/blog/${slug}`}
        type="article"
        publishedTime={post.date}
        author={post.author?.node?.name}
        tags={post.tags?.nodes?.map((tag) => tag.name) || []}
      />

      <article className="min-h-screen bg-white dark:bg-gray-900">
        {/* Article Header */}
        <header className="relative">
          {post.featuredImage?.node?.sourceUrl && (
            <div className="relative h-96 lg:h-[500px] w-full">
              <Image
                src={post.featuredImage.node.sourceUrl}
                alt={post.featuredImage.node.altText || post.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
              {/* Categories */}
              {post.categories?.nodes?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.categories.nodes.map((category) => (
                    <a
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-full transition-colors"
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              )}

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <div
                  className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.excerpt }}
                />
              )}

              {/* Author and Date */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600 dark:text-gray-400 mb-8">
                {post.author?.node?.name && (
                  <div className="flex items-center">
                    <span className="text-lg">By {post.author.node.name}</span>
                  </div>
                )}
                <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full" />
                <time dateTime={post.date} className="text-lg">
                  {formatDate(post.date)}
                </time>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-gray-600 dark:text-gray-400">Share:</span>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    shareUrl
                  )}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800 transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Media Items */}
            {mediaItems.length > 0 && (
              <div className="mb-12 space-y-8">
                {mediaItems.map((media, index) => (
                  <MediaPlayer
                    key={index}
                    src={media.src}
                    type={media.type}
                    title={media.title}
                  />
                ))}
              </div>
            )}

            {/* Article Body */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags?.nodes?.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.nodes.map((tag) => (
                    <span
                      key={tag.slug}
                      className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Related Content */}
      {relatedPosts.length > 0 && (
        <RelatedContent posts={relatedPosts} title="Related Articles" />
      )}
    </>
  );
}

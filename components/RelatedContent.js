import PostCard from "./PostCard";

export default function RelatedContent({ posts, title = "Related Articles" }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

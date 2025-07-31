import { fetchGraphQL } from "@/lib/graphqlClient";
import { GET_FEATURED_POSTS } from "@/lib/queries/posts";
import PostCard from "@/components/PostCard";
import MediaPlayer from "@/components/MediaPlayer";
import Seo from "@/components/Seo";

export const revalidate = 60; // ISR

async function getVideoPosts() {
  try {
    // In a real implementation, you would filter by video category or custom post type
    const data = await fetchGraphQL(GET_FEATURED_POSTS, { first: 12 });
    return data?.posts?.nodes || [];
  } catch (error) {
    console.error("Error fetching video posts:", error);
    return [];
  }
}

function extractVideoFromContent(content) {
  // Extract YouTube videos
  const youtubeRegex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/g;
  const match = youtubeRegex.exec(content);
  if (match) {
    return {
      type: "youtube",
      src: match[1],
      title: "Featured Video",
    };
  }

  // Extract Vimeo videos
  const vimeoRegex = /vimeo\.com\/(\d+)/g;
  const vimeoMatch = vimeoRegex.exec(content);
  if (vimeoMatch) {
    return {
      type: "vimeo",
      src: vimeoMatch[1],
      title: "Featured Video",
    };
  }

  return null;
}

export default async function VideosPage() {
  const posts = await getVideoPosts();

  // Filter posts that contain video content
  const videoPosts = posts.filter((post) => {
    const video = extractVideoFromContent(post.content);
    return video !== null;
  });

  const featuredVideo = videoPosts[0]
    ? extractVideoFromContent(videoPosts[0].content)
    : null;

  return (
    <>
      <Seo
        title="Videos - Smart Search Media"
        description="Watch our latest video content, tutorials, and media coverage"
        url="/videos"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Videos Header */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Videos
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Discover our latest video content, tutorials, interviews, and
                multimedia stories
              </p>
            </div>
          </div>
        </section>

        {/* Featured Video */}
        {featuredVideo && (
          <section className="py-16 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Featured Video
              </h2>
              <div className="max-w-4xl mx-auto">
                <MediaPlayer
                  src={featuredVideo.src}
                  type={featuredVideo.type}
                  title={featuredVideo.title}
                />
                {videoPosts[0] && (
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                      {videoPosts[0].title}
                    </h3>
                    {videoPosts[0].excerpt && (
                      <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {videoPosts[0].excerpt.replace(/<[^>]*>/g, "")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Video Categories */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Video Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { name: "Tutorials", count: "12 videos", icon: "🎓" },
                { name: "Interviews", count: "8 videos", icon: "🎤" },
                { name: "News", count: "15 videos", icon: "📺" },
                { name: "Behind the Scenes", count: "6 videos", icon: "🎬" },
              ].map((category) => (
                <div
                  key={category.name}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Videos */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Latest Videos
            </h2>

            {videoPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videoPosts.slice(1).map((post) => (
                  <div key={post.id} className="relative">
                    <PostCard post={post} />
                    <div className="absolute top-4 right-4">
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12l-6-4h12l-6 4z" />
                        </svg>
                        Video
                      </span>
                    </div>
                  </div>
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">
                    No videos available
                  </h3>
                  <p>Check back soon for new video content.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

import { fetchGraphQL } from "@/lib/graphqlClient";
import { GET_FEATURED_POSTS } from "@/lib/queries/posts";
import PostCard from "@/components/PostCard";
import MediaPlayer from "@/components/MediaPlayer";
import Seo from "@/components/Seo";

export const revalidate = 60; // ISR

async function getPodcastPosts() {
  try {
    // In a real implementation, you would filter by podcast category or custom post type
    const data = await fetchGraphQL(GET_FEATURED_POSTS, { first: 12 });
    return data?.posts?.nodes || [];
  } catch (error) {
    console.error("Error fetching podcast posts:", error);
    return [];
  }
}

function extractAudioFromContent(content) {
  // Extract audio file URLs (mp3, wav, ogg)
  const audioRegex = /(https?:\/\/[^\s]+\.(mp3|wav|ogg))/gi;
  const match = audioRegex.exec(content);
  if (match) {
    return {
      type: "audio",
      src: match[1],
      title: "Podcast Episode",
    };
  }

  // Extract Spotify podcast embeds
  const spotifyRegex = /spotify\.com\/embed\/episode\/([a-zA-Z0-9]+)/g;
  const spotifyMatch = spotifyRegex.exec(content);
  if (spotifyMatch) {
    return {
      type: "spotify",
      src: spotifyMatch[1],
      title: "Spotify Podcast",
    };
  }

  return null;
}

export default async function PodcastsPage() {
  const posts = await getPodcastPosts();

  // Filter posts that contain audio content or are tagged as podcasts
  const podcastPosts = posts.filter((post) => {
    const audio = extractAudioFromContent(post.content);
    const isPodcast = post.categories?.nodes?.some(
      (cat) =>
        cat.name.toLowerCase().includes("podcast") ||
        cat.name.toLowerCase().includes("audio")
    );
    return audio !== null || isPodcast;
  });

  const featuredPodcast = podcastPosts[0]
    ? extractAudioFromContent(podcastPosts[0].content)
    : null;

  return (
    <>
      <Seo
        title="Podcasts - Smart Search Media"
        description="Listen to our latest podcast episodes, interviews, and audio content"
        url="/podcasts"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Podcasts Header */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Podcasts
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Listen to our latest podcast episodes, expert interviews, and
                in-depth audio discussions
              </p>
            </div>
          </div>
        </section>

        {/* Featured Podcast */}
        {featuredPodcast && (
          <section className="py-16 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Featured Episode
              </h2>
              <div className="max-w-4xl mx-auto">
                <MediaPlayer
                  src={featuredPodcast.src}
                  type={featuredPodcast.type}
                  title={featuredPodcast.title}
                />
                {podcastPosts[0] && (
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                      {podcastPosts[0].title}
                    </h3>
                    {podcastPosts[0].excerpt && (
                      <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {podcastPosts[0].excerpt.replace(/<[^>]*>/g, "")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Podcast Categories */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Podcast Series
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {[
                {
                  name: "Tech Talk",
                  count: "24 episodes",
                  icon: "💻",
                  description: "Latest in technology and innovation",
                },
                {
                  name: "Expert Interviews",
                  count: "18 episodes",
                  icon: "🎙️",
                  description: "Conversations with industry leaders",
                },
                {
                  name: "News Deep Dive",
                  count: "32 episodes",
                  icon: "📰",
                  description: "In-depth analysis of current events",
                },
              ].map((series) => (
                <div
                  key={series.name}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <div className="text-4xl mb-4">{series.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-xl">
                    {series.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {series.description}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {series.count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscribe Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Subscribe to Our Podcast
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Never miss an episode. Subscribe on your favorite podcast
              platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: "Apple Podcasts", icon: "🎧" },
                { name: "Spotify", icon: "🎵" },
                { name: "Google Podcasts", icon: "🎙️" },
                { name: "RSS Feed", icon: "📡" },
              ].map((platform) => (
                <a
                  key={platform.name}
                  href="#"
                  className="bg-white hover:bg-gray-100 text-blue-600 font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2">{platform.icon}</span>
                  {platform.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Episodes */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Latest Episodes
            </h2>

            {podcastPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {podcastPosts.slice(1).map((post) => (
                  <div key={post.id} className="relative">
                    <PostCard post={post} />
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                        Podcast
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
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">
                    No podcast episodes available
                  </h3>
                  <p>Check back soon for new podcast content.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

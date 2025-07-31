"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { smartSearch } from "@/lib/smartSearch";
import { fetchGraphQL } from "@/lib/graphqlClient";
import { SEARCH_POSTS } from "@/lib/queries/search";
import PostCard from "@/components/PostCard";
import Seo from "@/components/Seo";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [smartResults, setSmartResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState("graphql");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      if (searchType === "graphql") {
        // GraphQL search
        const data = await fetchGraphQL(SEARCH_POSTS, {
          search: searchQuery,
          first: 20,
        });
        setResults(data?.posts?.nodes || []);
        setSmartResults([]);
      } else {
        // Smart Search
        const smartData = await smartSearch(searchQuery);
        setSmartResults(smartData?.results || []);
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setSmartResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    if (query) {
      performSearch(query);
    }
  };

  const totalResults = results.length + smartResults.length;

  return (
    <>
      <Seo
        title={
          query
            ? `Search results for "${query}"`
            : "Search - Smart Search Media"
        }
        description={
          query
            ? `Find articles and content related to "${query}"`
            : "Search our comprehensive content library"
        }
        url={`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Search Header */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                {query ? `Search Results` : "Search"}
              </h1>

              {query && (
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  {hasSearched
                    ? isLoading
                      ? "Searching..."
                      : `Found ${totalResults} result${
                          totalResults !== 1 ? "s" : ""
                        } for "${query}"`
                    : `Searching for "${query}"`}
                </p>
              )}

              {/* Search Type Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                  <button
                    onClick={() => handleSearchTypeChange("graphql")}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      searchType === "graphql"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Standard Search
                  </button>
                  <button
                    onClick={() => handleSearchTypeChange("smart")}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      searchType === "smart"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Smart Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Results */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : hasSearched ? (
              totalResults > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* GraphQL Results */}
                  {results.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}

                  {/* Smart Search Results */}
                  {smartResults.map((result, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                            Smart Result
                          </span>
                          {result.score && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.round(result.score * 100)}% match
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                          <a
                            href={result.url || "#"}
                            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {result.title}
                          </a>
                        </h3>

                        {result.excerpt && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                            {result.excerpt}
                          </p>
                        )}

                        {result.metadata && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {result.metadata.author && (
                              <span>By {result.metadata.author}</span>
                            )}
                            {result.metadata.date && (
                              <span className="ml-2">
                                {new Date(
                                  result.metadata.date
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">
                      No results found
                    </h3>
                    <p>
                      Try adjusting your search terms or using different
                      keywords.
                    </p>
                  </div>
                </div>
              )
            ) : query ? (
              <div className="text-center py-16">
                <p className="text-gray-600 dark:text-gray-400">
                  Press Enter or click search to find results.
                </p>
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">
                    Start your search
                  </h3>
                  <p>Use the search bar above to find articles and content.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

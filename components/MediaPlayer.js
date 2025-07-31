"use client";

import { useState } from "react";

export default function MediaPlayer({ src, type = "video", poster, title }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>Unable to load media content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {type === "video" ? (
        <video
          className="w-full h-auto"
          controls
          poster={poster}
          onLoadedData={handleLoad}
          onError={handleError}
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
          <source src={src} type="video/webm" />
          <source src={src} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      ) : type === "audio" ? (
        <div className="p-6">
          {title && (
            <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
          )}
          <audio
            className="w-full"
            controls
            onLoadedData={handleLoad}
            onError={handleError}
            preload="metadata"
          >
            <source src={src} type="audio/mpeg" />
            <source src={src} type="audio/ogg" />
            <source src={src} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : type === "youtube" ? (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${src}`}
            title={title || "YouTube video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
          ></iframe>
        </div>
      ) : type === "vimeo" ? (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://player.vimeo.com/video/${src}`}
            title={title || "Vimeo video"}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
          ></iframe>
        </div>
      ) : null}
    </div>
  );
}

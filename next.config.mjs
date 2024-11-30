import { env } from "node:process";
import createMDX from "@next/mdx";
import { transformerNotationDiff } from "@shikijs/transformers";
import { createSecureHeaders } from "next-secure-headers";
import rehypeMdxImportMedia from "rehype-mdx-import-media";
import { rehypePrettyCode } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import smartSearchPlugin from "./lib/smart-search-plugin.mjs";

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  sassOptions: {
    includePaths: ["node_modules"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_WORDPRESS_HOSTNAME,
        pathname: "/**",
      },
    ],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: createSecureHeaders({
          xssProtection: false,
        }),
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        smartSearchPlugin({
          endpoint: env.NEXT_PUBLIC_SEARCH_ENDPOINT,
          accessToken: env.NEXT_SEARCH_ACCESS_TOKEN,
        })
      );
    }

    return config;
  },
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      rehypeMdxImportMedia,
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          transformers: [transformerNotationDiff()],
          theme: "github-dark-dimmed",
          defaultLang: "plaintext",
          bypassInlineCode: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);

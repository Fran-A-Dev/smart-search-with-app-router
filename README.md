# Smart Search Headless WP Demo

This is a demo site that displays pages from both **WordPress posts** and **MDX pages** (docs) when searched for. It leverages **WP Engine's Smart Search Plugin**, **WPGraphQL**, and **Next.js 15 App Router** to provide a headless WordPress search experience.

## 🛠️ Features

- **Unified Search:** Search across WordPress posts and MDX documentation.
- **Headless Architecture:** Utilizes Next.js 15 App Router for a modern, scalable frontend.
- **Powerful Search Backend:** Integrates with WP Engine's Smart Search Plugin and WPGraphQL for search capabilities.

## 📋 Requirements

Before setting up the project, ensure you have the following:

1. **WP Engine Account with Smart Search:**

   - Sign up for a [WP Engine](https://wpengine.com/) account.
   - Ensure the **Smart Search Plugin** is enabled on your WordPress installation.

2. **WPGraphQL Plugin:**

   - Install and activate the [WPGraphQL](https://www.wpgraphql.com/) plugin on your WordPress site to provide a GraphQL API.

3. **WordPress Installation:**

   - A running WordPress site with posts and MDX pages (docs) that you want to include in the search.

4. **Environment Variables:**
   - You'll need to configure specific environment variables to connect your Next.js application with WordPress and WP Engine's Smart Search.

## 🚀 Installation

Follow these steps to set up the project locally:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/smart-search-headless-wp-demo.git
   cd smart-search-headless-wp-demo
   ```

Install Dependencies:

Ensure you have Node.js installed. Then, install the necessary packages:
`npm install`

Create a .env.local file in the root directory of the project and add the following variables:

```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=your_graphql_endpoint
NEXT_PUBLIC_WORDPRESS_HOSTNAME=your_wordpress_hostname
NEXT_PUBLIC_SEARCH_ENDPOINT=your_search_endpoint
NEXT_SEARCH_ACCESS_TOKEN=your_search_access_token
```

NEXT_PUBLIC_GRAPHQL_ENDPOINT: The GraphQL endpoint provided by WPGraphQL (e.g., https://your-site.com/graphql).

NEXT_PUBLIC_WORDPRESS_HOSTNAME: The hostname of your WordPress site (e.g., your-site.com).

NEXT_PUBLIC_SEARCH_ENDPOINT: The endpoint for WP Engine's Smart Search API.

NEXT_SEARCH_ACCESS_TOKEN: Your access token for authenticating with the Smart Search API.

Start the Next.js development server:

`npm run dev`

Open http://localhost:3000 in your browser to view the app and search

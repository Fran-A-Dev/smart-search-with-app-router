# Smart Search Headless WordPress Media Site Demo

This is a **demo example of a headless WordPress media site** that showcases how to build a modern content platform with advanced search capabilities. The site displays and searches across **WordPress posts**, **videos**, **podcasts**, and **MDX documentation pages**. It leverages **WP Engine's Smart Search Plugin**, **WPGraphQL**, and **Next.js 15 App Router** to provide a comprehensive headless WordPress media experience with intelligent search functionality.

## 🎯 Demo Purpose

This project serves as a **reference implementation** for developers looking to build:

- Headless WordPress media sites with multiple content types
- Advanced search functionality across diverse content formats
- Modern React-based frontends with WordPress backends
- Scalable content platforms using Next.js App Router

## 🛠️ Features

- **Unified Media Search:** Search across WordPress posts, videos, podcasts, and MDX documentation
- **Headless Architecture:** Utilizes Next.js 15 App Router for a modern, scalable frontend
- **Powerful Search Backend:** Integrates with WP Engine's Smart Search Plugin and WPGraphQL for search capabilities
- **Fallback Search:** Gracefully falls back to WordPress GraphQL and local MDX search if Smart Search is unavailable
- **Multiple Content Types:** Supports blog posts, categories, videos, podcasts, and documentation pages
- **Media Player Integration:** Built-in media player components for video and podcast content
- **SEO Optimized:** Built-in SEO components and metadata handling
- **Responsive Design:** Mobile-first design with Tailwind CSS
- **Content Management:** Easy content management through WordPress admin

## 📋 Requirements

Before setting up the project, ensure you have the following:

### 1. WordPress Backend Requirements

- **WP Engine Account with Smart Search:**

  - Sign up for a [WP Engine](https://wpengine.com/) account
  - Ensure the **Smart Search Plugin** is enabled on your WordPress installation

- **WPGraphQL Plugin:**

  - Install and activate the [WPGraphQL](https://www.wpgraphql.com/) plugin on your WordPress site
  - This provides the GraphQL API endpoint for content queries

- **WordPress Content:**
  - WordPress posts with titles, content, and slugs
  - Media content (videos, podcasts, audio files)
  - Categories (optional but recommended)
  - Featured images for posts (optional)
  - Custom post types for different media formats

### 2. Development Environment

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Fran-A-Dev/smart-search-with-app-router.git
cd smart-search-with-app-router
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# WordPress GraphQL Endpoint
NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql

# WordPress Hostname
NEXT_PUBLIC_WORDPRESS_HOSTNAME=https://your-wordpress-site.com

# WP Engine Smart Search Configuration
NEXT_PUBLIC_SMART_SEARCH_URL=https://your-smart-search-endpoint.com/graphql
NEXT_PUBLIC_SMART_SEARCH_ACCESS_TOKEN=your-smart-search-access-token

# Site URL (for development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. WordPress Backend Configuration

#### Required WordPress Data:

1. **Posts Structure:**

   - Each post should have: `title`, `content`, `slug`, `excerpt`
   - Posts should be published and publicly accessible
   - Categories can be assigned to posts for better organization
   - Media attachments (for video/podcast posts)

2. **Media Content:**

   - Video posts with embedded media or media URLs
   - Podcast episodes with audio file attachments
   - Proper media metadata (duration, file size, etc.)

3. **WPGraphQL Setup:**

   - Ensure WPGraphQL is activated and accessible at `/graphql`
   - Test your GraphQL endpoint by visiting `https://your-site.com/graphql` in a browser
   - Verify that posts, categories, and media attachments are queryable

4. **Smart Search Plugin:**
   - Configure the Smart Search plugin in your WP Engine dashboard
   - Obtain your Smart Search GraphQL endpoint URL
   - Generate an access token for API authentication
   - Ensure media content is indexed for search

#### Getting Your WordPress Data:

**GraphQL Endpoint:**

- Usually located at: `https://your-wordpress-site.com/graphql`
- Test it by running a simple query in the GraphQL IDE

**Smart Search Configuration:**

- Log into your WP Engine dashboard
- Navigate to Smart Search settings
- Copy the GraphQL endpoint URL (usually ends with `/graphql`)
- Generate or copy your access token

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🔧 Configuration Details

### Customizing Site Information

**Site Title (Browser Tab):**
To change the title that appears in browser tabs, edit the `metadata` object in `app/layout.jsx`:

```javascript
export const metadata = {
  title: "Your Site Title Here", // This appears in browser tabs
  description: "Your site description",
};
```

**Site Branding:**

- Update the footer text in `app/layout.jsx`
- Modify navigation branding in `components/nav-bar.jsx`
- Customize SEO metadata in individual page components

### Environment Variables Explained

| Variable                                 | Description                             | Example                                   |
| ---------------------------------------- | --------------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT` | Your WordPress GraphQL API endpoint     | `https://mysite.com/graphql`              |
| `NEXT_PUBLIC_WORDPRESS_HOSTNAME`         | Your WordPress site hostname            | `https://mysite.com`                      |
| `NEXT_PUBLIC_SMART_SEARCH_URL`           | WP Engine Smart Search GraphQL endpoint | `https://search-endpoint.run.app/graphql` |
| `NEXT_PUBLIC_SMART_SEARCH_ACCESS_TOKEN`  | Authentication token for Smart Search   | `your-token-here`                         |
| `NEXT_PUBLIC_SITE_URL`                   | Your Next.js site URL                   | `http://localhost:3000`                   |

### WordPress Content Requirements

The application expects your WordPress posts to have the following structure:

```graphql
{
  posts {
    nodes {
      id
      title
      slug
      excerpt
      content
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
    }
  }
}
```

## 📁 Project Structure

```
├── app/                    # Next.js 15 App Router pages
│   ├── api/search/        # Search API route
│   ├── blog/              # Blog post pages
│   ├── categories/        # Category listing
│   ├── category/[slug]/   # Individual category pages
│   ├── docs/              # MDX documentation pages
│   ├── podcasts/          # Podcast pages
│   ├── search/            # Search results page
│   └── videos/            # Video pages
├── components/            # Reusable React components
├── lib/                   # Utility functions and API clients
│   ├── graphqlClient.js   # WordPress GraphQL client
│   ├── smartSearch.js     # Smart Search API client
│   └── queries/           # GraphQL queries
└── public/                # Static assets
```

## 🔍 Search Functionality

The application implements a three-tier search strategy:

1. **Primary:** WP Engine Smart Search (if configured and available)
2. **Secondary:** WordPress GraphQL search (fallback)
3. **Tertiary:** Local MDX file search (for documentation)

### Testing Search

1. Navigate to the search page or use the search bar
2. Try searching for content that exists in your WordPress posts
3. Test searching for video and podcast content
4. Test with MDX documentation content
5. Verify that results link correctly to their respective pages
6. Test media player functionality on video/podcast pages

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Update your production environment variables:

```env
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
# ... other variables remain the same
```

## 🛠️ Troubleshooting

### Common Issues

1. **GraphQL Endpoint Not Working:**

   - Verify WPGraphQL plugin is activated
   - Check that your WordPress site is accessible
   - Test the endpoint directly in a browser

2. **Smart Search Not Returning Results:**

   - Verify your access token is correct
   - Check that the Smart Search plugin is properly configured
   - The app will fallback to WordPress search automatically

3. **Posts Not Displaying:**

   - Ensure posts are published in WordPress
   - Check that post slugs are properly formatted
   - Verify GraphQL queries are returning data

4. **Build Errors:**
   - Ensure all environment variables are set
   - Check that Node.js version is 18 or higher
   - Clear node_modules and reinstall dependencies

### Debug Mode

To enable detailed logging, check the browser console and server logs when running in development mode.

## 📚 Additional Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [WPGraphQL Documentation](https://www.wpgraphql.com/docs/)
- [WP Engine Smart Search](https://wpengine.com/smart-search/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

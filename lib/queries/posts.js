// GraphQL queries for posts - featured content, single post, related content

// Fragment for common post fields
export const POST_FIELDS = `
  fragment PostFields on Post {
    id
    title
    slug
    date
    excerpt
    content
    featuredImage {
      node {
        sourceUrl
        altText
      }
    }
    author {
      node {
        name
        slug
      }
    }
    categories {
      nodes {
        name
        slug
      }
    }
    tags {
      nodes {
        name
        slug
      }
    }
  }
`;

// Query for featured content
export const GET_FEATURED_POSTS = `
  query GetFeaturedPosts($first: Int = 6) {
    posts(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...PostFields
      }
    }
  }
  ${POST_FIELDS}
`;

// Query for single post by slug
export const GET_POST_BY_SLUG = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ...PostFields
    }
  }
  ${POST_FIELDS}
`;

// Query for related content based on categories
export const GET_RELATED_POSTS = `
  query GetRelatedPosts($categoryIn: [ID], $notIn: [ID], $first: Int = 3) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        categoryIn: $categoryIn
        notIn: $notIn
      }
    ) {
      nodes {
        ...PostFields
      }
    }
  }
  ${POST_FIELDS}
`;

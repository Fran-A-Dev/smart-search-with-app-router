// GraphQL queries for categories - category listing with pagination

// Fragment for category fields
export const CATEGORY_FIELDS = `
  fragment CategoryFields on Category {
    id
    name
    slug
    description
    count
  }
`;

// Query for category listing with pagination
export const GET_CATEGORIES = `
  query GetCategories($first: Int = 10, $after: String) {
    categories(first: $first, after: $after, where: { hideEmpty: true }) {
      nodes {
        ...CategoryFields
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        startCursor
      }
    }
  }
  ${CATEGORY_FIELDS}
`;

// Query for posts by category with pagination
export const GET_POSTS_BY_CATEGORY = `
  query GetPostsByCategory($categorySlug: ID!, $first: Int = 10, $after: String) {
    category(id: $categorySlug, idType: SLUG) {
      ...CategoryFields
      posts(first: $first, after: $after, where: { status: PUBLISH }) {
        nodes {
          id
          title
          slug
          date
          excerpt
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
              id
              name
              slug
            }
          }
          tags {
            nodes {
              id
              name
              slug
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
      }
    }
  }
  ${CATEGORY_FIELDS}
`;

// GraphQL and Smart Search queries for search functionality

// Fragment for search result fields
export const SEARCH_RESULT_FIELDS = `
  fragment SearchResultFields on Post {
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
        name
        slug
      }
    }
  }
`;

// GraphQL query for full-text search
export const SEARCH_POSTS = `
  query SearchPosts($search: String!, $first: Int = 10, $after: String) {
    posts(
      first: $first
      after: $after
      where: {
        search: $search
        status: PUBLISH
      }
    ) {
      nodes {
        ...SearchResultFields
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        startCursor
      }
    }
  }
  ${SEARCH_RESULT_FIELDS}
`;

// Smart Search payload for similarity-based search
export const SMART_SEARCH_PAYLOAD = {
  query: "",
  filters: {
    content_type: "post",
    status: "publish",
  },
  options: {
    similarity_threshold: 0.7,
    max_results: 10,
    include_content: true,
    include_metadata: true,
  },
};

// Smart Search payload for related content
export const RELATED_CONTENT_PAYLOAD = {
  query: "",
  filters: {
    content_type: "post",
    status: "publish",
    exclude_ids: [],
  },
  options: {
    similarity_threshold: 0.6,
    max_results: 5,
    include_content: false,
    include_metadata: true,
    search_type: "semantic",
  },
};

import { GraphQLClient, gql } from 'graphql-request';

let API_URL = process.env.WORDPRESS_API_URL || 'http://melanie-archive-backend.local/graphql';

// Parse API_URL to ensure /graphql is appended if missing
if (API_URL && !API_URL.endsWith('/graphql')) {
  API_URL = API_URL.replace(/\/$/, '') + '/graphql';
}

const graphQLClient = new GraphQLClient(API_URL);

export async function fetchWordPressPosts() {
  const query = gql`
    query GetPosts {
      posts(first: 100) {
        nodes {
          id
          title
          content
          date
          slug
          featuredImage {
            node {
              sourceUrl
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
            }
          }
        }
      }
    }
  `;

  try {
    const data = await graphQLClient.request(query);
    return data.posts.nodes || [];
  } catch (error) {
    console.warn("WPGraphQL fetch failed. Falling back to empty array [] for offline resiliency:", error.message || error);
    return [];
  }
}

export async function fetchWordPressPostBySlug(slug) {
  const query = gql`
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        title
        content
        date
        slug
        featuredImage {
          node {
            sourceUrl
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
          }
        }
      }
    }
  `;

  try {
    const data = await graphQLClient.request(query, { slug });
    return data.post;
  } catch (error) {
    console.warn(`WPGraphQL single fetch failed for slug: ${slug}. Falling back to null:`, error.message || error);
    return null;
  }
}

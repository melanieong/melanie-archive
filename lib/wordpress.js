import { GraphQLClient, gql } from 'graphql-request';

const API_URL = process.env.WORDPRESS_API_URL || 'http://melanie-archive-backend.local/graphql';

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
    return data.posts.nodes;
  } catch (error) {
    console.warn("WPGraphQL fetch failed, using local offline fallback projects:", error.message || error);
    // Beautiful mock posts mapping exactly to WPGraphQL nodes structure
    return [
      {
        id: "1",
        title: "Learning to be a YouTuber",
        slug: "learning-to-be-a-youtuber",
        date: "2026-01-12T00:00:00",
        content: "<p>Finally unboxing the Sony A7CII and setting up the Elgato key lights. First impressions of the 'studio' space.</p><p>A comprehensive log of the journey from zero subscribers to a sustainable creative outlet. Documenting gear setup, scripting frameworks, and the emotional roller coaster of public creation.</p>",
        categories: { nodes: [{ name: "Video" }, { name: "Featured" }] },
        featuredImage: { node: { sourceUrl: "https://images.unsplash.com/photo-1626379953822-baec19c3bbcd?auto=format&fit=crop&w=800&q=80" } }
      },
      {
        id: "2",
        title: "Classical Drawing Skills",
        slug: "classical-drawing-skills",
        date: "2026-02-19T00:00:00",
        content: "<p>A 365-day challenge focusing on human anatomy and urban sketching using traditional media.</p><p>A meticulous exploration of charcoal, graphite, and raw media over a consecutive 365-day tracking cycle. Focus is placed on structural anatomy, architectural forms under ambient lighting, and developing muscle memory for dynamic gestures.</p>",
        categories: { nodes: [{ name: "Drawing" }, { name: "Featured" }] },
        featuredImage: { node: { sourceUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80" } }
      },
      {
        id: "3",
        title: "Identity Systems",
        slug: "identity-systems",
        date: "2026-03-22T00:00:00",
        content: "<p>Exploring how visual rhythm and color blocking define the flagship experience in digital products.</p><p>Analyzing and defining modern branding through clean typography, modular grids, and tactile physical elements. Translating structural monographs into high-fidelity web and product layouts.</p>",
        categories: { nodes: [{ name: "Design" }, { name: "Featured" }] },
        featuredImage: { node: { sourceUrl: "https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?auto=format&fit=crop&w=800&q=80" } }
      },
      {
        id: "4",
        title: "Retail Rituals",
        slug: "retail-rituals",
        date: "2026-04-10T00:00:00",
        content: "<p>A photographic essay on the sensory details of physical flagship stores and their impact on customer dwell time.</p><p>Documenting spatial volume, lighting dynamics, and texture variations in high-end design environments. This project captures the interaction between humans and minimalist spaces.</p>",
        categories: { nodes: [{ name: "Photography" }, { name: "Ongoing" }] },
        featuredImage: { node: { sourceUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80" } }
      },
      {
        id: "5",
        title: "Space & Volume",
        slug: "space-and-volume",
        date: "2026-05-12T00:00:00",
        content: "<p>Studying the intersection of brutalist architecture and organic materials in modern workspace design.</p><p>An extensive visual study of concrete monoliths contrasted with lush green spaces, analyzing how structural scale can evoke peace, focus, and modern design excellence.</p>",
        categories: { nodes: [{ name: "Architecture" }, { name: "Archived" }] },
        featuredImage: { node: { sourceUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" } }
      }
    ];
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
    console.warn(`WPGraphQL single fetch failed for slug: ${slug}, fallback to mock match:`);
    const posts = await fetchWordPressPosts();
    return posts.find(p => p.slug === slug) || null;
  }
}

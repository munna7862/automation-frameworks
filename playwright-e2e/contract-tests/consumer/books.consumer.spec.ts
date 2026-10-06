import axios from 'axios';
import { createPactProvider, MatchersV3 } from './pact.setup';

/**
 * CT-PACT-001 & CT-PACT-002: Books Catalog & Book Detail Consumer Contracts
 */
export async function runBooksConsumerTests(): Promise<void> {
  const provider = createPactProvider();

  console.log('🧪 Executing CT-PACT-001: Books Catalog Consumer Contract...');
  await provider
    .addInteraction({
      states: [{ description: 'books exist in catalog' }],
      uponReceiving: 'a request for books catalog with pagination',
      withRequest: {
        method: 'GET',
        path: '/api/books',
        query: {
          page: '1',
          limit: '8'
        }
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': MatchersV3.regex('^application/json.*', 'application/json; charset=utf-8')
        },
        body: {
          books: MatchersV3.eachLike({
            id: MatchersV3.string('1'),
            title: MatchersV3.string('The Great Buggy Gatsby'),
            author: MatchersV3.string('F. Scott Fitzgerald'),
            price: MatchersV3.number(10.99),
            image: MatchersV3.string('https://images.unsplash.com/photo-1544947950-fa07a98d237f')
          }),
          total: MatchersV3.integer(15),
          page: MatchersV3.integer(1),
          totalPages: MatchersV3.integer(2),
          limit: MatchersV3.integer(8)
        }
      }
    })
    .executeTest(async (mockServer) => {
      const response = await axios.get(`${mockServer.url}/api/books`, {
        params: { page: 1, limit: 8 }
      });
      if (response.status !== 200 || !response.data.books) {
        throw new Error(`CT-PACT-001 failed: Invalid response status ${response.status}`);
      }
    });

  console.log('🧪 Executing CT-PACT-002: Book Detail Consumer Contract...');
  await provider
    .addInteraction({
      states: [{ description: 'book with ID 1 exists' }],
      uponReceiving: 'a request for single book detail by ID',
      withRequest: {
        method: 'GET',
        path: '/api/books/1'
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': MatchersV3.regex('^application/json.*', 'application/json; charset=utf-8')
        },
        body: {
          id: MatchersV3.string('1'),
          title: MatchersV3.string('The Great Buggy Gatsby'),
          author: MatchersV3.string('F. Scott Fitzgerald'),
          price: MatchersV3.number(10.99),
          image: MatchersV3.string('https://images.unsplash.com/photo-1544947950-fa07a98d237f'),
          genre: MatchersV3.like('Classic'),
          description: MatchersV3.like('A story of wealth, obsession, and bugs in the Jazz Age.'),
          stock: MatchersV3.integer(10)
        }
      }
    })
    .executeTest(async (mockServer) => {
      const response = await axios.get(`${mockServer.url}/api/books/1`);
      if (response.status !== 200 || response.data.id !== '1') {
        throw new Error(`CT-PACT-002 failed: Expected 1, received ${response.data.id}`);
      }
    });
}

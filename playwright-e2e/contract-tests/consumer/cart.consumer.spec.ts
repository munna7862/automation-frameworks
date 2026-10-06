import axios from 'axios';
import { createPactProvider, MatchersV3 } from './pact.setup';

/**
 * CT-PACT-004 & CT-PACT-005: Shopping Cart Retrieval & Item Addition Consumer Contracts
 */
export async function runCartConsumerTests(): Promise<void> {
  const provider = createPactProvider();

  console.log('🧪 Executing CT-PACT-004: Shopping Cart Retrieval Consumer Contract...');
  await provider
    .addInteraction({
      states: [{ description: 'user cart has items' }],
      uponReceiving: 'a request to retrieve active cart items',
      withRequest: {
        method: 'GET',
        path: '/api/cart',
        headers: {
          Authorization: MatchersV3.regex('^Bearer .+', 'Bearer sample-token')
        }
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': MatchersV3.regex('^application/json.*', 'application/json; charset=utf-8')
        },
        body: MatchersV3.eachLike({
          id: MatchersV3.string('1'),
          title: MatchersV3.string('The Great Buggy Gatsby'),
          price: MatchersV3.number(10.99)
        })
      }
    })
    .executeTest(async (mockServer) => {
      const response = await axios.get(`${mockServer.url}/api/cart`, {
        headers: { Authorization: 'Bearer sample-token' }
      });
      if (response.status !== 200 || !Array.isArray(response.data)) {
        throw new Error(
          `CT-PACT-004 failed: Expected cart array, received status ${response.status}`
        );
      }
    });

  console.log('🧪 Executing CT-PACT-005: Add Item to Cart Consumer Contract...');
  await provider
    .addInteraction({
      states: [{ description: 'book is available for purchase' }],
      uponReceiving: 'a request to add a book to the shopping cart',
      withRequest: {
        method: 'POST',
        path: '/api/cart',
        headers: {
          'Content-Type': 'application/json',
          Authorization: MatchersV3.regex('^Bearer .+', 'Bearer sample-token')
        },
        body: {
          bookId: '1'
        }
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': MatchersV3.regex('^application/json.*', 'application/json; charset=utf-8')
        },
        body: MatchersV3.eachLike({
          id: MatchersV3.string('1'),
          title: MatchersV3.string('The Great Buggy Gatsby'),
          price: MatchersV3.number(10.99)
        })
      }
    })
    .executeTest(async (mockServer) => {
      const response = await axios.post(
        `${mockServer.url}/api/cart`,
        { bookId: '1' },
        { headers: { Authorization: 'Bearer sample-token' } }
      );
      if (response.status !== 200 || !Array.isArray(response.data)) {
        throw new Error(
          `CT-PACT-005 failed: Expected updated cart array, received status ${response.status}`
        );
      }
    });
}

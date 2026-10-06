import axios from 'axios';
import { createPactProvider, MatchersV3 } from './pact.setup';

/**
 * CT-PACT-006 & CT-PACT-007: Order Checkout & Order History Consumer Contracts
 */
export async function runCheckoutConsumerTests(): Promise<void> {
  const provider = createPactProvider();

  console.log('🧪 Executing CT-PACT-006: Order Checkout Consumer Contract...');
  await provider
    .addInteraction({
      states: [{ description: 'user has active cart ready for checkout' }],
      uponReceiving: 'a request to process order checkout',
      withRequest: {
        method: 'POST',
        path: '/api/checkout/process',
        headers: {
          'Content-Type': 'application/json',
          Authorization: MatchersV3.regex('^Bearer .+', 'Bearer sample-token')
        },
        body: {
          firstName: MatchersV3.string('Jane'),
          lastName: MatchersV3.string('Doe'),
          creditCard: MatchersV3.string('4111111111111111')
        }
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': MatchersV3.regex('^application/json.*', 'application/json; charset=utf-8')
        },
        body: {
          success: MatchersV3.boolean(true),
          message: MatchersV3.string('Order placed successfully')
        }
      }
    })
    .executeTest(async (mockServer) => {
      const response = await axios.post(
        `${mockServer.url}/api/checkout/process`,
        {
          firstName: 'Jane',
          lastName: 'Doe',
          creditCard: '4111111111111111'
        },
        { headers: { Authorization: 'Bearer sample-token' } }
      );
      if (response.status !== 200 || !response.data.success) {
        throw new Error(`CT-PACT-006 failed: Invalid checkout response status ${response.status}`);
      }
    });

  console.log('🧪 Executing CT-PACT-007: Customer Order History Consumer Contract...');
  await provider
    .addInteraction({
      states: [{ description: 'user has historical orders' }],
      uponReceiving: 'a request for customer order history',
      withRequest: {
        method: 'GET',
        path: '/api/orders',
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
          id: MatchersV3.string('ord-12345'),
          items: MatchersV3.eachLike({
            id: MatchersV3.string('1'),
            title: MatchersV3.string('The Great Buggy Gatsby'),
            price: MatchersV3.number(10.99)
          }),
          total: MatchersV3.number(10.99),
          customerName: MatchersV3.string('Jane Doe'),
          date: MatchersV3.string('2026-10-06T12:00:00Z')
        })
      }
    })
    .executeTest(async (mockServer) => {
      const response = await axios.get(`${mockServer.url}/api/orders`, {
        headers: { Authorization: 'Bearer sample-token' }
      });
      if (response.status !== 200 || !Array.isArray(response.data)) {
        throw new Error(
          `CT-PACT-007 failed: Expected orders array, received status ${response.status}`
        );
      }
    });
}

import axios from 'axios';
import { createPactProvider, MatchersV3 } from './pact.setup';

/**
 * CT-PACT-003: User Authentication Consumer Contract
 */
export async function runAuthConsumerTests(): Promise<void> {
  const provider = createPactProvider();

  console.log('🧪 Executing CT-PACT-003: User Authentication Consumer Contract...');
  await provider
    .addInteraction({
      states: [{ description: 'user is registered and active' }],
      uponReceiving: 'a request to authenticate user credentials',
      withRequest: {
        method: 'POST',
        path: '/api/login',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          username: 'admin',
          password: 'password123'
        }
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': MatchersV3.regex('^application/json.*', 'application/json; charset=utf-8')
        },
        body: {
          token: MatchersV3.string('sample.jwt.token'),
          refreshToken: MatchersV3.string('sample.refresh.token'),
          username: MatchersV3.string('admin')
        }
      }
    })
    .executeTest(async (mockServer) => {
      const response = await axios.post(`${mockServer.url}/api/login`, {
        username: 'admin',
        password: 'password123'
      });
      if (response.status !== 200 || !response.data.token) {
        throw new Error(`CT-PACT-003 failed: Invalid login response status ${response.status}`);
      }
    });
}

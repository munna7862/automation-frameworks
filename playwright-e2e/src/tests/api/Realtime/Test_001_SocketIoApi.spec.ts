import { test, expect } from '../../../api/api.fixture';
import { io, Socket } from 'socket.io-client';
import { envConfig } from '../../../config/env.config';
import { BookstoreEventSchema } from '../../../api/schemas';

test.describe('Real-Time Socket.IO Protocol API Suite', () => {
  let activeSocket: Socket | null = null;

  test.afterEach(async ({ api }) => {
    if (activeSocket) {
      if (activeSocket.connected) {
        activeSocket.disconnect();
      }
      activeSocket.close();
      activeSocket = null;
    }

    // Restore chaos state
    await api.testControl.setConfig({ websocketDropRate: 0 });
    await api.testControl.reset();
  });

  test('API_WS_01: Socket.IO client connects, receives handshake, and disconnects cleanly @regression', async ({
    testSessionId
  }) => {
    activeSocket = io(envConfig.apiBaseUrl, {
      transports: ['websocket', 'polling'],
      extraHeaders: { 'x-test-session-id': testSessionId },
      query: { sessionId: testSessionId },
      timeout: 10000,
      reconnection: false
    });

    await expect
      .poll(() => activeSocket!.connected, {
        message: 'Waiting for socket to connect',
        timeout: 8000
      })
      .toBe(true);

    expect(activeSocket.id).toBeTruthy();
    expect(activeSocket.connected).toBe(true);

    // Disconnect
    activeSocket.disconnect();
    expect(activeSocket.connected).toBe(false);
  });

  test('API_WS_02: Socket.IO event payload shape validation for bookstore-event @regression', async ({
    testSessionId
  }) => {
    test.setTimeout(25000); // Server interval emits every 8s

    activeSocket = io(envConfig.apiBaseUrl, {
      transports: ['websocket', 'polling'],
      extraHeaders: { 'x-test-session-id': testSessionId },
      query: { sessionId: testSessionId },
      timeout: 10000,
      reconnection: false
    });

    let receivedEvent: any = null;
    activeSocket!.on('bookstore-event', (data) => {
      receivedEvent = data;
    });

    await expect
      .poll(() => receivedEvent, {
        message: 'Waiting for bookstore-event from socket',
        timeout: 18000
      })
      .not.toBeNull();

    expect(receivedEvent).toBeDefined();
    const parseResult = BookstoreEventSchema.safeParse(receivedEvent);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.id).toMatch(/^evt-/);
      expect(['purchase', 'sale', 'views', 'stock']).toContain(parseResult.data.type);
      expect(typeof parseResult.data.message).toBe('string');
      expect(new Date(parseResult.data.timestamp).toString()).not.toBe('Invalid Date');
    }
  });

  test('API_WS_03: Chaos websocketDropRate 1.0 triggers immediate disconnection @regression @chaos', async ({
    api,
    testSessionId
  }) => {
    // 1. Inject chaos: 100% drop rate scoped to test session
    await api.testControl.setConfig({ websocketDropRate: 1.0 });

    // 2. Connect client passing testSessionId in handshake
    activeSocket = io(envConfig.apiBaseUrl, {
      transports: ['websocket', 'polling'],
      extraHeaders: { 'x-test-session-id': testSessionId },
      query: { sessionId: testSessionId },
      timeout: 8000,
      reconnection: false
    });

    let disconnectedByServer = false;
    activeSocket!.on('disconnect', (_reason) => {
      disconnectedByServer = true;
    });
    activeSocket!.on('connect_error', () => {
      disconnectedByServer = true;
    });

    await expect
      .poll(() => disconnectedByServer, {
        message: 'Waiting for socket disconnection by server or drop error',
        timeout: 8000
      })
      .toBe(true);

    expect(disconnectedByServer).toBe(true);
  });

  test('API_WS_04: Chaos websocketDropRate 0.5 triggers client reconnection within SLA @regression @chaos', async ({
    api,
    testSessionId
  }) => {
    test.setTimeout(25000);

    // 1. Inject 50% drop rate
    await api.testControl.setConfig({ websocketDropRate: 0.5 });

    // 2. Connect client with auto-reconnection enabled
    activeSocket = io(envConfig.apiBaseUrl, {
      transports: ['websocket', 'polling'],
      extraHeaders: { 'x-test-session-id': testSessionId },
      query: { sessionId: testSessionId },
      timeout: 8000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 500
    });

    await expect
      .poll(() => activeSocket!.connected, {
        message: 'Waiting for socket reconnection within SLA',
        timeout: 12000
      })
      .toBe(true);
  });
});

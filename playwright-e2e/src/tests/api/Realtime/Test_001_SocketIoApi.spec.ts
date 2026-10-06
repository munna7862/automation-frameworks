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

    const isConnected = await new Promise<boolean>((resolve) => {
      activeSocket!.on('connect', () => resolve(true));
      activeSocket!.on('connect_error', () => resolve(false));
      setTimeout(() => resolve(false), 8000);
    });

    expect(isConnected).toBe(true);
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

    const receivedEvent = await new Promise<any>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timed out waiting for bookstore-event'));
      }, 18000);

      activeSocket!.on('bookstore-event', (data) => {
        clearTimeout(timer);
        resolve(data);
      });

      activeSocket!.on('connect_error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

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

    const disconnectedByServer = await new Promise<boolean>((resolve) => {
      // Server calls socket.disconnect(true) immediately on connection
      activeSocket!.on('disconnect', (_reason) => {
        resolve(true);
      });
      // If client cannot connect due to drop
      activeSocket!.on('connect_error', () => {
        resolve(true);
      });
      setTimeout(() => resolve(false), 8000);
    });

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

    // 3. Verify client connects or reconnects successfully within SLA
    const connectedOrReconnected = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), 12000);

      activeSocket!.on('connect', () => {
        clearTimeout(timer);
        resolve(true);
      });

      activeSocket!.io.on('reconnect', () => {
        clearTimeout(timer);
        resolve(true);
      });
    });

    expect(connectedOrReconnected).toBe(true);
  });
});

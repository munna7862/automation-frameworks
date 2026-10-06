import { UserData, UserFactory } from '../factories/user.factory';
import { CheckoutDetails, CheckoutDetailsFactory } from '../factories/checkout.factory';
import { HttpLike, HttpResponse } from './http-like';
import { CleanupRegistry } from './cleanup-registry';

export interface AuthSession {
  user: UserData;
  token?: string;
  cookies?: string;
  headers: Record<string, string>;
}

export class ApiSeeder {
  private http: HttpLike;
  private cleanupRegistry?: CleanupRegistry;
  private defaultHeaders: Record<string, string>;

  constructor(
    http: HttpLike,
    options: {
      cleanupRegistry?: CleanupRegistry;
      defaultHeaders?: Record<string, string>;
    } = {}
  ) {
    this.http = http;
    this.cleanupRegistry = options.cleanupRegistry;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'x-bypass-rate-limit': 'true',
      ...(options.defaultHeaders || {})
    };
  }

  /**
   * Set or update CleanupRegistry.
   */
  public setCleanupRegistry(registry: CleanupRegistry): void {
    this.cleanupRegistry = registry;
  }

  /**
   * Creates and registers a new user in BuggyBooks.
   * If a CleanupRegistry is attached, an optional session cleanup callback is registered.
   */
  public async createUser(
    overrides: Partial<UserData> = {}
  ): Promise<{ user: UserData; response: HttpResponse }> {
    const user = UserFactory.build(overrides);
    const response = await this.http.post(
      '/api/register',
      {
        username: user.username,
        password: user.password,
        fullName: user.fullName,
        email: user.email
      },
      { headers: this.defaultHeaders }
    );

    return { user, response };
  }

  /**
   * Logs in a user, returning auth token / cookies and resolved request headers.
   */
  public async login(user: UserData): Promise<AuthSession & { response: HttpResponse }> {
    const response = await this.http.post(
      '/api/login',
      {
        username: user.username,
        password: user.password
      },
      { headers: this.defaultHeaders }
    );

    const token = response.data?.token || response.data?.user?.token;
    const rawSetCookie = response.headers['set-cookie'] || '';

    const authHeaders: Record<string, string> = {
      ...this.defaultHeaders
    };

    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (rawSetCookie) {
      // Extract only name=value pairs, stripping Path, Expires, HttpOnly, and invalid characters
      const cookiePairs: string[] = [];
      const lines = rawSetCookie.split(/\r?\n/);
      for (const line of lines) {
        const parts = line.split(/,(?=\s*[^;=]+=[^;=]+)/g);
        for (const part of parts) {
          const firstPart = part.trim().split(';')[0];
          if (firstPart && firstPart.includes('=')) {
            // Strip any forbidden characters
            const sanitized = firstPart.replace(/[^\x20-\x7E]/g, '').trim();
            if (sanitized) {
              cookiePairs.push(sanitized);
            }
          }
        }
      }
      if (cookiePairs.length > 0) {
        authHeaders['Cookie'] = cookiePairs.join('; ');
      }
    }

    return {
      user,
      token,
      cookies: authHeaders['Cookie'],
      headers: authHeaders,
      response
    };
  }

  /**
   * Creates a user and immediately logs them in.
   */
  public async createAndLoginUser(overrides: Partial<UserData> = {}): Promise<AuthSession> {
    const { user } = await this.createUser(overrides);
    const authSession = await this.login(user);
    return authSession;
  }

  /**
   * Adds one or more books to the user's cart.
   * Accepts a book ID or an array of item descriptors `{ bookId, qty }`.
   */
  public async addToCart(
    auth: AuthSession | Record<string, string>,
    items: string | Array<{ bookId: string; qty?: number }>
  ): Promise<HttpResponse[]> {
    const headers: Record<string, string> =
      typeof auth === 'object' && auth !== null && 'headers' in auth
        ? (auth as AuthSession).headers
        : { ...this.defaultHeaders, ...(auth as Record<string, string>) };
    const itemsList = typeof items === 'string' ? [{ bookId: items, qty: 1 }] : items;
    const responses: HttpResponse[] = [];

    for (const item of itemsList) {
      const qty = item.qty || 1;
      for (let i = 0; i < qty; i++) {
        const res = await this.http.post(
          '/api/cart',
          { bookId: item.bookId },
          { headers: { ...headers, 'x-bypass-csrf': 'true' } }
        );
        responses.push(res);
      }
    }

    return responses;
  }

  /**
   * Completes checkout and places an order for the current user cart.
   */
  public async placeOrder(
    auth: AuthSession | Record<string, string>,
    details: Partial<CheckoutDetails> = {}
  ): Promise<{ order: CheckoutDetails; response: HttpResponse }> {
    const headers: Record<string, string> =
      typeof auth === 'object' && auth !== null && 'headers' in auth
        ? (auth as AuthSession).headers
        : { ...this.defaultHeaders, ...(auth as Record<string, string>) };
    const checkoutData = CheckoutDetailsFactory.build(details);

    const response = await this.http.post(
      '/api/checkout/process',
      {
        firstName: checkoutData.firstName,
        lastName: checkoutData.lastName,
        creditCard: checkoutData.creditCard,
        shippingAddress: checkoutData.shippingAddress,
        city: checkoutData.city,
        expiry: checkoutData.expiry,
        cvv: checkoutData.cvv
      },
      { headers: { ...headers, 'x-bypass-csrf': 'true' } }
    );

    return { order: checkoutData, response };
  }

  /**
   * Adjusts stock or inventory limits for a book via testing endpoints.
   */
  public async setStock(bookId: string, n: number): Promise<HttpResponse> {
    try {
      return await this.http.post(
        '/api/test/config',
        { bookStock: { [bookId]: n } },
        { headers: this.defaultHeaders }
      );
    } catch {
      // Fallback endpoint if specific stock route exists
      return await this.http.put(
        `/api/inventory/stock/${bookId}`,
        { stock: n },
        { headers: this.defaultHeaders }
      );
    }
  }

  /**
   * Resets chaos state back to baseline.
   */
  public async resetChaos(): Promise<HttpResponse> {
    await this.http.post(
      '/api/test/config',
      { checkoutFailureRate: 0, inventoryDelayMs: 0, visualChaos: false },
      { headers: this.defaultHeaders }
    );
    return await this.http.post('/api/test/reset', {}, { headers: this.defaultHeaders });
  }
}

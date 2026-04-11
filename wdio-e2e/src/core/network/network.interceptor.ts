import allureReporter from '@wdio/allure-reporter';
import { browser } from '@wdio/globals';

export type NetworkCaptureMode = 'all' | 'api-only';

export interface NetworkEntry {
  id: string;
  startedAt: string;
  endedAt?: string;
  url: string;
  method: string;
  resourceType: string;
  headers: Record<string, string>;
  response?: {
    status: number;
    headers: Record<string, string>;
  };
  failure?: {
    errorText: string;
  };
}

interface PerformanceLogEntry {
  message: string;
}

export class NetworkInterceptor {
  private static readonly API_RESOURCE_TYPES = new Set(['XHR', 'Fetch']);
  private readonly entries: NetworkEntry[] = [];
  private readonly requestMap = new Map<string, NetworkEntry>();

  constructor(private readonly captureMode: NetworkCaptureMode = 'all') {}

  async start() {
    await this.readPerformanceLogs();
  }

  async stop() {
    const logs = await this.readPerformanceLogs();

    for (const log of logs) {
      this.captureLog(log);
    }
  }

  getEntries() {
    return this.entries;
  }

  attachToReport(name = 'network-log') {
    allureReporter.addAttachment(name, JSON.stringify(this.entries, null, 2), 'application/json');
  }

  private captureLog(log: PerformanceLogEntry) {
    try {
      const event = JSON.parse(log.message).message;
      const method = event.method;
      const params = event.params;

      if (method === 'Network.requestWillBeSent') {
        this.captureRequest(params);
      }

      if (method === 'Network.responseReceived') {
        this.captureResponse(params);
      }

      if (method === 'Network.loadingFailed') {
        this.captureFailure(params);
      }
    } catch {
      // Performance log entries are best effort and should never fail the test.
    }
  }

  private captureRequest(params: any) {
    const resourceType = params.type || 'Other';
    if (!this.shouldCapture(resourceType)) {
      return;
    }

    const entry: NetworkEntry = {
      id: params.requestId,
      startedAt: new Date((params.wallTime || Date.now() / 1000) * 1000).toISOString(),
      url: params.request?.url,
      method: params.request?.method,
      resourceType,
      headers: params.request?.headers || {}
    };

    this.requestMap.set(params.requestId, entry);
    this.entries.push(entry);
  }

  private captureResponse(params: any) {
    const entry = this.requestMap.get(params.requestId);
    if (!entry) {
      return;
    }

    entry.endedAt = new Date().toISOString();
    entry.response = {
      status: params.response?.status,
      headers: params.response?.headers || {}
    };
  }

  private captureFailure(params: any) {
    const entry = this.requestMap.get(params.requestId);
    if (!entry) {
      return;
    }

    entry.endedAt = new Date().toISOString();
    entry.failure = {
      errorText: params.errorText || 'Unknown network failure'
    };
  }

  private shouldCapture(resourceType: string) {
    if (this.captureMode === 'all') {
      return true;
    }

    return NetworkInterceptor.API_RESOURCE_TYPES.has(resourceType);
  }

  private async readPerformanceLogs(): Promise<PerformanceLogEntry[]> {
    try {
      return await (browser as any).getLogs('performance');
    } catch {
      return [];
    }
  }
}

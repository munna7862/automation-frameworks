export type CleanupTask = () => Promise<void> | void;

export interface CleanupErrorRecord {
  index: number;
  error: Error | unknown;
  timestamp: string;
}

export class CleanupRegistry {
  private tasks: CleanupTask[] = [];
  private warningHandler?: (message: string, error?: unknown) => void;

  constructor(warningHandler?: (message: string, error?: unknown) => void) {
    this.warningHandler = warningHandler;
  }

  /**
   * Set custom warning handler (e.g. for Allure attachment or custom logger).
   */
  public setWarningHandler(handler: (message: string, error?: unknown) => void): void {
    this.warningHandler = handler;
  }

  /**
   * Register a teardown task to be executed at test completion.
   */
  public register(task: CleanupTask): void {
    if (typeof task === 'function') {
      this.tasks.push(task);
    }
  }

  /**
   * Number of pending cleanup tasks.
   */
  public get count(): number {
    return this.tasks.length;
  }

  /**
   * Executes all registered cleanup tasks in LIFO (Last-In-First-Out) order.
   * Catches all exceptions to ensure that teardown failures NEVER mask the original test failure.
   */
  public async executeAll(): Promise<CleanupErrorRecord[]> {
    const errors: CleanupErrorRecord[] = [];
    let executionIndex = 0;

    // LIFO execution: pop from end of array
    while (this.tasks.length > 0) {
      const task = this.tasks.pop()!;
      executionIndex++;
      try {
        await task();
      } catch (err) {
        const errorRecord: CleanupErrorRecord = {
          index: executionIndex,
          error: err,
          timestamp: new Date().toISOString()
        };
        errors.push(errorRecord);

        const errMsg = err instanceof Error ? err.message : String(err);
        const warning = `[CleanupRegistry] Teardown task #${executionIndex} failed (non-blocking): ${errMsg}`;

        if (this.warningHandler) {
          try {
            this.warningHandler(warning, err);
          } catch {
            // Protect against failing warning handler
          }
        } else {
          console.warn(warning);
        }
      }
    }

    return errors;
  }

  /**
   * Discards all registered cleanup tasks without executing them.
   */
  public clear(): void {
    this.tasks = [];
  }
}

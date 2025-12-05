/**
 * Auto-save utility with debouncing
 * Automatically saves projects after a period of inactivity
 */

type SaveCallback = () => Promise<void>;

export class AutoSave {
  private timer: NodeJS.Timeout | null = null;
  private saveCallback: SaveCallback;
  private delayMs: number;
  private enabled: boolean = false;

  constructor(saveCallback: SaveCallback, delayMs: number = 30000) {
    this.saveCallback = saveCallback;
    this.delayMs = delayMs;
  }

  /**
   * Enable auto-save
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable auto-save
   */
  disable() {
    this.enabled = false;
    this.cancel();
  }

  /**
   * Check if auto-save is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Trigger auto-save with debouncing
   * Cancels any pending save and schedules a new one
   */
  trigger() {
    if (!this.enabled) return;

    // Cancel existing timer
    this.cancel();

    // Schedule new save
    this.timer = setTimeout(async () => {
      try {
        await this.saveCallback();
        console.log('[AutoSave] Project saved automatically');
      } catch (error) {
        console.error('[AutoSave] Failed to save:', error);
      }
    }, this.delayMs);
  }

  /**
   * Cancel pending auto-save
   */
  cancel() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Save immediately (bypasses debouncing)
   */
  async saveNow() {
    this.cancel();
    try {
      await this.saveCallback();
      console.log('[AutoSave] Project saved immediately');
    } catch (error) {
      console.error('[AutoSave] Failed to save:', error);
      throw error;
    }
  }

  /**
   * Update delay duration
   */
  setDelay(delayMs: number) {
    this.delayMs = delayMs;
  }
}

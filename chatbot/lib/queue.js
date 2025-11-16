// QueueManager.js
// Simple FIFO queue per-user to avoid rate limits & ensure natural flow

class QueueManager {
  constructor() {
    // Map<userId, Array<{ message, fnResolve, fnReject }>>
    this.queues = new Map();
    // Map<userId, boolean> to track if user is currently processing
    this.processing = new Map();
  }

  /**
   * Add a task to the user's queue.
   * @param {string} userId
   * @param {function} taskFn - async function returning the reply string
   * @returns {Promise<string>}
   */
  enqueue(userId, taskFn) {
    return new Promise((resolve, reject) => {
      if (!this.queues.has(userId)) {
        this.queues.set(userId, []);
      }

      this.queues.get(userId).push({
        taskFn,
        resolve,
        reject
      });

      this._process(userId);
    });
  }

  /**
   * Internal processor – always processes 1 message at a time per user.
   */
  async _process(userId) {
    if (this.processing.get(userId)) return; // already working

    this.processing.set(userId, true);

    const queue = this.queues.get(userId);
    if (!queue || queue.length === 0) {
      this.processing.set(userId, false);
      return;
    }

    const { taskFn, resolve, reject } = queue[0];

    try {
      const result = await taskFn();
      resolve(result);
    } catch (err) {
      reject(err);
    }

    // remove processed item
    queue.shift();

    if (queue.length > 0) {
      // tiny delay for smoother pacing (optional)
      await new Promise(res => setTimeout(res, 150));
      return this._process(userId);
    }

    this.processing.set(userId, false);
  }
}

module.exports = new QueueManager();

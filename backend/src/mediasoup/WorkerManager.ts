import * as mediasoup from 'mediasoup';
import os from 'os';
import type { Worker } from 'mediasoup/types';
import { workerSettings } from '../config/mediasoup.config.js';
import { logger } from '../utils/logger.js';

export class WorkerManager {
  private workers: Worker[] = [];
  private nextWorkerIdx = 0;
  private workerLoads = new Map<number, number>();

  async init(): Promise<void> {
    const numWorkers = Math.max(1, os.cpus().length);
    logger.info(`Spawning ${numWorkers} mediasoup workers`);

    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker(workerSettings);
      worker.on('died', () => {
        logger.error('Mediasoup worker died', { pid: worker.pid });
        process.exit(1);
      });
      this.workers.push(worker);
      this.workerLoads.set(worker.pid, 0);
    }
  }

  getWorker(): Worker {
    if (this.workers.length === 0) {
      throw new Error('No mediasoup workers available');
    }
    const worker = this.workers[this.nextWorkerIdx];
    this.nextWorkerIdx = (this.nextWorkerIdx + 1) % this.workers.length;
    return worker;
  }

  incrementLoad(worker: Worker): void {
    const load = this.workerLoads.get(worker.pid) ?? 0;
    this.workerLoads.set(worker.pid, load + 1);
  }

  decrementLoad(worker: Worker): void {
    const load = this.workerLoads.get(worker.pid) ?? 0;
    this.workerLoads.set(worker.pid, Math.max(0, load - 1));
  }

  async close(): Promise<void> {
    for (const worker of this.workers) {
      worker.close();
    }
    this.workers = [];
    this.workerLoads.clear();
  }
}

export const workerManager = new WorkerManager();

import Tesseract from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';

export class OCRProcessor {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('eng+chi_sim');
    }
  }

  async screenshotToText(imagePath: string): Promise<string> {
    await this.initialize();

    if (!this.worker) {
      throw new Error('OCR worker 未初始化');
    }

    const result = await this.worker.recognize(imagePath);
    return result.data.text.trim();
  }

  async screenshotToTextFromBuffer(buffer: Buffer): Promise<string> {
    await this.initialize();

    if (!this.worker) {
      throw new Error('OCR worker 未初始化');
    }

    const result = await this.worker.recognize(buffer);
    return result.data.text.trim();
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrProcessor = new OCRProcessor();

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import terminalImage from 'terminal-image';
import { configManager } from './config';

const STORAGE_STATE_FILE = path.join(process.cwd(), 'storage-state.json');

export class BrowserManager {
  private static instance: BrowserManager | null = null;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  private constructor() {}

  static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  async launch(): Promise<void> {
    if (this.browser) {
      console.log('浏览器已启动');
      return;
    }

    const browserPath = configManager.get('browserPath');
    const headless = configManager.get('headless');

    const options: any = {
      headless,
    };

    if (browserPath) {
      options.executablePath = browserPath;
    }

    this.browser = await chromium.launch(options);
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    // 访问初始页面
    await this.page.goto('https://zujuan.xkw.com', { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000);

    // 检查登录状态
    const isLoggedIn = await this.checkLoginStatus();

    if (!isLoggedIn) {
      console.log('未登录，开始扫码登录流程...');
      await this.doQRCodeLogin();
    } else {
      console.log('已登录');
    }

    // 保存登录状态
    await this.saveLoginState();
    console.log('浏览器启动成功');
  }

  private async checkLoginStatus(): Promise<boolean> {
    try {
      // 检查是否有已登录用户的头像元素
      const avatar = await this.page!.$('div.avatar img');
      return avatar !== null;
    } catch {
      return false;
    }
  }

  private async doQRCodeLogin(): Promise<void> {
    try {
      // 点击登录按钮
      console.log('正在点击登录按钮...');
      const loginBtn = await this.page!.$('a.login-btn[href="javascript:logindiv()"]');
      if (loginBtn) {
        await loginBtn.click();
        await this.page!.waitForTimeout(2000);
      } else {
        console.log('未找到登录按钮，尝试其他方式...');
        // 备用：直接访问登录页面
        await this.page!.goto('https://zujuan.xkw.com', { waitUntil: 'domcontentloaded' });
        await this.page!.waitForTimeout(1000);
      }

      // 等待二维码加载
      console.log('正在获取二维码...');
      await this.page!.waitForSelector('#qrcode canvas', { timeout: 5000 });

      // 获取二维码保存路径
      const qrCodePath = configManager.get('qrCodePath');

      // 截图二维码
      const qrcode = await this.page!.$('#qrcode');
      if (qrcode) {
        await qrcode.screenshot({ path: qrCodePath });

        // 尝试在终端显示二维码
        try {
          console.log('\n' + await terminalImage.file(qrCodePath, { width: 30 }) + '\n');
        } catch {
          // 终端不支持图片，显示文件路径
          console.log(`\n二维码已保存到: ${qrCodePath}\n`);
        }
      }

      console.log('请打开手机微信扫码登录（30秒内）...');

      // 等待扫码成功（检测到头像出现）
      let loginSuccess = false;
      const startTime = Date.now();

      while (Date.now() - startTime < 30000) {
        await this.page!.waitForTimeout(2000);

        // 检查是否登录成功（等待2秒让页面跳转回来）
        await this.page!.waitForTimeout(1000);

        const isLoggedIn = await this.checkLoginStatus();
        if (isLoggedIn) {
          loginSuccess = true;
          console.log('扫码成功！');
          break;
        }

        // 检查二维码是否还在（扫码后可能会消失）
        const qrcodeStillExists = await this.page!.$('#qrcode canvas');
        if (!qrcodeStillExists) {
          loginSuccess = true;
          console.log('扫码成功！');
          break;
        }
      }

      if (!loginSuccess) {
        await this.close();
        throw new Error('扫码登录超时（30秒）');
      }

      // 等待页面跳回初始页面
      await this.page!.waitForTimeout(2000);

      // 确认已返回初始页面
      const currentUrl = this.page!.url();
      console.log(`当前页面: ${currentUrl}`);

    } catch (error) {
      await this.close();
      throw error;
    }
  }

  private async saveLoginState(): Promise<void> {
    if (this.context) {
      await this.context.storageState({ path: STORAGE_STATE_FILE });
      console.log(`登录状态已保存到: ${STORAGE_STATE_FILE}`);
    }
  }

  async getPage(): Promise<Page> {
    if (!this.page) {
      await this.launch();
    }
    return this.page!;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      console.log('浏览器已关闭');
    }
  }

  async screenshot(name: string, options?: any): Promise<Buffer> {
    const page = await this.getPage();
    const screenshotPath = path.join(configManager.get('outputDir'), `${name}.png`);

    await page.screenshot({
      path: screenshotPath,
      ...options,
    });

    return fs.readFileSync(screenshotPath);
  }

  isLaunched(): boolean {
    return this.browser !== null;
  }
}

export const browserManager = BrowserManager.getInstance();

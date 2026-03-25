import { Command } from 'commander';
import { browserManager } from '../lib/browser';
import { configManager } from '../lib/config';

export function createStartCommand(): Command {
  const command = new Command('start');

  command
    .description('启动浏览器并进入选题页面')
    .option('-g, --grade <grade>', '年级: 高中 或 初中', '高中')
    .action(async (options) => {
      const grade = options.grade as '高中' | '初中';

      console.log(`正在启动浏览器，进入${grade}数学知识点选题页...`);

      try {
        await browserManager.launch();

        const page = await browserManager.getPage();

        // 根据年级选择基础URL
        const gradePrefix = grade === '高中' ? 'gzsx' : 'czsx';
        const homeUrl = `https://zujuan.xkw.com/${gradePrefix}/`;

        console.log(`正在导航到: ${homeUrl}`);
        await page.goto(homeUrl, { waitUntil: 'networkidle' });

        console.log('浏览器已启动并进入选题页面');
        console.log('请在浏览器中进行操作，完成后使用 shutup 命令关闭浏览器');
      } catch (error) {
        console.error('启动浏览器失败:', error);
      }
    });

  return command;
}

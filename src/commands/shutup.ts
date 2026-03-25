import { Command } from 'commander';
import { browserManager } from '../lib/browser';

export function createShutupCommand(): Command {
  const command = new Command('shutup');

  command
    .description('关闭浏览器实例')
    .action(async () => {
      try {
        await browserManager.close();
        console.log('浏览器已关闭');
      } catch (error) {
        console.error('关闭浏览器失败:', error);
      }
    });

  return command;
}

import { Command } from 'commander';
import { configManager } from '../lib/config';

export function createConfigCommand(): Command {
  const command = new Command('config');

  command
    .description('查看或更新配置')
    .action(() => {
      const config = configManager.getAll();
      console.log('当前配置:');
      console.log(JSON.stringify(config, null, 2));
    });

  command
    .option('-c, --cookie <cookie>', '设置 cookie')
    .option('-o, --output <path>', '设置输出路径')
    .option('-b, --browser-path <path>', '设置浏览器路径')
    .option('-q, --qr-code-path <path>', '设置二维码图片保存路径')
    .action((options) => {
      if (options.cookie || options.output || options.browserPath || options.qrCodePath) {
        configManager.set({
          cookie: options.cookie,
          output: options.output,
          browserPath: options.browserPath,
          qrCodePath: options.qrCodePath,
        });
        console.log('配置已更新');
      } else {
        const config = configManager.getAll();
        console.log('当前配置:');
        console.log(JSON.stringify(config, null, 2));
      }
    });

  return command;
}

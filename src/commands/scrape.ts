import { Command } from 'commander';
import { scraperEngine } from '../lib/scraper';
import { configManager } from '../lib/config';
import {
  ScrapeOptions,
  QuestionType,
  Difficulty,
  Year,
  Grade,
} from '../types';

export function createScrapeCommand(): Command {
  const command = new Command('scrape');

  command
    .description('抓取题目')
    .requiredOption('-k, --knowledge <id>', '知识点节点ID（必填）')
    .option('-t, --type <type>', '题型: t1=单选 t2=多选 t3=填空 t4=解答 t5=判断 t6=概念填空')
    .option('-d, --difficulty <level>', '难度: d1=容易 d2=较易 d3=适中 d4=较难 d5=困难')
    .option('-y, --year <year>', '年份: 2026/2025/2024/2023')
    .option('-g, --grade <grade>', '年级: high=高中 middle=初中（默认使用配置中的defaultGrade）')
    .option('-l, --limit <number>', '最大抓取截图数量（1-10，默认10）', '10')
    .option('-o, --output <path>', '输出目录（默认配置中的路径）')
    .option('-mc, --multi-count <number>', '多选题答案数量: 2, 3, 4及以上')
    .option('-fc, --fill-count <number>', '填空题空数: 1, 2, 3及以上')
    .option('-p, --page <number>', '分页页码（默认1，第二页起为o2p2格式）')
    .action(async (options) => {
      const limit = Math.min(10, Math.max(1, parseInt(options.limit) || 10));
      // 如果未指定grade，使用配置中的defaultGrade
      const grade = (options.grade as Grade) || configManager.get('defaultGrade');

      const scrapeOptions: ScrapeOptions = {
        knowledge: options.knowledge,
        type: options.type as QuestionType | undefined,
        difficulty: options.difficulty as Difficulty | undefined,
        year: options.year ? parseInt(options.year) as Year : undefined,
        grade,
        limit,
        output: options.output || configManager.get('outputDir'),
        multiCount: options.multiCount ? parseInt(options.multiCount) : undefined,
        fillCount: options.fillCount ? parseInt(options.fillCount) : undefined,
        page: options.page ? parseInt(options.page) : undefined,
      };

      const gradeName = grade === 'high' ? '高中' : '初中';

      console.log('开始抓取题目...');
      console.log(`知识点: ${scrapeOptions.knowledge}`);
      console.log(`年级: ${gradeName}`);
      if (scrapeOptions.type) console.log(`题型: ${scrapeOptions.type}`);
      if (scrapeOptions.difficulty) console.log(`难度: ${scrapeOptions.difficulty}`);
      if (scrapeOptions.year) console.log(`年份: ${scrapeOptions.year}`);
      if (scrapeOptions.page) console.log(`分页: ${scrapeOptions.page}`);
      console.log(`限制数量: ${scrapeOptions.limit}`);

      try {
        const results = await scraperEngine.scrape(scrapeOptions);
        console.log(`抓取完成，共 ${results.length} 道题目`);
      } catch (error) {
        console.error('抓取失败:', error);
      }
    });

  return command;
}

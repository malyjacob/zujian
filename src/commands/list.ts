import { Command } from 'commander';
import {
  loadHighSchoolTree,
  findNodesByName,
  findNodeById,
  getNodePath,
  printTree,
} from '../lib/knowledge-tree';

export function createListCommand(): Command {
  const command = new Command('list');

  command
    .description('列出/搜索知识点')
    .option('-s, --search <name>', '搜索知识点名称')
    .option('-i, --id <id>', '通过ID查找知识点')
    .option('-p, --path <id>', '显示知识点的完整路径')
    .option('-t, --tree', '显示完整知识点树（高中）')
    .option('--level <level>', '显示指定层级的知识点', (val) => parseInt(val))
    .action((options) => {
      const roots = loadHighSchoolTree();

      if (roots.length === 0) {
        console.log('未找到知识点树文件 KNOWLEDGE_TREE_HIGH.txt');
        return;
      }

      if (options.tree) {
        console.log('高中数学知识点树:\n');
        printTree(roots);
        return;
      }

      if (options.search) {
        const results = findNodesByName(roots, options.search);
        if (results.length === 0) {
          console.log(`未找到包含"${options.search}"的知识点`);
        } else {
          console.log(`找到 ${results.length} 个匹配结果:\n`);
          results.forEach((node) => {
            const nodePath = getNodePath(roots, node.id);
            console.log(`• ${nodePath.join(' > ')} (${node.id})`);
          });
        }
        return;
      }

      if (options.id) {
        const node = findNodeById(roots, options.id);
        if (node) {
          const nodePath = getNodePath(roots, node.id);
          console.log(`知识点: ${node.name}`);
          console.log(`ID: ${node.id}`);
          console.log(`路径: ${nodePath.join(' > ')}`);
          if (node.children.length > 0) {
            console.log(`\n子知识点 (${node.children.length}个):`);
            node.children.forEach((child) => {
              console.log(`  • ${child.name} (${child.id})`);
            });
          }
        } else {
          console.log(`未找到ID为 "${options.id}" 的知识点`);
        }
        return;
      }

      if (options.path) {
        const nodePath = getNodePath(roots, options.path);
        if (nodePath.length > 0) {
          console.log(`完整路径: ${nodePath.join(' > ')}`);
        } else {
          console.log(`未找到ID为 "${options.path}" 的知识点`);
        }
        return;
      }

      // 无参数时显示帮助
      command.help();
    });

  return command;
}

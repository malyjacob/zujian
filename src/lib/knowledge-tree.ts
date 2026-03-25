import * as fs from 'fs';
import * as path from 'path';

export interface KnowledgeNode {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  children: KnowledgeNode[];
}

// 解析知识点树文本文件
export function parseKnowledgeTree(filePath: string): KnowledgeNode[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const roots: KnowledgeNode[] = [];
  const stack: { node: KnowledgeNode; level: number }[] = [];

  for (const line of lines) {
    // 计算缩进层级
    const match = line.match(/^(\s*)•\s(.+?)\s+\((zsd\d+)\)$/);
    if (!match) continue;

    const indent = match[1];
    const level = Math.floor(indent.length / 2); // 每2个空格算一个层级
    const name = match[2];
    const id = match[3];

    const node: KnowledgeNode = {
      id,
      name,
      parentId: null,
      level,
      children: [],
    };

    // 找到父节点
    if (stack.length === 0) {
      roots.push(node);
      stack.push({ node, level });
    } else {
      // 弹出比当前层级深的节点
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length > 0) {
        const parent = stack[stack.length - 1].node;
        node.parentId = parent.id;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
      stack.push({ node, level });
    }
  }

  return roots;
}

// 查找知识点节点（通过ID）
export function findNodeById(
  roots: KnowledgeNode[],
  id: string
): KnowledgeNode | null {
  for (const root of roots) {
    if (root.id === id) return root;
    const found = findNodeInChildren(root, id);
    if (found) return found;
  }
  return null;
}

function findNodeInChildren(node: KnowledgeNode, id: string): KnowledgeNode | null {
  for (const child of node.children) {
    if (child.id === id) return child;
    const found = findNodeInChildren(child, id);
    if (found) return found;
  }
  return null;
}

// 查找知识点节点（通过名称模糊匹配）
export function findNodesByName(
  roots: KnowledgeNode[],
  name: string
): KnowledgeNode[] {
  const results: KnowledgeNode[] = [];
  const lowerName = name.toLowerCase();

  function search(node: KnowledgeNode) {
    if (node.name.toLowerCase().includes(lowerName)) {
      results.push(node);
    }
    node.children.forEach(search);
  }

  roots.forEach(search);
  return results;
}

// 获取知识点路径（从根到该节点）
export function getNodePath(roots: KnowledgeNode[], id: string): string[] {
  const path: string[] = [];

  function find(currentNode: KnowledgeNode): boolean {
    path.push(currentNode.name);
    if (currentNode.id === id) return true;
    for (const child of currentNode.children) {
      if (find(child)) return true;
    }
    path.pop();
    return false;
  }

  for (const root of roots) {
    if (find(root)) break;
  }

  return path;
}

// 打印知识点树
export function printTree(roots: KnowledgeNode[], prefix = '', isLast = true): void {
  const connector = isLast ? '└── ' : '├── ';

  for (let i = 0; i < roots.length; i++) {
    const node = roots[i];
    const isLastNode = i === roots.length - 1;
    const newPrefix = prefix + (isLast ? '    ' : '│   ');

    console.log(`${prefix}${connector}${node.name} (${node.id})`);

    if (node.children.length > 0) {
      printTree(node.children, newPrefix, isLastNode);
    }
  }
}

// 加载高中知识点树
let highSchoolTree: KnowledgeNode[] | null = null;

export function loadHighSchoolTree(): KnowledgeNode[] {
  if (!highSchoolTree) {
    const filePath = path.join(process.cwd(), 'KNOWLEDGE_TREE_HIGH.txt');
    if (fs.existsSync(filePath)) {
      highSchoolTree = parseKnowledgeTree(filePath);
    } else {
      highSchoolTree = [];
    }
  }
  return highSchoolTree;
}

// 加载初中知识点树
let middleSchoolTree: KnowledgeNode[] | null = null;

export function loadMiddleSchoolTree(): KnowledgeNode[] {
  if (!middleSchoolTree) {
    const filePath = path.join(process.cwd(), 'KNOWLEDGE_TREE_MIDDLE.txt');
    if (fs.existsSync(filePath)) {
      middleSchoolTree = parseKnowledgeTree(filePath);
    } else {
      middleSchoolTree = [];
    }
  }
  return middleSchoolTree;
}

// 根据年级类型加载对应的知识点树
export function loadKnowledgeTree(gradeType: '高中' | '初中'): KnowledgeNode[] {
  return gradeType === '高中' ? loadHighSchoolTree() : loadMiddleSchoolTree();
}

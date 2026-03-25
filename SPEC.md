# 组卷网爬虫工具 (zujuan-scraper) 规格说明书

## 1. 项目概述

- **项目名称**: zujuan-scraper
- **项目类型**: TypeScript CLI 工具
- **核心功能**: 从组卷网(zujuan.xkw.com)爬取数学题目，支持知识点、题型、难度、年份等多维筛选，输出截图+文本
- **目标用户**: 教师、教研人员

## 2. 技术栈

- TypeScript + ts-node
- Playwright (浏览器自动化，处理 WAF JS 挑战)
- Tesseract.js (OCR 文字识别)
- commander.js (CLI 子命令框架)

## 3. CLI 接口设计

### 3.1 config - 配置管理
```bash
zujuan config                    # 查看当前配置
zujuan config --cookie "..."    # 更新 cookie
zujuan config --output "./data" # 更新输出路径
zujuan config --browser-path "/path/to/chrome"  # 设置浏览器路径
```

### 3.2 start - 启动浏览器
```bash
zujuan start --grade 高中   # 启动浏览器，进入高中数学知识点选题页
zujuan start --grade 初中   # 进入初中数学
```

### 3.3 shutup - 关闭浏览器
```bash
zujuan shutup   # 关闭浏览器实例
```

### 3.4 scrape - 抓取题目
```bash
zujuan scrape --knowledge zsd27926 --type t1 --difficulty d3 --year 2026 --limit 20
# 参数：
#   --knowledge   知识点节点ID（必填）
#   --type       题型: t1=单选 t2=多选 t3=填空 t4=解答 t5=判断 t6=概念填空
#   --difficulty  难度: d1=容易 d2=较易 d3=适中 d4=较难 d5=困难
#   --year       年份: 2026/2025/2024/2023
#   --grade      年級: g1=高一 g2=高二 g3=高三
#   --limit      最大抓取截图数量（默认10）
#   --output     输出目录（默认配置中的路径）
```

## 4. URL 构造规则

基础URL: `https://zujuan.xkw.com/gzsx/zsd{知识点ID}/`

可选参数片段（路径式，可任意叠加）:
- `y{年份}` - 年份: y2026, y2025, y2024, y2023
- `g{年级}` - 年级: g1=高一, g2=高二, g3=高三; 初中 g1=初一, g2=初二, g3=初三
- `t{题型}` - 题型: t1=单选, t2=多选, t3=填空, t4=解答, t5=判断, t6=概念填空
- `d{难度}` - 难度: d1=容易, d2=较易, d3=适中, d4=较难, d5=困难
- `s{来源}` - 来源: s1=课前预习, s2=课后作业, s3=单元测试, s4=月考, s5=期中, s6=期末, s7=高考模拟, s8=高考真题, s9=学业考试, s10=开学考试, s11=专题练习, s12=竞赛, s13=强基计划
- `a{地区}` - 地区ID
- `x{学期}` - x1=上学期, x2=下学期
- `k{分类}` - k1=典型题, k2=压轴题, k3=同步题, k4=新文化题, k5=课本原题
- `p{页码}` - 分页: p1=第1页

例: `https://zujuan.xkw.com/gzsx/zsd27926/y2026g3/t1/d3/` = 2026年高三单选题适中难度

## 5. 配置存储

配置文件路径: `~/.zujuan-scraper/config.json`

```json
{
  "cookie": "...",
  "outputDir": "./zujuan-output",
  "browserPath": null,
  "defaultGrade": "高中",
  "headless": false
}
```

## 6. 核心模块

### 6.1 ConfigManager (lib/config.ts)
- 加载/保存配置文件 (~/.zujuan-scraper/config.json)
- 提供 get/set 方法

### 6.2 BrowserManager (lib/browser.ts)
- Playwright 浏览器生命周期管理
- 单例模式，避免重复启动
- 方法: launch(), close(), getPage(), screenshot()

### 6.3 UrlBuilder (lib/url-builder.ts)
- 根据参数构造目标 URL
- 验证参数合法性

### 6.4 OCRProcessor (lib/ocr.ts)
- Tesseract.js 封装
- screenshotToText() 方法

### 6.5 ScraperEngine (lib/scraper.ts)
- 核心爬取逻辑
- 滚动加载题目列表
- 逐题截图 + OCR 识别
- 保存截图到输出目录
- 输出结构化 JSON

## 7. 文件结构

```
zujuan-scraper/
├── src/
│   ├── index.ts           # 主入口，注册 commander 子命令
│   ├── commands/
│   │   ├── config.ts      # config 子命令
│   │   ├── start.ts       # start 子命令
│   │   ├── shutup.ts      # shutup 子命令
│   │   └── scrape.ts     # scrape 子命令
│   ├── lib/
│   │   ├── config.ts      # 配置管理器
│   │   ├── browser.ts     # Playwright 管理器
│   │   ├── url-builder.ts # URL 构造器
│   │   ├── ocr.ts         # OCR 处理器
│   │   └── scraper.ts     # 爬取引擎
│   └── types/
│       └── index.ts       # 类型定义
├── package.json
├── tsconfig.json
├── SPEC.md
└── README.md
```

## 8. 知识点树（高中数学 bankId=11）

根节点: zsd27925 (高中数学综合库)

一级节点:
- zsd27926 集合与常用逻辑用语
- zsd27927 函数与导数
- zsd27928 三角函数与解三角形
- zsd27929 平面向量
- zsd27930 数列
- ...共18个

(初中数学 bankId=10, 根节点需另行确认)

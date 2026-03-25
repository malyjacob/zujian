# 组卷网题目抓取工具

用于从组卷网（zujuan.xkw.com）抓取数学题目、答案和解析。

## 功能特性

- 支持单选题、多选题、填空题、解答题等题型筛选
- 支持按难度、年份、年级等维度筛选
- 自动登录（扫码登录）
- 同时抓取题目和答案解析
- OCR文字识别
- 分页抓取
- 云端部署支持

## 项目结构

```
zujuan/
├── src/
│   ├── commands/          # CLI 命令
│   │   ├── config.ts      # 配置命令
│   │   ├── scrape.ts      # 抓取命令
│   │   └── ...
│   ├── lib/               # 核心库
│   │   ├── browser.ts     # 浏览器管理
│   │   ├── config.ts      # 配置管理
│   │   ├── ocr.ts        # OCR 识别
│   │   ├── scraper.ts     # 抓取逻辑
│   │   └── url-builder.ts # URL 构建
│   ├── types/             # 类型定义
│   └── index.ts           # 入口文件
├── dist/                  # 编译输出
├── cookie.txt             # Cookie 文件（可选）
├── storage-state.json      # 登录状态（自动生成）
└── login-qrcode.png       # 登录二维码（自动生成）
```

## 安装

```bash
npm install
npm run build
```

## 配置

### 首次使用

首次运行时会提示扫码登录：
```bash
node dist/index.js scrape --knowledge zsd27927 --limit 1
```

1. 程序会打开浏览器并显示二维码
2. 用手机微信扫码登录
3. 登录状态自动保存

### 配置命令

查看当前配置：
```bash
node dist/index.js config
```

设置输出目录：
```bash
node dist/index.js config --output ./my-output
```

设置浏览器路径（可选）：
```bash
node dist/index.js config --browser-path "C:\path\to\chromium.exe"
```

设置二维码保存路径（云端部署时）：
```bash
node dist/index.js config --qr-code-path /var/www/qrcode.png
```

### 配置文件

配置文件位置：`~/.zujuan-scraper/config.json`

```json
{
  "outputDir": "./zujuan-output",
  "defaultGrade": "high",
  "headless": false,
  "qrCodePath": "./login-qrcode.png"
}
```

**年级设置**：`defaultGrade` 可设置为 `high` 或 `middle`，影响爬取 URL 前缀：
- `high` → 高中：`gzsx` (例: `https://zujuan.xkw.com/gzsx/...`)
- `middle` → 初中：`czsx` (例: `https://zujuan.xkw.com/czsx/...`)

通过命令行设置：
```bash
# 设置为初中数学
node dist/index.js config --default-grade middle

# 设置为高中数学
node dist/index.js config --default-grade high
```

### 知识点树

```bash
# 查看高中知识点树
node dist/index.js list --tree

# 查看初中知识点树
node dist/index.js list --tree --middle

# 搜索知识点
node dist/index.js list --search 函数

# 搜索初中知识点
node dist/index.js list --search 函数 --middle
```

## 使用方法

### 基本抓取

```bash
node dist/index.js scrape --knowledge zsd27927 --limit 5
```

### 题型筛选

| 参数 | 说明 |
|------|------|
| `t1` | 单选题 |
| `t2` | 多选题 |
| `t3` | 填空题 |
| `t4` | 解答题 |

示例 - 抓取单选题：
```bash
node dist/index.js scrape --knowledge zsd27927 --type t1 --limit 10
```

示例 - 抓取多选题（指定答案数量）：
```bash
node dist/index.js scrape --knowledge zsd27927 --type t2 --multi-count 2 --limit 10
```

示例 - 抓取填空题（指定空数）：
```bash
node dist/index.js scrape --knowledge zsd27927 --type t3 --fill-count 2 --limit 10
```

### 难度筛选

| 参数 | 说明 |
|------|------|
| `d1` | 容易 |
| `d2` | 较易 |
| `d3` | 适中 |
| `d4` | 较难 |
| `d5` | 困难 |

示例：
```bash
node dist/index.js scrape --knowledge zsd27927 --difficulty d3 --limit 10
```

### 年份筛选

支持：2023, 2024, 2025, 2026

```bash
node dist/index.js scrape --knowledge zsd27927 --year 2026 --limit 10
```

### 分页

默认第1页，URL 结尾为 `o2`
第2页起，URL 结尾为 `o2p2`、`o2p3`...

```bash
node dist/index.js scrape --knowledge zsd27927 --page 2 --limit 10
```

### 组合使用

```bash
# 2026年高三单选题，适中难度
node dist/index.js scrape -k zsd27927 -t t1 -d d3 -y 2026 -l 10

# 2025年高二多选题，较难
node dist/index.js scrape -k zsd27927 -t t2 -d d4 -y 2025 -l 10
```

## 命令行参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-k, --knowledge <id>` | 知识点节点ID（必填） | - |
| `-t, --type <type>` | 题型: t1/t2/t3/t4 | - |
| `-d, --difficulty <level>` | 难度: d1/d2/d3/d4/d5 | - |
| `-y, --year <year>` | 年份: 2023/2024/2025/2026 | - |
| `-g, --grade <grade>` | 年级: high/middle（默认使用配置） | - |
| `-l, --limit <number>` | 最大抓取数量 | 10 (1-10) |
| `-mc, --multi-count <number>` | 多选题答案数量: 2/3/4+ | - |
| `-fc, --fill-count <number>` | 填空题空数: 1/2/3+ | - |
| `-p, --page <number>` | 分页页码 | 1 |
| `-o, --output <path>` | 输出目录 | 配置中的路径 |

## 输出结果

抓取结果保存在配置的输出目录中，默认 `zujuan-output/`

```
zujuan-output/
├── q_1234567890_question.png   # 题目截图
├── q_1234567890_answer.png      # 答案截图
├── results_1234567890.json     # JSON 结果
└── ...
```

JSON 结果格式：
```json
[
  {
    "id": "q_1234567890_0",
    "questionPath": "q_1234567890_question.png",
    "answerPath": "q_1234567890_answer.png",
    "questionText": "题目文字...",
    "answerText": "答案文字...",
    "timestamp": "2026-03-26T00:00:00.000Z"
  }
]
```

## 云端部署

### 登录状态

1. 在本地完成首次登录，获取 `storage-state.json`
2. 将项目部署到云端时，包含此文件
3. 登录状态通常可维持数天至数周

### 二维码路径

云端无GUI时，设置二维码保存路径以便远程查看：
```bash
node dist/index.js config --qr-code-path /var/www/login-qrcode.png
```

### 无头模式

配置文件设置 `headless: true`，或运行时：
```bash
node dist/index.js config --headless true
```

## 登录状态过期

当登录状态过期时：
1. 程序自动检测到未登录
2. 打开浏览器显示二维码
3. 扫码登录后自动保存新状态

如需手动重新登录：
```bash
rm storage-state.json
node dist/index.js scrape --knowledge zsd27927 --limit 1
```

## 常见问题

### Q: 扫码登录超时怎么办？
A: 确保30秒内完成扫码，如果网络较慢可以稍后重试。

### Q: 登录状态多久过期？
A: 取决于组卷网设置，通常数天到数周不等。

### Q: 可以不用登录抓取吗？
A: 可以，但只能抓取题目，无法获取答案解析。

### Q: 题目数量限制多少？
A: 每页默认10道题，limit参数限制1-10。

### Q: 如何抓取多页？
A: 使用 `--page` 参数指定页码，或多次运行不同页码。

## 开发

### 构建
```bash
npm run build
```

### 开发模式（监视）
```bash
npm run dev
```

### TypeScript 检查
```bash
npx tsc --noEmit
```

## 许可证

MIT

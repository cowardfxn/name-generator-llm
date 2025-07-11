# 新生儿起名助手

一个基于 AI 的中文新生儿起名工具，支持根据性别、寓意、文化来源等条件生成符合要求的名字。

## 功能特点

- 🌈 美观的用户界面，支持亮色/暗色主题切换
- 🔍 可选择性别（男孩/女孩/不限）
- 📚 多种文化来源（四书五经、诗经楚辞、唐诗宋词等）
- 💡 丰富的寓意选择
- 🎯 支持自定义寓意导入
- ⚡️ 实时生成名字（Server-Sent Events）
- 📋 一键复制名字及释义
- 🚫 支持回避字和回避读音设置
- 🎨 响应式设计，优雅的滚动效果

## 技术栈

### 前端

- React + TypeScript
- Ant Design 组件库
- Vite 构建工具
- Server-Sent Events 实时通信

### 后端

- FastAPI 框架
- SQLAlchemy ORM
- OpenAI API 集成
- SQLite 数据库

## 环境要求

- Node.js 16.0 或更高版本
- Python 3.9 或更高版本
- 包管理工具：npm 或 yarn（前端）、pip（后端）

## 安装和运行

### 后端设置

1. 进入后端目录：

   ```bash
   cd backend
   ```

2. 创建并激活虚拟环境（可选但推荐）：

   ```bash

   # Windows

   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux

   python3 -m venv venv
   source venv/bin/activate

   ```

3. 安装依赖：

   ```bash
   pip install -r requirements.txt
   ```

4. 配置环境变量：

   - 复制 `.env.example` 为 `.env`
   - 在 `.env` 文件中设置您的 OpenAI API 密钥和其他必要配置

5. 启动后端服务：

   ```bash

   # Windows

   python -m uvicorn app.main:app --reload

   # macOS/Linux

   python3 -m uvicorn app.main:app --reload

   ```

### 前端设置

1. 进入前端目录：

   ```bash
   cd frontend
   ```

2. 安装依赖：

   ```bash
   npm install

   # 或者

   yarn install

   ```

3. 启动开发服务器：

   ```bash
   npm run dev

   # 或者

   yarn dev

   ```

4. 在浏览器中访问：
   - 默认地址：http://localhost:3000

## 使用说明

1. 选择性别（可选）
2. 选择期望寓意（必选，可多选）
3. 可选择上传自定义寓意文件（txt 格式，每行一个寓意）
4. 选择文化溯源（必选，可多选）
5. 调整生成数量（3-20 个）
6. 设置需要回避的字或读音（可选）
7. 点击"生成名字"按钮开始生成
8. 可以通过右上角的按钮切换亮色/暗色主题

## 开发说明

### 构建生产版本

前端构建：

```bash
cd frontend
npm run build

# 或者

yarn build
```

### API 文档

启动后端服务后，可以访问以下地址查看 API 文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

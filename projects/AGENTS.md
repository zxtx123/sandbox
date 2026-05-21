## 项目概述
360智汇云规范页面，一个静态 HTML 网站，用于展示工作台、云服务器ECS等产品规范。

## 技术栈
- 静态 HTML/CSS/JS
- Python 内置 HTTP 服务器（预览）
- 无 Node.js 依赖

## 目录结构
```
projects/
├── index.html          # 主入口页面
├── overview.html       # 概览页面
├── data-agent.html     # 数据代理页面
├── styles/             # CSS 样式
├── img/                 # 图片资源
└── assets/              # 静态资源
```

## 运行与预览
- 预览命令：`bash scripts/coze-preview-run.sh`
- 预览端口：5000
- 工作目录：`/workspace/projects/projects`

## 预览链路说明
- 工作区根目录：`/workspace/projects`
- 技术项目目录：`/workspace/projects/projects`
- 根 `.coze`：`/workspace/projects/.coze`（承载 dev/build 入口）
- 子项目 `.coze`：`/workspace/projects/projects/.coze`

## 用户偏好与长期约束
- 预览服务必须绑定 `0.0.0.0:5000`，不可使用 `localhost` 或 `127.0.0.1`
- 静态 HTML 项目无需构建步骤，`dev.build` 为空操作
- 使用 Python `http.server` 提供静态文件服务

## 常见问题和预防
- 预览脚本路径计算基于 `$(dirname "$0")` 推导，禁止依赖当前工作目录
- 每次启动前清理 5000 端口残留进程，确保幂等性

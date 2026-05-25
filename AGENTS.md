# AI 沙箱 Sandbox - 项目规范

## 项目概述
AI 沙箱（Sandbox）管理系统，提供云端沙箱实例的创建、管理、监控等功能。

## 技术栈
- 纯静态 HTML/CSS/JavaScript
- Python HTTP 服务器（端口 5000）
- 无框架依赖

## 目录结构
```
/workspace/projects/
├── .coze                    # 项目根配置
├── AGENTS.md               # 本文件
├── scripts/
│   ├── coze-preview-run.sh # 预览启动脚本
│   └── coze-preview-build.sh
└── projects/
    ├── index.html           # 沙箱实例页面（主页面）
    ├── sandbox-template.html # 沙箱模板页面
    ├── sandbox-playground.html # 试验场页面
    └── sandbox-policy.html   # 网络策略页面
```

## 关键入口 / 核心模块

### 页面导航
- 左侧菜单采用折叠式设计，支持多级菜单
- 当前页面菜单项高亮（active 状态）
- 菜单链接：index.html（沙箱实例）、sandbox-template.html（模板）、sandbox-playground.html（试验场）、sandbox-policy.html（策略）

### 沙箱实例页面 (index.html)
- 显示沙箱列表（沙箱ID、模板、CPU、内存、创建时间、状态）
- 支持搜索、刷新、分页
- 操作按钮：详情、远程桌面、启停管理、删除

### 网络策略页面 (sandbox-policy.html)
- 显示策略列表（策略ID、策略名称、访问源、目标VPC、目标子网、安全组）
- 支持创建策略弹窗
- 表单字段：策略名称、访问源、目标VPC、目标子网、安全组、描述

## 运行与预览
- 预览命令：`cd /workspace/projects && python3 -m http.server 5000 --bind 0.0.0.0`
- 访问地址：`http://localhost:5000/projects/index.html`

## 用户偏好与长期约束
1. 菜单结构：使用 `<div class="menu-item">` 或 `<a class="menu-item">` 作为菜单项
2. 当前页面高亮：使用 `<div class="menu-item active">` 或 `<a class="menu-item active">`
3. 弹窗实现：使用 `.modal-overlay` + `.modal-dialog` 结构
4. 按钮样式：`.btn-primary`（主按钮）、`.btn-default`（次要按钮）

## 常见问题和预防
1. HTML 标签闭合：确保 `<div>` 和 `</div>` 成对出现
2. JavaScript 执行顺序：所有 `<script>` 放在 `</body>` 前，确保 DOM 加载完成
3. 预览服务：使用端口 5000，服务器启动在 `/workspace/projects` 目录

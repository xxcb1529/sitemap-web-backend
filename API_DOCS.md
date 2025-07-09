# 网站地图生成器 API 文档

## 概述

网站地图生成器后端 API，支持多种方式生成网站地图，采用异步任务队列架构。

## 基础信息

- **基础 URL**: `http://localhost:3001/api`
- **健康检查**: `GET /api/health`
- **内容类型**: `application/json` (除下载接口外)

## API 接口

### 1. 系统接口

#### 健康检查

```
GET /api/health
```

**响应示例**:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 网站地图生成接口

#### 手动输入 URL 生成

```
POST /api/sitemap
```

**请求体**:

```json
{
  "urls": ["https://example.com", "https://example.com/about"],
  "changefreq": "daily",
  "priority": "0.8",
  "lastmod": "2024-01-01"
}
```

#### 自动爬取生成

```
POST /api/auto-sitemap
```

**请求体**:

```json
{
  "url": "https://example.com",
  "maxDepth": 3,
  "changefreq": "daily",
  "priority": "0.8",
  "lastmod": "2024-01-01"
}
```

#### 本地目录扫描生成

```
POST /api/local-sitemap
```

**请求体**:

```json
{
  "dirPath": "/path/to/html/files",
  "baseUrl": "https://example.com",
  "changefreq": "daily",
  "priority": "0.8",
  "lastmod": "2024-01-01"
}
```

### 3. 异步任务接口

#### 提交任务

```
POST /api/task/submit
```

**请求体**:

```json
{
  "type": "auto",
  "params": {
    "url": "https://example.com",
    "maxDepth": 3,
    "changefreq": "daily",
    "priority": "0.8",
    "lastmod": "2024-01-01"
  }
}
```

**响应**:

```json
{
  "taskId": "uuid-string",
  "message": "任务已提交，正在处理中"
}
```

#### 查询任务状态

```
GET /api/task/status?taskId=uuid-string
```

**响应**:

```json
{
  "status": "processing",
  "progress": 60,
  "error": null,
  "retryCount": 0
}
```

#### 获取任务结果

```
GET /api/task/result?taskId=uuid-string
```

**响应**: XML 格式的网站地图内容

#### 获取任务列表

```
GET /api/task/list?status=success
```

**响应**:

```json
{
  "tasks": [
    {
      "id": "uuid-string",
      "type": "auto",
      "status": "success",
      "progress": 100,
      "createdAt": 1704067200000,
      "updatedAt": 1704067260000
    }
  ],
  "total": 1
}
```

#### 获取任务日志

```
GET /api/task/log?taskId=uuid-string
```

**响应**:

```json
{
  "log": [
    "[2024-01-01T00:00:00.000Z] 任务开始处理",
    "[2024-01-01T00:00:05.000Z] 爬取到10个页面",
    "[2024-01-01T00:00:10.000Z] 任务成功完成"
  ],
  "taskId": "uuid-string"
}
```

#### 删除任务

```
DELETE /api/task/delete?taskId=uuid-string
```

**响应**:

```json
{
  "message": "任务删除成功",
  "taskId": "uuid-string"
}
```

## 错误处理

所有接口都使用统一的错误响应格式：

```json
{
  "error": "错误描述",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/sitemap"
}
```

## 任务状态说明

- `pending`: 等待处理
- `processing`: 处理中
- `success`: 成功完成
- `fail`: 处理失败

## 任务类型说明

- `auto`: 自动爬取
- `manual`: 手动输入 URL
- `local`: 本地目录扫描

## 架构特点

1. **路由分离**: 按功能模块分离路由文件
2. **中间件架构**: 统一的验证、错误处理、日志记录
3. **异步任务**: 支持长时间运行的任务，带进度反馈
4. **错误处理**: 统一的错误响应格式
5. **类型安全**: 完整的 TypeScript 类型定义
6. **任务持久化**: 任务信息保存到本地文件
7. **失败重试**: 支持任务失败自动重试
8. **超时处理**: 任务超时自动终止

## 开发说明

### 目录结构

```
src/
├── app.ts              # 主应用文件
├── routes/             # 路由文件
│   ├── index.ts        # 路由索引
│   ├── sitemap.ts      # 网站地图路由
│   ├── autoSitemap.ts  # 自动爬取路由
│   ├── localSitemap.ts # 本地扫描路由
│   └── sitemapTask.ts  # 任务管理路由
├── middleware/         # 中间件
│   ├── errorHandler.ts # 错误处理
│   ├── validation.ts   # 请求验证
│   └── logger.ts       # 日志记录
├── config/             # 配置文件
│   └── api.ts          # API配置
└── utils/              # 工具函数
    ├── sitemap.ts      # 网站地图生成
    ├── autoCrawler.ts  # 自动爬取
    └── taskManager.ts  # 任务管理
```

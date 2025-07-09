# 网站地图生成器后端架构文档

## 架构概述

本项目采用标准的分层架构模式，参考 Java Spring Boot 和.NET Core 的设计理念，实现了清晰的职责分离和可维护性。

## 架构层次

### 1. 表现层 (Presentation Layer)

**位置**: `src/routes/`
**职责**: 处理 HTTP 请求和响应，路由分发

- `index.ts` - 路由索引，统一管理所有路由
- `sitemap.ts` - 网站地图相关路由
- `autoSitemap.ts` - 自动爬取路由
- `localSitemap.ts` - 本地扫描路由
- `sitemapTask.ts` - 任务管理路由

### 2. 控制器层 (Controller Layer)

**位置**: `src/controllers/`
**职责**: 处理 HTTP 请求，调用服务层，返回响应

- `SitemapController.ts` - 网站地图控制器
- `TaskController.ts` - 任务管理控制器
- `SystemController.ts` - 系统管理控制器

### 3. 服务层 (Service Layer)

**位置**: `src/services/`
**职责**: 封装业务逻辑，处理复杂业务规则

- `SitemapService.ts` - 网站地图生成服务
- `TaskService.ts` - 任务管理服务
- `SystemService.ts` - 系统信息服务

### 4. 工具层 (Utility Layer)

**位置**: `src/utils/`
**职责**: 提供通用工具函数和数据访问

- `sitemap.ts` - 网站地图生成工具
- `autoCrawler.ts` - 自动爬取工具
- `taskManager.ts` - 任务管理工具

### 5. 中间件层 (Middleware Layer)

**位置**: `src/middleware/`
**职责**: 处理横切关注点

- `errorHandler.ts` - 统一错误处理
- `validation.ts` - 请求参数验证
- `logger.ts` - 日志记录

### 6. 配置层 (Configuration Layer)

**位置**: `src/config/`
**职责**: 管理配置信息和类型定义

- `api.ts` - API 配置和类型定义

## 设计模式

### 1. 依赖注入 (Dependency Injection)

控制器通过构造函数注入服务依赖：

```typescript
export class SitemapController {
  private sitemapService: SitemapService;

  constructor() {
    this.sitemapService = new SitemapService();
  }
}
```

### 2. 单一职责原则 (Single Responsibility Principle)

每个类都有明确的职责：

- 控制器：处理 HTTP 请求响应
- 服务：封装业务逻辑
- 工具：提供通用功能

### 3. 开闭原则 (Open/Closed Principle)

通过接口和抽象类实现扩展性：

```typescript
export interface SitemapOptions {
  changefreq?: string;
  priority?: number;
  lastmod?: string;
}
```

## 数据流

```
HTTP请求 → 路由 → 中间件 → 控制器 → 服务 → 工具 → 响应
```

### 详细流程

1. **请求接收**: Express 接收 HTTP 请求
2. **中间件处理**: 日志记录、参数验证、错误处理
3. **路由分发**: 根据 URL 路径分发到对应控制器
4. **控制器处理**: 解析请求参数，调用服务层
5. **服务层处理**: 执行业务逻辑，调用工具层
6. **工具层处理**: 执行具体操作（文件操作、网络请求等）
7. **响应返回**: 返回处理结果

## 错误处理

### 统一错误处理

所有错误通过中间件统一处理：

```typescript
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "服务器内部错误";

  res.status(statusCode).json({
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
```

### 错误传播

错误从底层向上传播：

```
工具层 → 服务层 → 控制器 → 中间件 → 客户端
```

## 配置管理

### 环境配置

支持不同环境的配置：

```typescript
const port = process.env.PORT || 3001;
```

### API 配置

统一的 API 路径配置：

```typescript
export const API_PATHS = {
  BASE: "/api",
  SITEMAP: {
    GENERATE: "/sitemap",
    AUTO: "/auto-sitemap",
    LOCAL: "/local-sitemap",
  },
  // ...
};
```

## 扩展性设计

### 1. 新增功能

要添加新功能，只需：

1. 在`controllers/`中添加新控制器
2. 在`services/`中添加新服务
3. 在`routes/`中添加新路由
4. 在`middleware/`中添加新中间件（如需要）

### 2. 数据库集成

可以轻松添加数据库层：

```
控制器 → 服务 → 数据访问层 → 数据库
```

### 3. 缓存集成

可以在服务层添加缓存：

```
控制器 → 服务 → 缓存 → 数据访问层
```

## 测试策略

### 单元测试

- 服务层：测试业务逻辑
- 工具层：测试工具函数
- 控制器：测试请求处理

### 集成测试

- API 接口测试
- 数据库集成测试
- 中间件测试

## 部署考虑

### 1. 环境变量

```bash
PORT=3001
NODE_ENV=production
```

### 2. 日志管理

- 请求日志
- 错误日志
- 性能监控

### 3. 健康检查

```bash
GET /api/health
GET /api/system
```

## 性能优化

### 1. 异步处理

- 任务队列处理长时间运行的任务
- 非阻塞 I/O 操作

### 2. 内存管理

- 任务信息持久化
- 定期清理过期数据

### 3. 错误重试

- 自动重试机制
- 超时处理

## 安全考虑

### 1. 输入验证

- 参数类型检查
- 数据格式验证
- 恶意输入过滤

### 2. 错误信息

- 不暴露敏感信息
- 统一的错误响应格式

### 3. 访问控制

- CORS 配置
- 请求频率限制（可扩展）

## 总结

这种分层架构具有以下优势：

1. **可维护性**: 清晰的职责分离，易于理解和修改
2. **可扩展性**: 松耦合设计，易于添加新功能
3. **可测试性**: 各层独立，便于单元测试
4. **可重用性**: 服务层和工具层可被多个控制器复用
5. **标准化**: 符合企业级开发标准，便于团队协作

这种架构设计参考了 Java Spring Boot 和.NET Core 的最佳实践，适合中大型项目的开发和维护。

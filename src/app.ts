import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use(requestLogger);

// API路由
app.use("/api", routes);

// 根路径
app.get("/", (req, res) => {
  res.json({
    message: "Sitemap Generator Backend Running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// 404处理
app.use("*", (req, res) => {
  res.status(404).json({
    error: "接口不存在",
    path: req.originalUrl,
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 服务器运行在 http://localhost:${port}`);
  console.log(`📊 健康检查: http://localhost:${port}/api/health`);
});

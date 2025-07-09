import express from "express";
import cors from "cors";
import sitemapRouter from "./routes/sitemap";
import autoSitemapRouter from "./routes/autoSitemap";
import localSitemapRouter from "./routes/localSitemap";
import sitemapTaskRouter from "./routes/sitemapTask";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/api", sitemapRouter);
app.use("/api", autoSitemapRouter);
app.use("/api", localSitemapRouter);
app.use("/api", sitemapTaskRouter);

app.get("/", (req, res) => {
  res.send("Sitemap Generator Backend Running");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

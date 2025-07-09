import Crawler from "simplecrawler";

export function crawlSite(startUrl: string, maxDepth = 3): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const urlSet = new Set<string>();
    const crawler = new Crawler(startUrl);
    crawler.maxDepth = maxDepth;
    crawler.downloadUnsupported = false;
    crawler.respectRobotsTxt = false;
    crawler.interval = 250;
    crawler.maxConcurrency = 5;
    // 用 as any 绕过类型检查
    (crawler.addFetchCondition as any)(
      (queueItem: any, _referrerQueueItem: any, callback: any) => {
        callback(null, queueItem.host === crawler.host);
      }
    );
    crawler.on("fetchcomplete", (queueItem: any) => {
      urlSet.add(queueItem.url);
    });
    crawler.on("complete", () => {
      resolve(Array.from(urlSet));
    });
    crawler.on("fetcherror", () => {});
    crawler.on("fetchtimeout", () => {});
    crawler.on("fetchclienterror", () => {});
    crawler.start();
  });
}

const TikTokScraper = require('tiktok-scraper');

Tiktok = (url) => {
  return new Promise(async (resolve, reject) => {
	  if(!url) return;
		try {
			const videoMeta = await TikTokScraper.getVideoMeta(url);
			if(videoMeta.collector[0].videoUrlNoWaterMark != null)
			  resolve({
				video: videoMeta.collector[0].videoUrlNoWaterMark,
				jud: videoMeta.collector[0].text,
				own: videoMeta.collector[0].authorMeta.nickName
			  })
			else
			  resolve({
				video: videoMeta.collector[0].videoUrl,
				jud: videoMeta.collector[0].text,
				own: videoMeta.collector[0].authorMeta.nickName
			  })
		} catch (error) {
			reject(error);
		}
	})
}
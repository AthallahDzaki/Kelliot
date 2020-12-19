const TikTokScraper = require('tiktok-scraper');

Tiktok = (url) => {
  return new Promise((resolve, reject) => {
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
			  console.log(videoMeta.collector[0].videoUrl);
		} catch (error) {
			console.log(error);
		}
	})
}
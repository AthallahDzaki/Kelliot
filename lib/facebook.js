const fbdl = require("fbdl-core");

module.exports = fb = (url) => new Promise((resolve, reject) => {
	if(!url || url == undefined) return reject("Bejat");
	fbdl.getInfo(url)
	.then(res => {
		resolve({
			hd: res.streamURL,
			sd: res.rawVideo
		});
	}).catch(err => reject(err));
})
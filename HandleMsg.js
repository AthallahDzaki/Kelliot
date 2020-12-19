require('dotenv').config()
const { decryptMedia } = require('@open-wa/wa-automate')

const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const axios = require('axios')
const fetch = require('node-fetch')

const { 
    removeBackgroundFromImageBase64
} = require('remove.bg')

const {
    exec
} = require('child_process')

const { 
    menuId, 
    cekResi, 
    urlShortener, 
    meme, 
    translate, 
    getLocationData,
    images,
    resep,
    nekopoi,
    api,
	fb,
	ig,
	tt
} = require('./lib')

const { 
    msgFilter, 
    color, 
    processTime, 
    isUrl,
	download
} = require('./utils')

const { uploadImages } = require('./utils/fetcher')

const fs = require('fs-extra')

const setting = JSON.parse(fs.readFileSync('./settings/setting.json'))
let { 
    ownerNumber, 
    groupLimit, 
    memberLimit,
    prefix
} = setting

const {
    apiNoBg
} = JSON.parse(fs.readFileSync('./settings/api.json'))

function formatin(duit){
    let	reverse = duit.toString().split('').reverse().join('');
    let ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');
    return ribuan;
}

const inArray = (needle, haystack) => {
    let length = haystack.length;
    for(let i = 0; i < length; i++) {
        if(haystack[i].id == needle) return i;
    }
    return false;
}

module.exports = HandleMsg = async (kelliot, message) => {
    try {
        const { type, id, from, t, sender, author, isGroupMsg, chat, chatId, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        var { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await kelliot.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await kelliot.getGroupAdmins(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
		const chats = (type === 'chat') ? body : (type === 'image' || type === 'video') ? caption : ''
		const pengirim = sender.id
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false

        // Bot Prefix
        body = (type === 'chat' && body.startsWith(prefix)) ? body : ((type === 'image' && caption || type === 'video' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.trim().substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const uaOverride = process.env.UserAgent
        const url = args.length !== 0 ? args[0] : ''
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'
		
		// [IDENTIFY]
		const isOwnerBot = ownerNumber.includes(pengirim)

        // [BETA] Avoid Spam Message
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        //
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }

        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)
	
	//[AUTO READ] Auto read message 
	kelliot.sendSeen(chatId)
	    		
        switch (command) {
        // Menu and TnC
        case 'speed':
        case 'ping':
            await kelliot.sendText(from, `Pong!!!!\nSpeed: ${processTime(t, moment())} _Second_`)
            break
        case 'notes':
        case 'menu':
        case 'help':
            await kelliot.sendText(from, menuId.textMenu(pushname))
            .then(() => ((isGroupMsg) && (isGroupAdmins)) ? kelliot.sendText(from, `Menu Admin Grup: *${prefix}menuadmin*`) : null)
            break
        case 'menuadmin':
            if (!isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return kelliot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            await kelliot.sendText(from, menuId.textAdmin())
            break
        case 'donate':
        case 'donasi':
            await kelliot.sendText(from, menuId.textDonasi())
            break
        case 'ownerbot':
            await kelliot.sendContact(from, ownerNumber)
            .then(() => kelliot.sendText(from, 'Jika kalian ingin request fitur silahkan chat nomor owner!'))
            break
        case 'milf' :
	 if(isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai di private Message! [PM Only]', id)
	 await fetch('https://raw.githubusercontent.com/EBazarov/nsfw_data_source_urls/master/raw_data/age_milf/urls_age_milf.txt')
	                       .then(res => res.text())
			 .then(body => {
				let a = body.split("\n")
				let b = a[Math.floor(Math.random() * a.length)]
				kelliot.sendFileFromUrl(from, b, "milf.png", '', null, null, true)
			  });
	 break
        case 'bb' :
	 if(isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai di private Message! [PM Only]', id)
	 await fetch('https://raw.githubusercontent.com/EBazarov/nsfw_data_source_urls/master/raw_data/body-parts_upper-body_breasts_large/reddit_sub_bigboobs/urls.txt')
	                       .then(res => res.text())
			 .then(body => {
				let a = body.split("\n")
				let b = a[Math.floor(Math.random() * a.length)]
				kelliot.sendFileFromUrl(from, b, "bb.png", '', null, null, true)
			  });
	 break
        case 'hb' :
	 if(isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai di private Message! [PM Only]', id)
	 await fetch('https://raw.githubusercontent.com/EBazarov/nsfw_data_source_urls/master/raw_data/body-parts_upper-body_breasts_large/reddit_sub_hugeboobs/urls.txt')
	                       .then(res => res.text())
			 .then(body => {
				let a = body.split("\n")
				let b = a[Math.floor(Math.random() * a.length)]
				kelliot.sendFileFromUrl(from, b, "hb.png", '', null, null, true)
			  });
	 break
        case 'mansturbate' :
	 if(isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai di private Message! [PM Only]', id)
	 await fetch('https://raw.githubusercontent.com/EBazarov/nsfw_data_source_urls/master/raw_data/sex_orgasm/reddit_sub_Womenorgasm/urls.txt')
	                       .then(res => res.text())
			 .then(body => {
				let a = body.split("\n")
				let b = a[Math.floor(Math.random() * a.length)]
				if(b.includes(".mp4")) return kelliot.sendFileFromUrl(from, b, "masturbate.mp4", '', null, null, false)
				if(b.includes(".gif")) return kelliot.sendVideoAsGif(from, b, "masturbate.gif", '', null, null, true)
				kelliot.sendFileFromUrl(from, b, "masturbate.png", '', null, null, true)
			  });
	 break
        case 'nude' :
	 if(isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai di private Message! [PM Only]', id)
	 var items = ["boobs", "pussy", "4k", "hentai", "anal", "hanal", "hass", "hboobs"];
    	 var gambar = items[Math.floor(Math.random() * items.length)];
  	 const response = await fetch('https://nekobot.xyz/api/image?type='+gambar)
	 if(response.status !== 200) return console.log("No Link Included")	
	 const json = await response.json();
	 await kelliot.sendFileFromUrl(from, json.message, "NSFW.png", '', null, null, true)
	 break
        case 'gombal':
	 fetch('https://raw.githubusercontent.com/pajaar/grabbed-results/master/pajaar-2020-pantun-pakboy.txt')
	    .then(res => res.text())
	    .then(body => {
		let tod = body.split("\n");
		let pjr = tod[Math.floor(Math.random() * tod.length)];
		kelliot.reply(from, pjr.replace(/pjrx-line/g,"\n"));
	 });
            break
        case 'join':
            if (args.length == 0) return kelliot.reply(from, `Jika kalian ingin mengundang bot kegroup silahkan invite atau dengan\nketik ${prefix}join [link group]`, id)
            let linkgrup = body.slice(6)
            let islink = linkgrup.match(/(https:\/\/chat.whatsapp.com)/gi)
            let chekgrup = await kelliot.inviteInfo(linkgrup)
            if (!islink) return kelliot.reply(from, 'Maaf link group-nya salah! silahkan kirim link yang benar', id)
            if (isOwnerBot) {
                await kelliot.joinGroupViaLink(linkgrup)
                      .then(async () => {
                          await kelliot.sendText(from, 'Berhasil join grup via link!')
                          await kelliot.sendText(chekgrup.id, `Hai Brother And Sister, Im Kelliot. To find out the commands on this Bot type ${prefix}menu`)
                      })
            } else {
                let cgrup = await kelliot.getAllGroups()
                if (cgrup.length > groupLimit) return kelliot.reply(from, `Sorry, the group on this bot is full\nMax Group is: ${groupLimit}`, id)
                if (cgrup.size < memberLimit) return kelliot.reply(from, `Sorry, Bot wil not join if the group members do not exceed ${memberLimit} people`, id)
                await kelliot.joinGroupViaLink(linkgrup)
                      .then(async () =>{
                          await kelliot.reply(from, 'Berhasil join grup via link!', id)
                      })
                      .catch(() => {
                          kelliot.reply(from, 'Gagal!', id)
                      })
            }
            break
        case 'botstat': {
            const loadedMsg = await kelliot.getAmountOfLoadedMessages()
            const chatIds = await kelliot.getAllChatIds()
            const groups = await kelliot.getAllGroups()
            kelliot.sendText(from, `Status :\n- *${loadedMsg}* Loaded Messages\n- *${groups.length}* Group Chats\n- *${chatIds.length - groups.length}* Personal Chats\n- *${chatIds.length}* Total Chats`)
            break
        }

	//Sticker Converter
	case 'stikertoimg':
	case 'stickertoimg':
	case 'stimg':
            if (quotedMsg && quotedMsg.type == 'sticker') {
                const mediaData = await decryptMedia(quotedMsg)
                kelliot.reply(from, `Sedang di proses! Silahkan tunggu sebentar...`, id)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                await kelliot.sendFile(from, imageBase64, 'imgsticker.jpg', 'Berhasil convert Sticker to Image!', id)
                .then(() => {
                    console.log(`Sticker to Image Processed for ${processTime(t, moment())} Seconds`)
                })
        } else if (!quotedMsg) return kelliot.reply(from, `Format salah, silahkan tag sticker yang ingin dijadikan gambar!`, id)
        break
			
			
        // Sticker Creator
	case 'coolteks':
	case 'cooltext':
            if (args.length == 0) return kelliot.reply(from, `Untuk membuat teks keren CoolText pada gambar, gunakan ${prefix}cooltext teks\n\nContoh: ${prefix}cooltext Anjay Mabar`, id)
		api.cooltext(args[0])
		.then(async(res) => {
		await kelliot.sendFileFromUrl(from, `${res.link}`, '', `${res.text}`, id)
		})
		break
        case 'sticker':
        case 'stiker':
            if ((isMedia || isQuotedImage) && args.length === 0) {
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                kelliot.sendImageAsSticker(from, imageBase64)
                .then(() => {
                    kelliot.reply(from, 'Here\'s your sticker')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                })
            } else if (args[0] === 'nobg') {
                if (ISMEDIA || isQuotedImage) {
                    try {
                    var mediaData = await decryptMedia(message, uaOverride)
                    var imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                    var base64img = imageBase64
                    var outFile = './media/noBg.png'
		            // kamu dapat mengambil api key dari website remove.bg dan ubahnya difolder settings/api.json
                    var result = await removeBackgroundFromImageBase64({ base64img, apiKey: apiNoBg, size: 'auto', type: 'auto', outFile })
                    await fs.writeFile(outFile, result.base64img)
                    await kelliot.sendImageAsSticker(from, `data:${mimetype};base64,${result.base64img}`)
                    } catch(err) {
                    console.log(err)
	   	            await kelliot.reply(from, 'Maaf batas penggunaan hari ini sudah mencapai maksimal', id)
                    }
                }
            } else if (args.length === 1) {
                if (!isUrl(url)) { await kelliot.reply(from, 'Maaf, link yang kamu kirim tidak valid.', id) }
                kelliot.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                    ? kelliot.sendText(from, 'Maaf, link yang kamu kirim tidak memuat gambar.')
                    : kelliot.reply(from, 'Here\'s your sticker')).then(() => console.log(`Sticker Processed for ${processTime(t, moment())} Second`))
            } else {
                await kelliot.reply(from, `Tidak ada gambar! Untuk menggunakan ${prefix}sticker\n\n\nKirim gambar dengan caption\n${prefix}sticker <biasa>\n${prefix}sticker nobg <tanpa background>\n\natau Kirim pesan dengan\n${prefix}sticker <link_gambar>`, id)
            }
            break
		case 'brainly':
            if (args.length >= 2){
                const BrainlySearch = require('./lib/brainly')
                let tanya = body.slice(9)
                let jum = Number(tanya.split('.')[1]) || 2
                if (jum > 10) return kelliot.reply(from, 'Max 10!', id)
                if (Number(tanya[tanya.length-1])){
                    tanya
                }
                kelliot.reply(from, `? *Pertanyaan* : ${tanya.split('.')[0]}\n\n? *Jumlah jawaban* : ${Number(jum)}`, id)
				await BrainlySearch(tanya.split('.')[0],Number(jum)).then( res => {
					if (res.jawaban.fotoJawaban.length == 0) {
						kelliot.reply(from, `? *Pertanyaan* : ${res.pertanyaan}\n\n? *Jawaban* : ${res.jawaban.judulJawaban}\n`, id)
					} else {
						kelliot.reply(from, `? *Pertanyaan* : ${res.pertanyaan}\n\n? *Jawaban* ?: ${res.jawaban.judulJawaban}\n\n? *Link foto jawaban* : ${res.jawaban.fotoJawaban.join('\n')}`, id)
					}
                })
            } else {
                kelliot.reply(from, 'Usage :\n!brainly [pertanyaan] [.jumlah]\n\nEx : \n!brainly NKRI .2', id)
            }
            break
        case 'stickergif':
        case 'stikergif':
            if (isMedia || isQuotedVideo) {
                if (mimetype === 'video/mp4' && message.duration <= 11 || mimetype === 'image/gif') {
                    var mediaData = await decryptMedia(message, uaOverride)
                    kelliot.reply(from, '[WAIT] Sedang di proses? silahkan tunggu � 1 min!', id)
                    kelliot.sendMp4AsSticker(from, mediaData);
                  } else {
                    kelliot.reply(from, `[?] Kirim gif dengan caption *${prefix}stickergif* max 10 sec!`, id)
                   }
                } else {
		    kelliot.reply(from, `[?] Kirim Video / Gif dengan caption *${prefix}stickergif*`, id)
	        }
            break
        case 'stikergiphy':
        case 'stickergiphy':
            if (args.length !== 1) return kelliot.reply(from, `Maaf, format pesan salah.\nKetik pesan dengan ${prefix}stickergiphy <link_giphy>`, id)
            const isGiphy = url.match(new RegExp(/https?:\/\/(www\.)?giphy.com/, 'gi'))
            const isMediaGiphy = url.match(new RegExp(/https?:\/\/media.giphy.com\/media/, 'gi'))
            if (isGiphy) {
                const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
                if (!getGiphyCode) { return kelliot.reply(from, 'Gagal mengambil kode giphy', id) }
                const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
                const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                kelliot.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    kelliot.reply(from, 'Here\'s your sticker')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
            } else if (isMediaGiphy) {
                const gifUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                if (!gifUrl) { return kelliot.reply(from, 'Gagal mengambil kode giphy', id) }
                const smallGifUrl = url.replace(gifUrl[0], 'giphy-downsized.gif')
                kelliot.sendGiphyAsSticker(from, smallGifUrl)
                .then(() => {
                    kelliot.reply(from, 'Here\'s your sticker')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                })
                .catch(() => {
                    kelliot.reply(from, `Ada yang error!`, id)
                })
            } else {
                await kelliot.reply(from, 'Maaf, command sticker giphy hanya bisa menggunakan link dari giphy.  [Giphy Only]', id)
            }
            break
        case 'meme':
            if ((isMedia || isQuotedImage) && args.length >= 2) {
                const top = arg.split('|')[0]
                const bottom = arg.split('|')[1]
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const getUrl = await uploadImages(mediaData, false)
                const ImageBase64 = await meme.custom(getUrl, top, bottom)
                kelliot.sendFile(from, ImageBase64, 'image.png', '', null, true)
                    .then(() => {
                        kelliot.reply(from, 'Ini makasih!',id)
                    })
                    .catch(() => {
                        kelliot.reply(from, 'Ada yang error!')
                    })
            } else {
                await kelliot.reply(from, `Tidak ada gambar! Silahkan kirim gambar dengan caption ${prefix}meme <teks_atas> | <teks_bawah>\ncontoh: ${prefix}meme teks atas | teks bawah`, id)
            }
            break
        case 'quotemaker':
            const qmaker = body.trim().split('|')
            if (qmaker.length >= 3) {
                const quotes = qmaker[1]
                const author = qmaker[2]
                const theme = qmaker[3]
                kelliot.reply(from, 'Proses kak..', id)
                try {
                    const hasilqmaker = await images.quote(quotes, author, theme)
                    kelliot.sendFileFromUrl(from, `${hasilqmaker}`, '', 'Ini kak..', id)
                } catch {
                    kelliot.reply('Yahh proses gagal, kakak isinya sudah benar belum?..', id)
                }
            } else {
                kelliot.reply(from, `Pemakaian ${prefix}quotemaker |isi quote|author|theme\n\ncontoh: ${prefix}quotemaker |aku sayang kamu|-kelliot|random\n\nuntuk theme nya pakai random ya kak..`)
            }
            break
        case 'nulis':
            if (args.length == 0) return kelliot.reply(from, `Membuat bot menulis teks yang dikirim menjadi gambar\nPemakaian: ${prefix}nulis [teks]\n\ncontoh: ${prefix}nulis -[nama] -[kelas] -[teks]*\n\n*Contoh :*\n!nulis -Athallah Dzaki -10 IPA 3 -1+1=2`, id)
	 const nulis = body.slice(7)
            console.log(nulis)
            let urlnulis = "http://freerestapi-backend-py.herokuapp.com/nulis?text="+nulis;
	 let settingnulis = { method: "Get" };
	 await fetch(urlnulis, settingnulis)
	    .then(res => res.json())
	    .then((json) => {
	        kelliot.sendFile(from, json.result, 'Teks.jpg','Monggo...');
	    }).catch(e => kelliot.reply(from, "Error"+e));            
	 break
                
	break

        //Islam Command
        case 'listsurah':
            try {
                axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah.json')
                .then((response) => {
                    let hehex = '+--?? List Surah ??--\n'
                    for (let i = 0; i < response.data.data.length; i++) {
                        hehex += '�? '
                        hehex += response.data.data[i].name.transliteration.id.toLowerCase() + '\n'
                            }
                        hehex += '+-? *A R U G A  B O T* ?'
                    kelliot.reply(from, hehex, id)
                })
            } catch(err) {
                kelliot.reply(from, err, id)
            }
            break
        case 'infosurah':
            if (args.length == 0) return kelliot.reply(from, `*_${prefix}infosurah <nama surah>_*\nMenampilkan informasi lengkap mengenai surah tertentu. Contoh penggunan: ${prefix}infosurah al-baqarah`, message.id)
                var responseh = await axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah.json')
                var { data } = responseh.data
                var idx = data.findIndex(function(post, index) {
                  if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                    return true;
                });
                var pesan = ""
                pesan = pesan + "Nama : "+ data[idx].name.transliteration.id + "\n" + "Asma : " +data[idx].name.short+"\n"+"Arti : "+data[idx].name.translation.id+"\n"+"Jumlah ayat : "+data[idx].numberOfVerses+"\n"+"Nomor surah : "+data[idx].number+"\n"+"Jenis : "+data[idx].revelation.id+"\n"+"Keterangan : "+data[idx].tafsir.id
                kelliot.reply(from, pesan, message.id)
              break
        case 'surah':
            if (args.length == 0) return kelliot.reply(from, `*_${prefix}surah <nama surah> <ayat>_*\nMenampilkan ayat Al-Quran tertentu beserta terjemahannya dalam bahasa Indonesia. Contoh penggunaan : ${prefix}surah al-baqarah 1\n\n*_${prefix}surah <nama surah> <ayat> en/id_*\nMenampilkan ayat Al-Quran tertentu beserta terjemahannya dalam bahasa Inggris / Indonesia. Contoh penggunaan : ${prefix}surah al-baqarah 1 id`, message.id)
                var responseh = await axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah.json')
                var { data } = responseh.data
                var idx = data.findIndex(function(post, index) {
                  if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                    return true;
                });
                nmr = data[idx].number
                if(!isNaN(nmr)) {
                  var responseh2 = await axios.get('https://api.quran.sutanlab.id/surah/'+nmr+"/"+args[1])
                  var {data} = responseh2.data
                  var last = function last(array, n) {
                    if (array == null) return void 0;
                    if (n == null) return array[array.length - 1];
                    return array.slice(Math.max(array.length - n, 0));
                  };
                  bhs = last(args)
                  pesan = ""
                  pesan = pesan + data.text.arab + "\n\n"
                  if(bhs == "en") {
                    pesan = pesan + data.translation.en
                  } else {
                    pesan = pesan + data.translation.id
                  }
                  pesan = pesan + "\n\n(Q.S. "+data.surah.name.transliteration.id+":"+args[1]+")"
                  kelliot.reply(from, pesan, message.id)
                }
              break
        case 'tafsir':
            if (args.length == 0) return kelliot.reply(from, `*_${prefix}tafsir <nama surah> <ayat>_*\nMenampilkan ayat Al-Quran tertentu beserta terjemahan dan tafsirnya dalam bahasa Indonesia. Contoh penggunaan : ${prefix}tafsir al-baqarah 1`, message.id)
                var responsh = await axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah.json')
                var {data} = responsh.data
                var idx = data.findIndex(function(post, index) {
                  if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                    return true;
                });
                nmr = data[idx].number
                if(!isNaN(nmr)) {
                  var responsih = await axios.get('https://api.quran.sutanlab.id/surah/'+nmr+"/"+args[1])
                  var {data} = responsih.data
                  pesan = ""
                  pesan = pesan + "Tafsir Q.S. "+data.surah.name.transliteration.id+":"+args[1]+"\n\n"
                  pesan = pesan + data.text.arab + "\n\n"
                  pesan = pesan + "_" + data.translation.id + "_" + "\n\n" +data.tafsir.id.long
                  kelliot.reply(from, pesan, message.id)
              }
              break
        case 'alaudio':
            if (args.length == 0) return kelliot.reply(from, `*_${prefix}ALaudio <nama surah>_*\nMenampilkan tautan dari audio surah tertentu. Contoh penggunaan : ${prefix}ALaudio al-fatihah\n\n*_${prefix}ALaudio <nama surah> <ayat>_*\nMengirim audio surah dan ayat tertentu beserta terjemahannya dalam bahasa Indonesia. Contoh penggunaan : ${prefix}ALaudio al-fatihah 1\n\n*_${prefix}ALaudio <nama surah> <ayat> en_*\nMengirim audio surah dan ayat tertentu beserta terjemahannya dalam bahasa Inggris. Contoh penggunaan : ${prefix}ALaudio al-fatihah 1 en`, message.id)
              ayat = "ayat"
              bhs = ""
                var responseh = await axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah.json')
                var surah = responseh.data
                var idx = surah.data.findIndex(function(post, index) {
                  if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                    return true;
                });
                nmr = surah.data[idx].number
                if(!isNaN(nmr)) {
                  if(args.length > 2) {
                    ayat = args[1]
                  }
                  if (args.length == 2) {
                    var last = function last(array, n) {
                      if (array == null) return void 0;
                      if (n == null) return array[array.length - 1];
                      return array.slice(Math.max(array.length - n, 0));
                    };
                    ayat = last(args)
                  } 
                  pesan = ""
                  if(isNaN(ayat)) {
                    var responsih2 = await axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah/'+nmr+'.json')
                    var {name, name_translations, number_of_ayah, number_of_surah,  recitations} = responsih2.data
                    pesan = pesan + "Audio Quran Surah ke-"+number_of_surah+" "+name+" ("+name_translations.ar+") "+ "dengan jumlah "+ number_of_ayah+" ayat\n"
                    pesan = pesan + "Dilantunkan oleh "+recitations[0].name+" : "+recitations[0].audio_url+"\n"
                    pesan = pesan + "Dilantunkan oleh "+recitations[1].name+" : "+recitations[1].audio_url+"\n"
                    pesan = pesan + "Dilantunkan oleh "+recitations[2].name+" : "+recitations[2].audio_url+"\n"
                    kelliot.reply(from, pesan, message.id)
                  } else {
                    var responsih2 = await axios.get('https://api.quran.sutanlab.id/surah/'+nmr+"/"+ayat)
                    var {data} = responsih2.data
                    var last = function last(array, n) {
                      if (array == null) return void 0;
                      if (n == null) return array[array.length - 1];
                      return array.slice(Math.max(array.length - n, 0));
                    };
                    bhs = last(args)
                    pesan = ""
                    pesan = pesan + data.text.arab + "\n\n"
                    if(bhs == "en") {
                      pesan = pesan + data.translation.en
                    } else {
                      pesan = pesan + data.translation.id
                    }
                    pesan = pesan + "\n\n(Q.S. "+data.surah.name.transliteration.id+":"+args[1]+")"
                    await kelliot.sendFileFromUrl(from, data.audio.secondary[0])
                    await kelliot.reply(from, pesan, message.id)
                  }
              }
              break
        case 'jsolat':
            if (args.length == 0) return kelliot.reply(from, `Untuk melihat jadwal solat dari setiap daerah yang ada\nketik: ${prefix}jsolat [daerah]\n\nuntuk list daerah yang ada\nketik: ${prefix}daerah`, id)
            const solatx = body.slice(8)
            const solatj = await api.jadwaldaerah(solatx)
            await kelliot.reply(from, solatj, id)
            .catch(() => {
                kelliot.reply(from, 'Pastikan daerah kamu ada di list ya!', id)
            })
            break
        case 'daerah':
            const daerahq = await api.daerah()
            await kelliot.reply(from, daerahq, id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
		//Group All User
		case 'grouplink':
            if (!isBotGroupAdmins) return kelliot.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
            if (isGroupMsg) {
                const inviteLink = await kelliot.getGroupInviteLink(groupId);
                kelliot.sendLinkWithAutoPreview(from, inviteLink, `\nLink group *${name}* Gunakan *${prefix}revoke* untuk mereset Link group`)
            } else {
            	kelliot.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            }
            break
		case "revoke":
		if (!isBotGroupAdmins) return kelliot.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
                    if (isBotGroupAdmins) {
                        kelliot
                            .revokeGroupInviteLink(from)
                            .then((res) => {
                                kelliot.reply(from, `Berhasil Revoke Grup Link gunakan *${prefix}grouplink* untuk mendapatkan group invite link yang terbaru`, id);
                            })
                            .catch((err) => {
                                console.log(`[ERR] ${err}`);
                            });
                    }
                    break;
        //Media
        case 'ytmp3':
            if (args.length == 0) return kelliot.reply(from, `Untuk mendownload lagu dari youtube\nketik: ${prefix}ytmp3 [link_yt]`, id)
            const linkmp3 = args[0].replace('https://youtu.be/','').replace('https://www.youtube.com/watch?v=','')
			api.ytmp3(`https://youtu.be/${linkmp3}`)
            .then(async(res) => {
				if (res.error) return kelliot.sendFileFromUrl(from, `${res.url}`, '', `${res.error}`)
				await kelliot.sendFileFromUrl(from, `${res.result.thumb}`, '', `Lagu ditemukan\n\nJudul: ${res.result.title}\nDesc: ${res.result.desc}\nSabar lagi dikirim`, id)
				await kelliot.sendFileFromUrl(from, `${res.result.url}`, '', '', id)
				.catch(() => {
					kelliot.reply(from, `URL Ini ${args[0]} Sudah pernah di Download sebelumnya. URL Akan di Reset setelah 1 Jam/60 Menit`, id)
				})
			})
            break
        case 'ytmp4':
            if (args.length == 0) return kelliot.reply(from, `Untuk mendownload lagu dari youtube\nketik: ${prefix}ytmp3 [link_yt]`, id)
            const linkmp4 = args[0].replace('https://youtu.be/','').replace('https://www.youtube.com/watch?v=','')
			api.ytmp4(`https://youtu.be/${linkmp4}`)
            .then(async(res) => {
				if (res.error) return kelliot.sendFileFromUrl(from, `${res.url}`, '', `${res.error}`)
				await kelliot.sendFileFromUrl(from, `${res.result.thumb}`, '', `Lagu ditemukan\n\nJudul: ${res.result.title}\nDesc: ${res.result.desc}\nSabar lagi dikirim`, id)
				await kelliot.sendFileFromUrl(from, `${res.result.url}`, '', '', id)
				.catch(() => {
					kelliot.reply(from, `URL Ini ${args[0]} Sudah pernah di Download sebelumnya. URL akan di Reset setelah 1 Jam/60 Menit`, id)
				})
			})
            break
		case 'fb':
		case 'facebook':
			if (args.length == 0) return kelliot.reply(from, `Untuk mendownload video dari link facebook\nketik: ${prefix}fb [link_fb]`, id)
			fb(args[0])
			.then(async (res) => {
				console.log(res);
				if (res.status == 'error') return kelliot.reply(from, 'Maaf url anda tidak dapat ditemukan', id)
				await kelliot.sendFileFromUrl(from, res.sd, '', 'Nih ngab videonya', id)
				.catch(async () => {
					await kelliot.sendFileFromUrl(from, res.hd, '', 'Nih ngab videonya', id)
					.catch(() => {
						kelliot.reply(from, 'Maaf url anda tidak dapat ditemukan', id)
					})
				})
			})
			break
			
		//Primbon Menu
		case 'cekzodiak':
            if (args.length !== 4) return kelliot.reply(from, `Untuk mengecek zodiak, gunakan ${prefix}cekzodiak nama tanggallahir bulanlahir tahunlahir\nContoh: ${prefix}cekzodiak fikri 13 06 2004`, id)
            const cekzodiak = await api.cekzodiak(args[0],args[1],args[2])
            await kelliot.reply(from, cekzodiak, id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
		case 'artinama':
			if (args.length == 0) return kelliot.reply(from, `Untuk mengetahui arti nama seseorang\nketik ${prefix}artinama namakamu`, id)
            api.artinama(body.slice(10))
			.then(async(res) => {
				await kelliot.reply(from, `Arti : ${res}`, id)
			})
			break
		case 'cekjodoh':
			if (args.length !== 2) return kelliot.reply(from, `Untuk mengecek jodoh melalui nama\nketik: ${prefix}cekjodoh nama-kamu nama-pasangan\n\ncontoh: ${prefix}cekjodoh bagas siti\n\nhanya bisa pakai nama panggilan (satu kata)`)
			api.cekjodoh(args[0],args[1])
			.then(async(res) => {
				await kelliot.sendFileFromUrl(from, `${res.link}`, '', `${res.text}`, id)
			})
			break
			
        // Random Kata
      	case 'motivasi':
            fetch('https://raw.githubusercontent.com/selyxn/motivasi/main/motivasi.txt')
            .then(res => res.text())
            .then(body => {
                let splitmotivasi = body.split('\n')
                let randommotivasi = splitmotivasi[Math.floor(Math.random() * splitmotivasi.length)]
                kelliot.reply(from, randommotivasi, id)
            })
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
	      case 'howgay':
        		if (args.length == 0) return kelliot.reply(from, `Untuk mengetahui seberapa gay seseorang gunakan ${prefix}howgay namanya\n\nContoh: ${prefix}howgay burhan`, id)
            fetch('https://raw.githubusercontent.com/MrPawNO/howgay/main/howgay.txt')
            .then(res => res.text())
            .then(body => {
                let splithowgay = body.split('\n')
                let randomhowgay = splithowgay[Math.floor(Math.random() * splithowgay.length)]
                kelliot.reply(from, randomhowgay, id)
            })
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'fakta':
            fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/faktaunix.txt')
            .then(res => res.text())
            .then(body => {
                let splitnix = body.split('\n')
                let randomnix = splitnix[Math.floor(Math.random() * splitnix.length)]
                kelliot.reply(from, randomnix, id)
            })
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'katabijak':
            fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/katabijax.txt')
            .then(res => res.text())
            .then(body => {
                let splitbijak = body.split('\n')
                let randombijak = splitbijak[Math.floor(Math.random() * splitbijak.length)]
                kelliot.reply(from, randombijak, id)
            })
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'pantun':
            fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/pantun.txt')
            .then(res => res.text())
            .then(body => {
                let splitpantun = body.split('\n')
                let randompantun = splitpantun[Math.floor(Math.random() * splitpantun.length)]
                kelliot.reply(from, randompantun.replace(/aruga-line/g,"\n"), id)
            })
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'quote':
            const quotex = await api.quote()
            await kelliot.reply(from, quotex, id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
    		case 'cerpen':
      			api.cerpen()
      			.then(async (res) => {
		    		await kelliot.reply(from, res.result, id)
      			})
		      	break
	     	case 'cersex':
			      api.cersex()
			      .then(async (res) => {
			    	await kelliot.reply(from, res.result, id)
		      	})
		      	break
	    	case 'puisi':
		      	api.puisi()
		      	.then(async (res) => {
			    	await kelliot.reply(from, res.result, id)
		      	})
		      	break

        //Random Images
        case 'anime':
            if (args.length == 0) return kelliot.reply(from, `Untuk menggunakan ${prefix}anime\nSilahkan ketik: ${prefix}anime [query]\nContoh: ${prefix}anime random\n\nquery yang tersedia:\nrandom, waifu, husbu, neko`, id)
            if (args[0] == 'random' || args[0] == 'waifu' || args[0] == 'husbu' || args[0] == 'neko') {
                fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/anime/' + args[0] + '.txt')
                .then(res => res.text())
                .then(body => {
                    let randomnime = body.split('\n')
                    let randomnimex = randomnime[Math.floor(Math.random() * randomnime.length)]
                    kelliot.sendFileFromUrl(from, randomnimex, '', 'Nee..', id)
                })
                .catch(() => {
                    kelliot.reply(from, 'Ada yang Error!', id)
                })
            } else {
                kelliot.reply(from, `Maaf query tidak tersedia. Silahkan ketik ${prefix}anime untuk melihat list query`)
            }
            break
        case 'kpop':
            if (args.length == 0) return kelliot.reply(from, `Untuk menggunakan ${prefix}kpop\nSilahkan ketik: ${prefix}kpop [query]\nContoh: ${prefix}kpop bts\n\nquery yang tersedia:\nblackpink, exo, bts`, id)
            if (args[0] == 'blackpink' || args[0] == 'exo' || args[0] == 'bts') {
                fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/kpop/' + args[0] + '.txt')
                .then(res => res.text())
                .then(body => {
                    let randomkpop = body.split('\n')
                    let randomkpopx = randomkpop[Math.floor(Math.random() * randomkpop.length)]
                    kelliot.sendFileFromUrl(from, randomkpopx, '', 'Nee..', id)
                })
                .catch(() => {
                    kelliot.reply(from, 'Ada yang Error!', id)
                })
            } else {
                kelliot.reply(from, `Maaf query tidak tersedia. Silahkan ketik ${prefix}kpop untuk melihat list query`)
            }
            break
        case 'memes':
            const randmeme = await meme.random()
            kelliot.sendFileFromUrl(from, randmeme, '', '', id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        
        // Search Any
	case 'dewabatch':
		if (args.length == 0) return kelliot.reply(from, `Untuk mencari anime batch dari Dewa Batch, ketik ${prefix}dewabatch judul\n\nContoh: ${prefix}dewabatch naruto`, id)
		api.dewabatch(args[0])
		.then(async(res) => {
		await kelliot.sendFileFromUrl(from, `${res.link}`, '', `${res.text}`, id)
		})
		break
        case 'images':
            if (args.length == 0) return kelliot.reply(from, `Untuk mencari gambar dari pinterest\nketik: ${prefix}images [search]\ncontoh: ${prefix}images naruto`, id)
            const cariwall = body.slice(8)
            const hasilwall = await images.fdci(cariwall)
            await kelliot.sendFileFromUrl(from, hasilwall, '', '', id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'sreddit':
            if (args.length == 0) return kelliot.reply(from, `Untuk mencari gambar dari sub reddit\nketik: ${prefix}sreddit [search]\ncontoh: ${prefix}sreddit naruto`, id)
            const carireddit = body.slice(9)
            const hasilreddit = await images.sreddit(carireddit)
            await kelliot.sendFileFromUrl(from, hasilreddit, '', '', id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
	    break
        case 'resep':
            if (args.length == 0) return kelliot.reply(from, `Untuk mencari resep makanan\nCaranya ketik: ${prefix}resep [search]\n\ncontoh: ${prefix}resep tahu`, id)
            const cariresep = body.slice(7)
            const hasilresep = await resep.resep(cariresep)
            await kelliot.reply(from, hasilresep + '\n\nIni kak resep makanannya..', id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'nhentai':
	 if(args.length !== 1) return kelliot.reply(from, `Untuk mencari doujin\nCaranya ketik: ${prefix}nhentai [doujin ID]\n\ncontoh: ${prefix}nhentai 334430`, id)
	 api.nhentai(body.slice(9))
	 .then(async (res) => {
	if (res.status == 'error') return kelliot.reply(from, res.hasil, id)
		await //kelliot.sendFileFromUrl(from, res.cov, 'movie.jpg', res.hasil, id)
		kelliot.reply(res.hasil);
	})
        case 'nekopoi':
             rugapoi.getLatest()
            .then((result) => {
                rugapoi.getVideo(result.link)
                .then((res) => {
                    let heheq = '\n'
                    for (let i = 0; i < res.links.length; i++) {
                        heheq += `${res.links[i]}\n`
                    }
                    kelliot.reply(from, `Title: ${res.title}\n\nLink:\n${heheq}\nmasih tester bntr :v`)
                })
            })
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'stalkig':
            if (args.length == 0) return kelliot.reply(from, `Untuk men-stalk akun instagram seseorang\nketik ${prefix}stalkig [username]\ncontoh: ${prefix}stalkig ini.arga`, id)
            const igstalk = await api.stalkig(args[0])
			const igstalkpict = await api.stalkigpict(args[0])
            await kelliot.sendFileFromUrl(from, igstalkpict, '', igstalk, id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
		case 'instagram':
		case 'ig':
			if(args.length == 0) return kelliot.reply(from, `Untuk mendownload vidio / foto dari Instagram\nketik: ${prefix}ig [url]`, id)
			const igurl = body.slice(4)
			const igdl = await ig(igurl)
			await kelliot.sendFileFromUrl(from, igdl.file, '', '', id)
			.catch((err) => {
				kelliot.reply(from, 'Error : ' + err, id);
			})
			break;
		case 'tiktok':
			if(args.length == 0) return kelliot.reply(from, `Untuk mendownload vidio / foto dari Tiktok\nketik: ${prefix}tiktok [url]`, id)
			const tturl = body.slice(8);
			const ttdl = await tt(tturl);
			console.log(ttdl);
			//await kelliot.sendFileFromUrl(from, ttdl.video, 'video.mp4', 'Judul:'+ttdl.jud+'\nOwner:'+ttdl.own, id)
			//.catch((err) => {
			//	kelliot.reply(from, 'Error: '+ err, id);
			//})
			break;
        case 'wiki':
            if (args.length == 0) return kelliot.reply(from, `Untuk mencari suatu kata dari wikipedia\nketik: ${prefix}wiki [kata]`, id)
            const wikip = body.slice(6)
            const wikis = await api.wiki(wikip)
            await kelliot.reply(from, wikis, id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'cuaca':
            if (args.length == 0) return kelliot.reply(from, `Untuk melihat cuaca pada suatu daerah\nketik: ${prefix}cuaca [daerah]`, id)
            const cuacaq = body.slice(7)
            const cuacap = await api.cuaca(cuacaq)
            await kelliot.reply(from, cuacap, id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'lyrics':
        case 'lirik':
            if (args.length == 0) return kelliot.reply(from, `Untuk mencari lirik dari sebuah lagu\bketik: ${prefix}lirik [judul_lagu]`, id)
            api.lirik(body.slice(7))
            .then(async (res) => {
                await kelliot.reply(from, `Lirik Lagu: ${body.slice(7)}\n\n${res}`, id)
            })
            break
        case 'chord':
            if (args.length == 0) return kelliot.reply(from, `Untuk mencari lirik dan chord dari sebuah lagu\bketik: ${prefix}chord [judul_lagu]`, id)
            const chordq = body.slice(7)
            const chordp = await api.chord(chordq)
            await kelliot.reply(from, chordp, id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'ss': //jika error silahkan buka file di folder settings/api.json dan ubah apiSS 'API-KEY' yang kalian dapat dari website https://apiflash.com/
            if (args.length == 0) return kelliot.reply(from, `Membuat bot men-screenshot sebuah web\n\nPemakaian: ${prefix}ss [url]\n\ncontoh: ${prefix}ss http://google.com`, id)
            const scrinshit = await meme.ss(args[0])
            await kelliot.sendImage(from, scrinshit, 'ss.jpg', 'cekrek', id)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'play'://silahkan kalian custom sendiri jika ada yang ingin diubah
            if (args.length == 0) return kelliot.reply(from, `Untuk mencari lagu dari youtube\n\nPenggunaan: ${prefix}play judul lagu`, id)
            axios.get(`https://arugaytdl.herokuapp.com/search?q=${body.slice(6)}`)
            .then(async (res) => {
                await kelliot.sendFileFromUrl(from, `${res.data[0].thumbnail}`, ``, `Lagu ditemukan\n\nJudul: ${res.data[0].title}\nDurasi: ${res.data[0].duration}detik\nUploaded: ${res.data[0].uploadDate}\nView: ${res.data[0].viewCount}\n\nsedang dikirim`, id)
				api.ytmp3(`https://youtu.be/${res.data[0].id}`)
				.then(async(res) => {
					if (res.status == 'error') return kelliot.sendFileFromUrl(from, `${res.link}`, '', `${res.error}`)
					await kelliot.sendFileFromUrl(from, `${res.thumb}`, '', `Lagu ditemukan\n\nJudul ${res.title}\n\nSabar lagi dikirim`, id)
					await kelliot.sendFileFromUrl(from, `${res.link}`, '', '', id)
					.catch(() => {
						kelliot.reply(from, `URL Ini ${args[0]} Sudah pernah di Download sebelumnya. URL akan di Reset setelah 1 Jam/60 Menit`, id)
					})
				})
            })
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
		case 'movie':
			if (args.length == 0) return kelliot.reply(from, `Untuk mencari suatu movie dari website sdmovie.fun\nketik: ${prefix}movie judulnya`, id)
			api.movie((body.slice(7)))
			.then(async (res) => {
				if (res.status == 'error') return kelliot.reply(from, res.hasil, id)
				await kelliot.sendFileFromUrl(from, res.link, 'movie.jpg', res.hasil, id)
			})
			break
        case 'whatanime':
            if (isMedia && type === 'image' || quotedMsg && quotedMsg.type === 'image') {
                if (isMedia) {
                    var mediaData = await decryptMedia(message, uaOverride)
                } else {
                    var mediaData = await decryptMedia(quotedMsg, uaOverride)
                }
                const fetch = require('node-fetch')
                const imgBS4 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                kelliot.reply(from, 'Searching....', id)
                fetch('https://trace.moe/api/search', {
                    method: 'POST',
                    body: JSON.stringify({ image: imgBS4 }),
                    headers: { "Content-Type": "application/json" }
                })
                .then(respon => respon.json())
                .then(resolt => {
                	if (resolt.docs && resolt.docs.length <= 0) {
                		kelliot.reply(from, 'Maaf, saya tidak tau ini anime apa, pastikan gambar yang akan di Search tidak Buram/Kepotong', id)
                	}
                    const { is_adult, title, title_chinese, title_romaji, title_english, episode, similarity, filename, at, tokenthumb, anilist_id } = resolt.docs[0]
                    teks = ''
                    if (similarity < 0.92) {
                    	teks = '*Saya memiliki keyakinan rendah dalam hal ini* :\n\n'
                    }
                    teks += `? *Title Japanese* : ${title}\n? *Title chinese* : ${title_chinese}\n? *Title Romaji* : ${title_romaji}\n? *Title English* : ${title_english}\n`
                    teks += `? *R-18?* : ${is_adult}\n`
                    teks += `? *Eps* : ${episode.toString()}\n`
                    teks += `? *Kesamaan* : ${(similarity * 100).toFixed(1)}%\n`
                    var video = `https://media.trace.moe/video/${anilist_id}/${encodeURIComponent(filename)}?t=${at}&token=${tokenthumb}`;
                    kelliot.sendFileFromUrl(from, video, 'anime.mp4', teks, id).catch(() => {
                        kelliot.reply(from, teks, id)
                    })
                })
                .catch(() => {
                    kelliot.reply(from, 'Ada yang Error!', id)
                })
            } else {
				kelliot.reply(from, `Maaf format salah\n\nSilahkan kirim foto dengan caption ${prefix}whatanime\n\nAtau reply foto dengan caption ${prefix}whatanime`, id)
			}
            break
            
        // Other Command
        case 'resi':
            if (args.length !== 2) return kelliot.reply(from, `Maaf, format pesan salah.\nSilahkan ketik pesan dengan ${prefix}resi <kurir> <no_resi>\n\nKurir yang tersedia:\njne, pos, tiki, wahana, jnt, rpx, sap, sicepat, pcp, jet, dse, first, ninja, lion, idl, rex`, id)
            const kurirs = ['jne', 'pos', 'tiki', 'wahana', 'jnt', 'rpx', 'sap', 'sicepat', 'pcp', 'jet', 'dse', 'first', 'ninja', 'lion', 'idl', 'rex']
            if (!kurirs.includes(args[0])) return kelliot.sendText(from, `Maaf, jenis ekspedisi pengiriman tidak didukung layanan ini hanya mendukung ekspedisi pengiriman ${kurirs.join(', ')} Tolong periksa kembali.`)
            console.log('Memeriksa No Resi', args[1], 'dengan ekspedisi', args[0])
            cekResi(args[0], args[1]).then((result) => kelliot.sendText(from, result))
            break
        case 'tts':
            if (args.length == 0) return kelliot.reply(from, `Mengubah teks menjadi sound (google voice)\nketik: ${prefix}tts <kode_bahasa> <teks>\ncontoh : ${prefix}tts id halo\nuntuk kode bahasa cek disini : https://anotepad.com/note/read/5xqahdy8`)
            const ttsGB = require('node-gtts')(args[0])
            const dataText = body.slice(8)
                if (dataText === '') return kelliot.reply(from, 'apa teksnya syg..', id)
                try {
                    ttsGB.save('./media/tts.mp3', dataText, function () {
                    kelliot.sendPtt(from, './media/tts.mp3', id)
                    })
                } catch (err) {
                    kelliot.reply(from, err, id)
                }
            break
        case 'translate':
            if (args.length != 1) return kelliot.reply(from, `Maaf, format pesan salah.\nSilahkan reply sebuah pesan dengan caption ${prefix}translate <kode_bahasa>\ncontoh ${prefix}translate id`, id)
            if (!quotedMsg) return kelliot.reply(from, `Maaf, format pesan salah.\nSilahkan reply sebuah pesan dengan caption ${prefix}translate <kode_bahasa>\ncontoh ${prefix}translate id`, id)
            const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
            translate(quoteText, args[0])
                .then((result) => kelliot.sendText(from, result))
                .catch(() => kelliot.sendText(from, 'Error, Kode bahasa salah.'))
            break
		case 'covidindo':
			api.covidindo()
			.then(async (res) => {
				await kelliot.reply(from, `${res}`, id)
			})
			break
        case 'ceklokasi':
            if (quotedMsg.type !== 'location') return kelliot.reply(from, `Maaf, format pesan salah.\nKirimkan lokasi dan reply dengan caption ${prefix}ceklokasi`, id)
            console.log(`Request Status Zona Penyebaran Covid-19 (${quotedMsg.lat}, ${quotedMsg.lng}).`)
            const zoneStatus = await getLocationData(quotedMsg.lat, quotedMsg.lng)
            if (zoneStatus.kode !== 200) kelliot.sendText(from, 'Maaf, Terjadi error ketika memeriksa lokasi yang anda kirim.')
            let datax = ''
            for (let i = 0; i < zoneStatus.data.length; i++) {
                const { zone, region } = zoneStatus.data[i]
                const _zone = zone == 'green' ? 'Hijau* (Aman) \n' : zone == 'yellow' ? 'Kuning* (Waspada) \n' : 'Merah* (Bahaya) \n'
                datax += `${i + 1}. Kel. *${region}* Berstatus *Zona ${_zone}`
            }
            const text = `*CEK LOKASI PENYEBARAN COVID-19*\nHasil pemeriksaan dari lokasi yang anda kirim adalah *${zoneStatus.status}* ${zoneStatus.optional}\n\nInformasi lokasi terdampak disekitar anda:\n${datax}`
            kelliot.sendText(from, text)
            break
        case 'shortlink':
            if (args.length == 0) return kelliot.reply(from, `ketik ${prefix}shortlink <url>`, id)
            if (!isUrl(args[0])) return kelliot.reply(from, 'Maaf, url yang kamu kirim tidak valid.', id)
            const shortlink = await urlShortener(args[0])
            await kelliot.sendText(from, shortlink)
            .catch(() => {
                kelliot.reply(from, 'Ada yang Error!', id)
            })
            break
		case 'bapakfont':
			if (args.length == 0) return kelliot.reply(from, `Mengubah kalimat menjadi alayyyyy\n\nketik ${prefix}bapakfont kalimat`, id)
			api.bapakfont(body.slice(11))
			.then(async(res) => {
				await kelliot.reply(from, `${res}`, id)
			})
			break
        // Group Commands (group admin only)
	    case 'add':
            if (!isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return kelliot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return kelliot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
	        if (args.length !== 1) return kelliot.reply(from, `Untuk menggunakan ${prefix}add\nPenggunaan: ${prefix}add <nomor>\ncontoh: ${prefix}add 628xxx`, id)
                try {
                    await kelliot.addParticipant(from,`${args[0]}@c.us`)
                } catch {
                    kelliot.reply(from, 'Tidak dapat menambahkan target', id)
                }
            break
        case 'kick':
            if (!isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return kelliot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return kelliot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length === 0) return kelliot.reply(from, 'Maaf, format pesan salah.\nSilahkan tag satu atau lebih orang yang akan dikeluarkan', id)
            if (mentionedJidList[0] === botNumber) return await kelliot.reply(from, 'Maaf, format pesan salah.\nTidak dapat mengeluarkan akun bot sendiri', id)
            await kelliot.sendTextWithMentions(from, `Request diterima, mengeluarkan:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await kelliot.sendText(from, 'Gagal, kamu tidak bisa mengeluarkan admin grup.')
                await kelliot.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case 'promote':
            if (!isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return kelliot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return kelliot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length !== 1) return kelliot.reply(from, 'Maaf, hanya bisa mempromote 1 user', id)
            if (groupAdmins.includes(mentionedJidList[0])) return await kelliot.reply(from, 'Maaf, user tersebut sudah menjadi admin.', id)
            if (mentionedJidList[0] === botNumber) return await kelliot.reply(from, 'Maaf, format pesan salah.\nTidak dapat mempromote akun bot sendiri', id)
            await kelliot.promoteParticipant(groupId, mentionedJidList[0])
            await kelliot.sendTextWithMentions(from, `Request diterima, menambahkan @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
            break
        case 'demote':
            if (!isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return kelliot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return kelliot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length !== 1) return kelliot.reply(from, 'Maaf, hanya bisa mendemote 1 user', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await kelliot.reply(from, 'Maaf, user tersebut belum menjadi admin.', id)
            if (mentionedJidList[0] === botNumber) return await kelliot.reply(from, 'Maaf, format pesan salah.\nTidak dapat mendemote akun bot sendiri', id)
            await kelliot.demoteParticipant(groupId, mentionedJidList[0])
            await kelliot.sendTextWithMentions(from, `Request diterima, menghapus jabatan @${mentionedJidList[0].replace('@c.us', '')}.`)
            break
        case 'bye':
            if (!isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return kelliot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            kelliot.sendText(from, 'Good bye... ( ???? )').then(() => kelliot.leaveGroup(groupId))
            break
        case 'del':
            if (!isGroupAdmins) return kelliot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!quotedMsg) return kelliot.reply(from, `Maaf, format pesan salah silahkan.\nReply pesan bot dengan caption ${prefix}del`, id)
            if (!quotedMsgObj.fromMe) return kelliot.reply(from, `Maaf, format pesan salah silahkan.\nReply pesan bot dengan caption ${prefix}del`, id)
            kelliot.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case 'tagall':
        case 'everyone':
            if (!isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return kelliot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            const groupMem = await kelliot.getGroupMembers(groupId)
            let hehex = '+--?? Mention All ??--\n'
            for (let i = 0; i < groupMem.length; i++) {
                hehex += '�?'
                hehex += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
            }
            hehex += '+-? *A R U G A  B O T* ?'
            await kelliot.sendTextWithMentions(from, hehex)
            break
		case 'mutegrup':
			if (!isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return kelliot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return kelliot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
			if (args.length !== 1) return kelliot.reply(from, `Untuk mengubah settingan group chat agar hanya admin saja yang bisa chat\n\nPenggunaan:\n${prefix}mutegrup on --aktifkan\n${prefix}mutegrup off --nonaktifkan`, id)
            if (args[0] == 'on') {
				kelliot.setGroupToAdminsOnly(groupId, true).then(() => kelliot.sendText(from, 'Berhasil mengubah agar hanya admin yang dapat chat!'))
			} else if (args[0] == 'off') {
				kelliot.setGroupToAdminsOnly(groupId, false).then(() => kelliot.sendText(from, 'Berhasil mengubah agar semua anggota dapat chat!'))
			} else {
				kelliot.reply(from, `Untuk mengubah settingan group chat agar hanya admin saja yang bisa chat\n\nPenggunaan:\n${prefix}mutegrup on --aktifkan\n${prefix}mutegrup off --nonaktifkan`, id)
			}
			break
		case 'setprofile':
			if (!isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return kelliot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return kelliot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
			if (isMedia && type == 'image' || isQuotedImage) {
				const dataMedia = isQuotedImage ? quotedMsg : message
				const _mimetype = dataMedia.mimetype
				const mediaData = await decryptMedia(dataMedia, uaOverride)
				const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
				await kelliot.setGroupIcon(groupId, imageBase64)
			} else if (args.length === 1) {
				if (!isUrl(url)) { await kelliot.reply(from, 'Maaf, link yang kamu kirim tidak valid.', id) }
				kelliot.setGroupIconByUrl(groupId, url).then((r) => (!r && r !== undefined)
				? kelliot.reply(from, 'Maaf, link yang kamu kirim tidak memuat gambar.', id)
				: kelliot.reply(from, 'Berhasil mengubah profile group', id))
			} else {
				kelliot.reply(from, `Commands ini digunakan untuk mengganti icon/profile group chat\n\n\nPenggunaan:\n1. Silahkan kirim/reply sebuah gambar dengan caption ${prefix}setprofile\n\n2. Silahkan ketik ${prefix}setprofile linkImage`)
			}
			break
					
        //Owner Group
        case 'kickall': //mengeluarkan semua member
        if (!isGroupMsg) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
        let isOwner = chat.groupMetadata.owner == pengirim
        if (!isOwner) return kelliot.reply(from, 'Maaf, perintah ini hanya dapat dipakai oleh owner grup!', id)
        if (!isBotGroupAdmins) return kelliot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            const allMem = await kelliot.getGroupMembers(groupId)
            for (let i = 0; i < allMem.length; i++) {
                if (groupAdmins.includes(allMem[i].id)) {

                } else {
                    await kelliot.removeParticipant(groupId, allMem[i].id)
                }
            }
            kelliot.reply(from, 'Success kick all member', id)
        break

        //Owner Bot
        case 'bc': //untuk broadcast atau promosi
            if (!isOwnerBot) return kelliot.reply(from, 'Perintah ini hanya untuk Owner bot!', id)
            if (args.length == 0) return kelliot.reply(from, `Untuk broadcast ke semua chat ketik:\n${prefix}bc [isi chat]`)
            let msg = body.slice(4)
            const chatz = await kelliot.getAllChatIds()
            for (let idk of chatz) {
                var cvk = await kelliot.getChatById(idk)
                if (!cvk.isReadOnly) kelliot.sendText(idk, `? * KELLIOT INFO * ?\n\n${msg}`)
                if (cvk.isReadOnly) kelliot.sendText(idk, `? * KELLIOT INFO* ?\n\n${msg}`)
            }
            kelliot.reply(from, 'Broadcast Success!', id)
            break
        case 'leaveall': //mengeluarkan bot dari semua group serta menghapus chatnya
            if (!isOwnerBot) return kelliot.reply(from, 'Perintah ini hanya untuk Owner bot', id)
            const allChatz = await kelliot.getAllChatIds()
            const allGroupz = await kelliot.getAllGroups()
            for (let gclist of allGroupz) {
                await kelliot.sendText(gclist.contact.id, `Maaf bot sedang pembersihan, total chat aktif : ${allChatz.length}`)
                await kelliot.leaveGroup(gclist.contact.id)
                await kelliot.deleteChat(gclist.contact.id)
            }
            kelliot.reply(from, 'Success leave all group!', id)
            break
        case 'clearall': //menghapus seluruh pesan diakun bot
            if (!isOwnerBot) return kelliot.reply(from, 'Perintah ini hanya untuk Owner bot', id)
            const allChatx = await kelliot.getAllChats()
            for (let dchat of allChatx) {
                await kelliot.deleteChat(dchat.id)
            }
            kelliot.reply(from, 'Success clear all chat!', id)
            break
        default:
            break
        }
    } catch (err) {
        console.log(color('[EROR]', 'red'), err)
    }
}
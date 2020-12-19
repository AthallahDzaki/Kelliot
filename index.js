const { create, Client } = require('@open-wa/wa-automate')
const figlet = require('figlet')
const options = require('./utils/options')
const { color, messageLog } = require('./utils')
const HandleMsg = require('./HandleMsg')

const start = (client = new Client()) => {
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('Kelliot', { font: 'Ghost', horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color('[DEV]'), color('Athallah Dzaki', 'yellow'))
    console.log(color('[~>>]'), color('BOT Started!', 'green'))

    // Mempertahankan sesi agar tetap nyala
    client.onStateChanged((state) => {
        console.log(color('[~>>]', 'red'), state)
        if (state === 'CONFLICT' || state === 'UNLAUNCHED') client.forceRefocus()
    })

    // ketika bot diinvite ke dalam group
    client.onAddedToGroup(async (chat) => {
         await client.simulateTyping(chat.id, true).then(async () => {
          await client.sendText(chat.id, `Hello Brother And Sister, Im Kelliot. To find out the commands on this bot type ${prefix}menu`)
	})
    })

    // ketika seseorang masuk/keluar dari group
    client.onGlobalParicipantsChanged(async (event) => {
	//Skip Aja :v
    })

    client.onIncomingCall(async (callData) => {
        // ketika seseorang menelpon nomor bot akan mengirim pesan
        await client.sendText(callData.peerJid, 'Maaf sedang tidak bisa menerima panggilan.\n\n-bot')
        .then(async () => {
            // bot akan memblock nomor itu
            await client.contactBlock(callData.peerJid)
        })
    })

    // ketika seseorang mengirim pesan
    client.onMessage(async (message) => {
        client.getAmountOfLoadedMessages() // menghapus pesan cache jika sudah 3000 pesan.
            .then((msg) => {
                if (msg >= 3000) {
                    console.log('[client]', color(`Loaded Message Reach ${msg}, cuting message cache...`, 'yellow'))
                    client.cutMsgCache()
                }
            })
        HandleMsg(client, message)    
    
    })
	
    // Message log for analytic
    client.onAnyMessage((anal) => { 
        messageLog(anal.fromMe, anal.type)
    })
}

//create session
create(options(true, start))
    .then((client) => start(client))
    .catch((err) => new Error(err))

const { Telegraf } = require('telegraf')
const variable = require('./variable.js')
const { prop } = require('./components/properties/property.js')
const helper = require('./components/helper/helper.js')
const { markup, btn } = require('./components/inlineKeyboard/inlineKeyboard.js')
const { games } = require('./components/games/games.js')

const bot = new Telegraf(variable.token)

/** MESSAGE INITIALIZATION */
bot.on(`message`, async ctx => {
    try {
        var chatID = ctx.chat.id;
        var keyb = []

        var pola = /^\/start$/i
        if (pola.exec(ctx.message.text)) {
            var pesan = `👋 Hi ${await helper.getName(ctx)}, I am Truth Or Dare game bot.`
            pesan += `\n\n👉 <b>How to use me?</b> just add me to your group and use /truth or /dare command with reply to someone message or not.`
            pesan += `\n\n👌 And enjoy the game...`
            keyb[0] = [
                btn.url(`Add to your group ↗️`, `https://t.me/${variable.botUname}?startgroup=true`)
            ]
            keyb[1] = [
                btn.text(`ℹ️ About`, `about_`)
            ]

            return await ctx.replyWithHTML(pesan, { reply_markup: markup.inlineKeyboard(keyb) })
        }

        /** GAME COMMANDS */
        var timesID = `time_${chatID}_${ctx.from.id}`
        var timer = {}

        var pola = /^\/truth|truth@TODENGameBot$/i
        if (pola.exec(ctx.message.text)) {
            var messageID = ctx.message.message_id
            if (prop.get(`session_truth_` + ctx.from.id + chatID)) return await ctx.replyWithHTML(`🤷‍♀️ You still have challenges that need to be answered.`, { reply_to_message_id: messageID })

            if (ctx.message.reply_to_message) {
                var replyID = ctx.message.reply_to_message.from.id;

                if (prop.get(`session_truth_` + replyID + chatID)) { return await ctx.replyWithHTML(`✋ ${await helper.getName(ctx.message.reply_to_message)} has another challenge.`, { reply_to_message_id: messageID }) }
                prop.set(`has_chall_` + replyID + chatID, messageID)
                prop.set(`challenger_` + replyID + chatID, ctx.from.id)
                var name = await helper.getName(ctx)
                var msgID = ctx.message.reply_to_message.message_id

                var pesan = `⭕️ ${name} wants you to tell the truth.`
                pesan += `\n\n⏳ Your time to answer: 10s`
                keyb[0] = [
                    btn.text(`🙋‍♂️ Accept`, `gameCallback_truth_accept_${replyID}`),
                    btn.text(`🙅‍♀️ Reject`, `gameCallback_truth_reject_${replyID}`)
                ]

                var atg = await ctx.replyWithHTML(pesan, { reply_markup: markup.inlineKeyboard(keyb), reply_to_message_id: msgID })
                var time = 10
                var inter = timer[timesID] = setInterval(async () => {
                    time--;

                    if (time <= 0) {
                        clearInterval(inter)
                        prop.read(`session_truth_` + replyID + chatID)
                        prop.read(`interval_` + replyID + chatID)
                        prop.read(`has_chall_` + replyID + chatID)
                        prop.read(`challenger_` + replyID + chatID)
                        try { await ctx.deleteMessage(atg.message_id) } catch { }
                        var getName = await helper.getName(ctx.message.reply_to_message)

                        try {
                            var pesan = `🙅‍♀️ ${getName} refusing to accept the challenge.`
                            await ctx.replyWithHTML(pesan, { parse_mode: 'HTML', reply_to_message_id: messageID })
                        } catch {
                            var pesan = `🙅‍♀️ ${getName} refusing to accept the challenge.`
                            await ctx.replyWithHTML(pesan, { parse_mode: 'HTML' })
                        }
                    }
                }, 1000)
                prop.set(`interval_` + replyID + chatID, inter)
                return;
            } else {
                var ios = await ctx.replyWithHTML(`⏳ Processing...`, { reply_to_message_id: ctx.message.message_id })
                var truthMsg = await games.getTruth()
                var userID = ctx.from.id

                var pesan = `├──「⭕️ <b>The Truth:</b>`
                pesan += `\n│`
                pesan += `\n└• ${truthMsg}`
                pesan += `\n\n⏳ Your time: 30s`
                pesan += `\nReply to this message to answer.`
                keyb[0] = [
                    btn.text(`⏭ Skip`, `gameCallback_truth_skip_${userID}`),
                    btn.text(`💩 Surrend`, `gameCallback_truth_surrend_${userID}`)
                ]

                var tga = await bot.telegram.editMessageText(chatID, ios.message_id, null, pesan, { reply_markup: markup.inlineKeyboard(keyb), parse_mode: 'HTML' })
                prop.set(`session_truth_` + userID + chatID, tga.message_id)
                prop.set(`game_id_` + tga.message_id + userID + chatID, 'true')
                var time = 30
                var inter = timer[timesID] = setInterval(async () => {
                    time--;

                    if (time <= 0) {
                        clearInterval(inter)
                        prop.read(`interval_` + userID + chatID)
                        prop.read(`session_truth_` + userID + chatID)
                        prop.read(`game_id_` + tga.message_id + userID + chatID)
                        try { await ctx.deleteMessage(tga.message_id) } catch { }
                        var name = await helper.getName(ctx)

                        var pesan = `🤦‍♂️ ${name} failed to answer the challenge.`
                        await ctx.replyWithHTML(pesan)
                    }
                }, 1000);
                prop.set(`interval_` + userID + chatID, inter)
            }
            return;
        }

        var pola = /^\/dare|dare@TODENGameBot$/i
        if (pola.exec(ctx.message.text)) {
            var messageID = ctx.message.message_id

            if (ctx.message.reply_to_message) {
                var replyID = ctx.message.reply_to_message.from.id;

                if (prop.get(`session_dare_` + replyID + chatID)) { return await ctx.replyWithHTML(`✋ ${await helper.getName(ctx.message.reply_to_message)} has another challenge.`, { reply_to_message_id: messageID }) }
                var name = await helper.getName(ctx)
                var msgID = ctx.message.reply_to_message.message_id

                var pesan = `❌ ${name} wants you to accept the dare.`
                pesan += `\n\n⏳ Your time to answer: 10s`
                keyb[0] = [
                    btn.text(`🙋‍♂️ Accept`, `gameCallback_dare_accept_${replyID}`),
                    btn.text(`🙅‍♀️ Reject`, `gameCallback_dare_reject_${replyID}`)
                ]

                var atg = await ctx.replyWithHTML(pesan, { reply_markup: markup.inlineKeyboard(keyb), reply_to_message_id: msgID })
                var time = 10
                var inter = timer[timesID] = setInterval(async () => {
                    time--;

                    if (time <= 0) {
                        clearInterval(inter)
                        prop.read(`has_chall_` + replyID + chatID)
                        prop.read(`challenger_` + replyID + chatID)
                        try { await ctx.deleteMessage(atg.message_id) } catch { }
                        var getName = await helper.getName(ctx.message.reply_to_message)

                        try {
                            var pesan = `🙅‍♀️ ${getName} refusing to accept the challenge.`
                            await ctx.replyWithHTML(pesan, { parse_mode: 'HTML', reply_to_message_id: messageID })
                        } catch {
                            var pesan = `🙅‍♀️ ${getName} refusing to accept the challenge.`
                            await ctx.replyWithHTML(pesan, { parse_mode: 'HTML' })
                        }
                    }
                }, 1000)
                prop.set(`interval_` + replyID + chatID, inter)
                return;
            } else {
                var ios = await ctx.replyWithHTML(`⏳ Processing...`, { reply_to_message_id: ctx.message.message_id })
                var dareMsg = await games.getDare()
                var userID = ctx.from.id

                var pesan = `├──「❌ <b>The Dare:</b>`
                pesan += `\n│`
                pesan += `\n└• ${dareMsg}`
                keyb[0] = [
                    btn.text(`⏭ Skip`, `gameCallback_dare_skip_${userID}`),
                    btn.text(`💩 Surrend`, `gameCallback_dare_surrend_${userID}`)
                ]

                var tga = await bot.telegram.editMessageText(chatID, ios.message_id, null, pesan, { reply_markup: markup.inlineKeyboard(keyb), parse_mode: 'HTML' })
                prop.set(`session_dare_` + userID + chatID, tga.message_id)
                return;
            }
        }

        /** END OF GAME COMMANDS */
        // SESSION
        var sessionTruth = prop.get(`session_truth_` + ctx.from.id + chatID)

        if (sessionTruth) {
            clearInterval(prop.get(`interval_` + ctx.from.id + chatID))
            if (!ctx.message.reply_to_message) return true;
            if (!prop.get(`game_id_` + sessionTruth + ctx.from.id + chatID)) return true;
            if (ctx.message.reply_to_message.message_id == String(sessionTruth)) {
                var name = await helper.getName(ctx)
                if (prop.get(`challenger_` + ctx.from.id + chatID)) {
                    var chall = String(prop.get(`challenger_` + ctx.from.id + chatID))
                    var nn = await helper.clearHTML((await bot.telegram.getChat(chall)).first_name);
                    var pesan = `👏 ${name} has answered the ${nn}'s truth challenge.`

                    await ctx.replyWithHTML(pesan)
                } else {
                    var pesan = `✅ Answer accepted.`

                    await ctx.replyWithHTML(pesan, { reply_to_message_id: ctx.message.message_id })
                }

                prop.read(`challenger_` + ctx.from.id + chatID)
                prop.read(`session_truth_` + ctx.from.id + chatID)
                prop.read(`has_chall_` + ctx.from.id + chatID)
                prop.read(`game_id_` + sessionTruth + ctx.from.id + chatID)
            }
            return;
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = { bot }
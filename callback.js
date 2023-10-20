const { bot } = require('./message.js')
const variable = require('./variable.js')
const { prop } = require('./components/properties/property.js')
const helper = require('./components/helper/helper.js')
const { markup, btn } = require('./components/inlineKeyboard/inlineKeyboard.js')
const { games } = require('./components/games/games.js')

/** CALLBACK INITIALIZATION */
bot.on(`callback_query`, async ctx => {
    try {
        var chatID = ctx.chat.id;
        var cbQuery = ctx.callbackQuery;
        var data = await cbQuery.data;
        var keyb = []
        var cck;

        if (/about_$/i.exec(data)) { return await ctx.answerCbQuery(`Menu unavailable.`) }

        if (cck = /gameCallback_(.+)_(.+)_(.+)/i.exec(data)) {
            var game = cck[1]
            var type = cck[2]
            var userID = String(cck[3])
            if (userID !== String(ctx.from.id)) return await ctx.answerCbQuery(`⚠️ This button is not for you.`, { show_alert: true })

            var timesID = `time_${chatID}_${userID}`
            var timer = {}
            var messageID = String(prop.get(`has_chall_` + userID + chatID))
            var inter = prop.get(`interval_` + userID + chatID)

            clearInterval(inter)
            if (type == 'surrend') {
                if (game == 'truth') {
                    if (!prop.get(`session_truth_` + userID + chatID)) return await ctx.answerCbQuery(`⚠️ You're not in the game.`, { show_alert: true })
                    var messageID = String(prop.get(`session_truth_` + userID + chatID))
                } else {
                    if (!prop.get(`session_dare_` + userID + chatID)) return await ctx.answerCbQuery(`⚠️ You're not in the game.`, { show_alert: true })
                    var messageID = String(prop.get(`session_dare_` + userID + chatID))
                }
                try { await ctx.deleteMessage(ctx.message?.message_id) } catch { }

                var names = await helper.getName(ctx)
                var pesan = `💩 ${names} giving up on answering the challenge given to him/her.`

                await ctx.replyWithHTML(pesan, { parse_mode: 'HTML' })
                prop.read(`challenger_` + userID + chatID)
                prop.read(`session_truth_` + userID + chatID)
                prop.read(`session_dare_` + userID + chatID)
                prop.read(`has_chall_` + userID + chatID)
                prop.read(`game_id_` + messageID + userID + chatID)
                return;
            }

            if (type == 'reject') {
                if (game == 'truth') {
                    if (!prop.get(`session_truth_` + userID + chatID)) return await ctx.answerCbQuery(`⚠️ You're not in the game.`, { show_alert: true })
                    var messageID = String(prop.get(`session_truth_` + userID + chatID))
                } else if (game == 'dare') {
                    if (!prop.get(`session_dare_` + userID + chatID)) return await ctx.answerCbQuery(`⚠️ You're not in the game.`, { show_alert: true })
                    var messageID = String(prop.get(`session_dare_` + userID + chatID))
                }

                prop.read(`has_chall_` + userID + chatID)
                prop.read(`challenger_` + userID + chatID)
                try { await ctx.deleteMessage(ctx.message?.message_id) } catch { }
                var getName = await helper.getName(ctx)

                try {
                    var pesan = `🙅‍♀️ ${getName} refusing to accept the challenge.`
                    await ctx.replyWithHTML(pesan, { parse_mode: 'HTML', reply_to_message_id: messageID })
                } catch {
                    var pesan = `🙅‍♀️ ${getName} refusing to accept the challenge.`
                    await ctx.replyWithHTML(pesan, { parse_mode: 'HTML' })
                }
            }

            if (type == 'skip') {
                if (game == 'truth') {
                    if (!prop.get(`session_truth_` + userID + chatID)) return await ctx.answerCbQuery(`⚠️ You're not in the game.`, { show_alert: true })
                    await ctx.editMessageText(`⏳ Processing...`)
                    var truthMsg = await games.getTruth()

                    var pesan = `├──「⭕️ <b>The Truth:</b>`
                    pesan += `\n│`
                    pesan += `\n└• ${truthMsg}`
                    pesan += `\n\n⏳ Your time: 30s`
                    pesan += `\nReply to this message to answer.`
                    keyb[0] = [
                        btn.text(`⏭ Skip`, `gameCallback_${game}_skip_${userID}`),
                        btn.text(`💩 Surrend`, `gameCallback_${game}_surrend_${userID}`)
                    ]

                    var atg = await ctx.editMessageText(pesan, { reply_markup: markup.inlineKeyboard(keyb), parse_mode: 'HTML' })
                    var time = 30
                    var inter = timer[timesID] = setInterval(async () => {
                        time--;

                        if (time <= 0) {
                            clearInterval(inter)
                            prop.read(`interval_` + userID + chatID)
                            prop.read(`session_truth_` + userID + chatID)
                            prop.read(`has_chall_` + userID + chatID)
                            prop.read(`challenger_` + userID + chatID)
                            prop.read(`game_id_` + atg.message_id + userID + chatID)
                            try { await ctx.deleteMessage(atg.message_id) } catch { }
                            var infos = (await bot.telegram.getChat(userID))
                            var nn = await helper.clearHTML(infos.first_name)
                            var username = infos.username
                            var getName = username ? `@${username}` : `<a href='tg://user?id=${userID}'>${nn}</a>`

                            try {
                                var pesan = `🤦‍♂️ ${getName} failed to answer the challenge.`
                                await ctx.replyWithHTML(pesan, { parse_mode: 'HTML', reply_to_message_id: String(messageID) })
                            } catch {
                                var pesan = `🤦‍♂️ ${getName} failed to answer the challenge.`
                                await ctx.replyWithHTML(pesan, { parse_mode: 'HTML' })
                            }
                        }
                    }, 1000)
                    prop.set(`interval_` + userID + chatID, inter)
                    return;
                }

                if (game == 'dare') {
                    if (!prop.get(`session_dare_` + userID + chatID)) return await ctx.answerCbQuery(`⚠️ You're not in the game.`, { show_alert: true })
                    await ctx.editMessageText(`⏳ Processing...`)
                    var dareMsg = await games.getDare()

                    var pesan = `├──「❌ <b>The Dare:</b>`
                    pesan += `\n│`
                    pesan += `\n└• ${dareMsg}`
                    keyb[0] = [
                        btn.text(`⏭ Skip`, `gameCallback_${game}_skip_${userID}`),
                        btn.text(`💩 Surrend`, `gameCallback_${game}_surrend_${userID}`)
                    ]

                    await ctx.editMessageText(pesan, { reply_markup: markup.inlineKeyboard(keyb), parse_mode: 'HTML' })
                    return;
                }
            }

            if (game == 'truth') {
                if (type == 'accept') {
                    await ctx.editMessageText(`⏳ Processing...`)
                    var truthMsg = await games.getTruth()

                    var pesan = `├──「⭕️ <b>The Truth:</b>`
                    pesan += `\n│`
                    pesan += `\n└• ${truthMsg}`
                    pesan += `\n\n⏳ Your time: 30s`
                    pesan += `\nReply to this message to answer.`
                    keyb[0] = [
                        btn.text(`💩 Surrend`, `gameCallback_${game}_surrend_${userID}`)
                    ]

                    var atg = await ctx.editMessageText(pesan, { parse_mode: 'HTML', reply_markup: markup.inlineKeyboard(keyb) })
                    prop.set(`session_truth_` + userID + chatID, atg.message_id)
                    prop.set(`game_id_` + atg.message_id + userID + chatID, 'true')
                    var time = 30
                    var inter = timer[timesID] = setInterval(async () => {
                        time--;

                        if (time <= 0) {
                            clearInterval(inter)
                            prop.read(`interval_` + userID + chatID)
                            prop.read(`session_truth_` + userID + chatID)
                            prop.read(`has_chall_` + userID + chatID)
                            prop.read(`challenger_` + userID + chatID)
                            prop.read(`game_id_` + atg.message_id + userID + chatID)
                            try { await ctx.deleteMessage(atg.message_id) } catch { }
                            var infos = (await bot.telegram.getChat(userID))
                            var nn = await helper.clearHTML(infos.first_name)
                            var username = infos.username
                            var getName = username ? `@${username}` : `<a href='tg://user?id=${userID}'>${nn}</a>`

                            try {
                                var pesan = `🤦‍♂️ ${getName} failed to answer the challenge.`
                                await ctx.replyWithHTML(pesan, { parse_mode: 'HTML', reply_to_message_id: String(messageID) })
                            } catch {
                                var pesan = `🤦‍♂️ ${getName} failed to answer the challenge.`
                                await ctx.replyWithHTML(pesan, { parse_mode: 'HTML' })
                            }
                        }
                    }, 1000)
                    prop.set(`interval_` + userID + chatID, inter)
                    return;
                }

                return true;
            }

            if (game == 'dare') {
                if (type == 'accept') {
                    await ctx.editMessageText(`⏳ Processing...`)
                    var dareMsg = await games.getDare()

                    var pesan = `├──「❌ <b>The Dare:</b>`
                    pesan += `\n│`
                    pesan += `\n└• ${dareMsg}`
                    keyb[0] = [
                        btn.text(`💩 Surrend`, `gameCallback_${game}_surrend_${userID}`)
                    ]

                    var atg = await ctx.editMessageText(pesan, { parse_mode: 'HTML', reply_markup: markup.inlineKeyboard(keyb) })
                    prop.set(`session_dare_` + userID + chatID, atg.message_id)
                    return;
                }

                return true;
            }
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = { bot }
async function getName(ctx) {
    var nn = await clearHTML(ctx.from.first_name)
    var userID = ctx.from.id;
    var username = ctx.from.username;

    var pesan = username ? `@${username}` : `<a href='tg://user?id=${userID}'>${nn}</a>`
    return pesan;
}

async function clearHTML(s) {
    if (!s) return s
    return s
        .replace(/</g, '')
        .replace(/>/g, '')
}

const helper = {
    getName,
    clearHTML
}

module.exports = helper
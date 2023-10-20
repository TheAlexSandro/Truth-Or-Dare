const axios = require('axios')
const { randomUserAgent } = require('../../userAgent.js')

var truthEndpoint = `https://api.truthordarebot.xyz/v1/truth`
var dareEndpoint = `https://api.truthordarebot.xyz/v1/dare`

async function getTruth() {
    var ops = {
        method: 'GET',
        headers: {
            'User-Agent': randomUserAgent()
        }
    }
    var request = (await axios.get(truthEndpoint, ops)).data.question

    return request
}

async function getDare() {
    var ops = {
        method: 'GET',
        headers: {
            'User-Agent': randomUserAgent()
        }
    }
    var request = (await axios.get(dareEndpoint, ops)).data.question

    return request
}

const games = {
    getTruth,
    getDare
}

module.exports = { games }
// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const { HOST, PORT, _URL_ } = require('./config')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const getCookieOptions = {
    url: _URL_,
    proxy: {
      host: HOST,
      port: PORT
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
    }
  }

  let cookieRet = await axios(getCookieOptions)

  let cookie = cookieRet.headers['set-cookie'][0].split(';')[0]

  const getCharCodeOptions = {
    url: `${_URL_}validateCodeAction.do`,
    params: {
      random: Math.random()
    },
    responseType: 'arraybuffer',
    transformResponse(data) {
      return data.toString('base64');
    },
    headers: {
      Cookie: cookie,
      'Content-Type': 'image/jpeg',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
    },
    proxy: {
      host: HOST,
      port: PORT
    }
  }

  let ret = await axios.request(getCharCodeOptions)

  let loginParams = {
    charCode: ret.data,
    cookie: cookie
  }
  return loginParams
}
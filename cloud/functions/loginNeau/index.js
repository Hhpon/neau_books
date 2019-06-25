// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const iconv = require('iconv-lite')
const querystring = require('querystring');
const cheerio = require('cheerio')
const { HOST, PORT, _URL_ } = require('./config')
const testConnct = require('./testConnect')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const OPENID = cloud.getWXContext().OPENID
  const { cookie, charCode, studentID, studentPassWord, tel } = event
  let testRes = testConnct()

  const loginOptions = {
    url: `${_URL_}loginAction.do`,
    method: 'post',
    data: querystring.stringify({
      zjh1: '',
      tips: '',
      lx: '',
      evalue: '',
      eflag: '',
      fs: '',
      dzslh: '',
      zjh: studentID,
      mm: studentPassWord,
      'v_yzm': charCode
    }),
    responseType: 'arraybuffer',
    headers: {
      Cookie: cookie,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
    },
    proxy: testRes ? {
      host: HOST,
      port: PORT
    } : null,
    transformResponse(body) {
      return iconv.decode(body, 'gbk');
    }
  }

  let ret = await axios.request(loginOptions)

  if (ret.data.indexOf('学分制综合教务') === -1) {
    const $ = cheerio.load(ret.data)
    let loseRetMes = $('strong').text()
    let loseRet = {
      code: 0,
      loseRetMes: loseRetMes
    }
    return loseRet
  }

  const getUserinfoOption = {
    url: `${_URL_}xjInfoAction.do?oper=xjxx`,
    headers: {
      Cookie: cookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
    },
    proxy: testRes ? {
      host: HOST,
      port: PORT
    } : null,
    responseType: 'arraybuffer',
    transformResponse(body) {
      return iconv.decode(body, 'gbk');
    }
  }

  let userInfoHtml = await axios.request(getUserinfoOption)

  const $ = cheerio.load(userInfoHtml.data)
  const userName = $('.fieldName').eq(1).next().text().trim()
  const faculty = $('.fieldName').eq(26).next().text().trim()

  let userInfo = {
    studentID: studentID,
    studentPassWord: studentPassWord,
    tel: tel,
    userName: userName,
    faculty: faculty
  }

  try {
    return await db.collection('userInfo').where({
      _openid: OPENID
    })
      .update({
        data: userInfo
      })
  } catch (e) {
    return e
  }
}
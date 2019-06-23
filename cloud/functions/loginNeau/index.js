// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const iconv = require('iconv-lite')
const querystring = require('querystring');
const cheerio = require('cheerio')
const { HOST, PORT, _URL_ } = require('./config')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { cookie, charCode, studentID, studentPassWord } = event

  console.log(cookie, charCode);

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
    proxy: {
      host: HOST,
      port: PORT
    },
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
    proxy: {
      host: HOST,
      port: PORT
    },
    responseType: 'arraybuffer',
    transformResponse(body) {
      return iconv.decode(body, 'gbk');
    }
  }

  let userInfoHtml = await axios.request(getUserinfoOption)

  const $ = cheerio.load(userInfoHtml.data)
  const faculty = $('.fieldName').eq(26).next().text().trim()
  const userName = $('.fieldName').eq(1).next().text().trim()

  let userInfo = {
    userName: userName,
    studentID: studentID,
    studentPassWord: studentPassWord,
    faculty: faculty
  }

  return {
    userInfo: userInfo,
    code: 1
  }
}
// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

const _URL_ = 'http://202.118.167.86:9004/'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const options = {
    url: _URL_,
    proxy: {
      host: '47.94.210.206',
      port: 6060
    }
  }

  let _COOKIE_ = ''

  await axios(options).then(res => {
    _COOKIE_ = res.headers['set-cookie'][0].split(';')[0]
    console.log(_COOKIE_);
  }).catch(err => {
    console.log(err);
  })

  const options1 = {
    url: `${_URL_}validateCodeAction.do`,
    params: {
      random: Math.random()
    },
    responseType: 'arraybuffer',
    headers: {
      cookie: _COOKIE_
    },
    proxy: {
      host: '47.94.210.206',
      port: 6060
    }
  }

  let ret = await axios(options1)
  console.log(ret.data);
  return ret.data
}
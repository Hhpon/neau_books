// 该云函数是获取用户的openid，传输到本地存储起来
const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async () => {
  const wxContext = cloud.getWXContext()

  return wxContext.OPENID
}
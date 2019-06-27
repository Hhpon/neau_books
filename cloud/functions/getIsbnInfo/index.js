// 云函数入口文件
// 该云函数是通过isbn获取书籍具体信息
const cloud = require('wx-server-sdk')
const getIsbn = require('./getInfoHandle')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { isbn } = event
  let bookInfo = await getIsbn(isbn)

  return bookInfo
}
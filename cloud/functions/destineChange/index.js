// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { id } = event
  try {
    return await db.collection('booksInfo').doc(id).update({
      data: {
        bookStatus: 2
      }
    })
  } catch (error) {
    return error
  }
}
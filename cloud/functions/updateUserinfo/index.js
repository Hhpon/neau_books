// 云函数入口文件
// 该云函数是当同学们学生认证的时候更新学生信息使用的
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const OPENID = cloud.getWXContext().OPENID
  console.log(event,OPENID);

  try {
    return await db.collection('userInfo').where({
      _openid: OPENID
    })
      .update({
        data: event
      })
  } catch (e) {
    console.error(e)
    return e
  }
}
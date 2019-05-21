// 云函数入口文件
// 该云函数是在用户点击用户按钮的时候调用的
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

function waitGetUserInfo(openId) {
  return new Promise((resolve, reject) => {
    db.collection('userInfo').doc(openId).get().then(res => {
      console.log(res);
      resolve(res.data)
    }).catch(error => {
      console.log(error);
      reject({ code: 0 })
    })
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  const openId = cloud.getWXContext().OPENID
  const { _id } = event
  console.log(openId);
  let destineUser = await waitGetUserInfo()
  return {
  }
}
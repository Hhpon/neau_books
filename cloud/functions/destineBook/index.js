// 云函数入口文件
// 该云函数是在用户点击用户按钮的时候调用的
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

function waitGetUserInfo(openId) {
  return new Promise((resolve, reject) => {
    db.collection('userInfo').where({
      _openid: openId
    }).get().then(res => {
      console.log(res);
      resolve(res.data[0])
    }).catch(error => {
      console.log(error);
      reject({ code: 0 })
    })
  })
}

// 云函数入口函数
exports.main = async (event, context) => new Promise(async (resolve, reject) => {
  const openId = cloud.getWXContext().OPENID
  const { _id } = event
  const time = new Date().getTime()
  let destineUser = await waitGetUserInfo(openId)
  db.collection('booksInfo').doc(_id).update({
    data: {
      destineUserName: destineUser.userName,
      destineFaculty: destineUser.faculty,
      destineStudentID: destineUser.studentID,
      destineTel: destineUser.tel,
      destineOpenId: destineUser._openid,
      destineTime: time,
      bookStatus: 1
    }
  }).then(res => {
    console.log(res);
    resolve(res.stats)
  }).catch(error => {
    console.log(error);
  })
})
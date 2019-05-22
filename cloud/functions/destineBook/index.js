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

function waitGetBookInfo(_id) {
  return new Promise((resolve, reject) => {
    db.collection('booksInfo').doc(_id).get().then(res => {
      console.log(res);
      resolve(res.data)
    })
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  const openId = cloud.getWXContext().OPENID
  const { _id } = event
  console.log(openId);
  let destineUser = await waitGetUserInfo()
  // let booksInfo = await waitGetBookInfo(_id)
  // booksInfo.destineUserName = destineUser.userName
  // booksInfo.destineFaculty = destineUser.faculty
  // booksInfo.destineStudentID = destineUser.studentID
  // booksInfo.destineTel = destineUser.tel
  // booksInfo.destineOpenId = destineUser._openid
  db.collection('booksInfo').doc(_id).update({
    data: {
      destineUserName: destineUser.userName,
      destineFaculty: destineUser.faculty,
      destineStudentID: destineUser.studentID,
      destineTel: destineUser.tel,
      destineOpenId: destineUser._openid,
      bookStatus: 1
    }
  }).then((res) => {
    console.log(res);
    return ({ code: 1 })
  }).catch((error) => {
    console.log(error);
    return ({ code: 0 })
  })
}
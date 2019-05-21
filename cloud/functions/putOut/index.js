// 云函数入口文件
// 该云函数是在发布页面点击发布按钮以后进行的操作，实际操作为接收前端传输过来的数组，解析以后存储到数据库中
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

function waitAdd(bookInfo) {
  return new Promise((resolve, reject) => {
    db.collection('booksInfo').add({
      data: bookInfo
    }).then((result) => {
      console.log('1')
      resolve({ code: 1 })
    }).catch((err) => {
      reject({ code: 0 })
    });
  })
}

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  const openid = cloud.getWXContext().OPENID
  db.collection('userInfo').where({
    _openid: openid
  }).get().then(async (res) => {
    let userInfo = res.data[0]
    let bookItem = event.bookItem
    // booksInfo.forEach(async (bookItem) => {

    //   console.log(bookInfo);
    // });
    let bookInfo = {
      author: bookItem.author,
      edition: bookItem.edition,
      img: bookItem.img,
      isbn: bookItem.isbn,
      price: bookItem.price,
      publisher: bookItem.publisher,
      title: bookItem.title,
      nowPrice: bookItem.nowPrice,
      percentStatus: bookItem.percentStatus,
      _openid: openid,
      bookStatus: 0,
      avatarUrl: userInfo.avatarUrl,
      faculty: userInfo.faculty,
      studentID: userInfo.studentID,
      tel: userInfo.tel,
      userName: userInfo.userName
    }
    await waitAdd(bookInfo)
    resolve({ code: 1 })
  }).catch((error) => {
    console.log(error);
    reject({ code: 0 })
  })
})
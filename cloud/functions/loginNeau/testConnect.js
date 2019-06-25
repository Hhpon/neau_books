const axios = require('axios')
const { _URL_ } = require('./config')

function testConnct() {
  return new Promise((resolve, reject) => {
    axios.get(_URL_).then((result) => {
      resolve(0)
    }).catch((err) => {
      reject(1)
    });
  })
}

module.exports = testConnct
const axios = require('axios')

function testConnct() {
  return new Promise((resolve, reject) => {
    axios.get('http://202.118.167.86:9001/').then((result) => {
      resolve(0)
    }).catch((err) => {
      reject(1)
    });
  })
}

module.exports = testConnct
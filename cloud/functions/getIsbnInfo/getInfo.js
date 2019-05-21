const request = require('request')
const rp = require('request-promise')
const fs = require('fs')

function getInfo(isbn) {
  const { HOST, PATH, APPCODE } = fs.readFileSync('./config.json')
  console.log(HOST, PATH, APPCODE);

  let options = {
    url: HOST + PATH,
    qs: {
      isbn: isbn
    },
    headers: {
      Authorization: `APPCODE ${APPCODE}`
    }
  }

  return rp(options)
}

module.exports = getInfo
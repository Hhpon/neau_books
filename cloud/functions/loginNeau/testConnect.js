const axios = require('axios')

async function testConnct() {
  try {
    await axios.request({ url: 'http://202.118.167.86:9001/', timeout: 500 })
    return 0
  } catch (error) {
    return 1
  }
}

module.exports = testConnct
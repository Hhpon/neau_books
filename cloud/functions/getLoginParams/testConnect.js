const axios = require('axios')

async function testConnct() {
  try {
    let ret = await axios.request({ url: 'http://202.118.167.86:9001/', timeout: 500 })
    console.log(ret);
    console.log('可以访问到');
    return 0
  } catch (error) {
    console.log(error);
    return 1
  }
}

module.exports = testConnct
/**
 * npm install crypto-js request
 */
const CryptoJS = require("crypto-js");
const request = require('request');
const querystring = require('querystring');

// 云市场分配的密钥Id
const secretId = "AKID4tYHFW9lF4C5QqoVled2BE4c8tbL042G9K2K";
// 云市场分配的密钥Key
const secretKey = "JV7mgv0T7H8A7076wsxm1jrJrt1yk351B3HMHbkm";
const source = "market";


function handle(isbn) {
  // 签名
  var datetime = (new Date()).toGMTString();
  var signStr = "x-date: " + datetime + "\n" + "x-source: " + source;
  var sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signStr, secretKey))
  var auth = 'hmac id="' + secretId + '", algorithm="hmac-sha1", headers="x-date x-source", signature="' + sign + '"';

  // 请求方法
  var method = 'GET';
  // 请求头
  var headers = {
    "X-Source": source,
    "X-Date": datetime,
    "Authorization": auth,
  }
  // 查询参数
  var queryParams = {
    'isbn': isbn
  }
  // url参数拼接
  var url = 'https://service-osj3eufj-1255468759.ap-shanghai.apigateway.myqcloud.com/release/isbn';
  if (Object.keys(queryParams).length > 0) {
    url += '?' + querystring.stringify(queryParams);
  }

  var options = {
    url: url,
    timeout: 5000,
    method: method,
    headers: headers
  }

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error !== null) {
        reject('获取isbn出问题了')
        return;
      }
      let ret = JSON.parse(body)
      resolve(ret.showapi_res_body)
    });
  })
}

module.exports = handle;
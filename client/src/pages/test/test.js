import Taro, { Component } from '@tarojs/taro'
import { View, Input, Image, Button } from '@tarojs/components'

import './test.scss'

export default class Test extends Component {

  state = {
    imgUrl: '',
    cookie: ''
  }

  componentWillMount() {
    this.testConnction()
  }

  testConnction() {
    let that = this
    Taro.cloud.callFunction({
      name: 'getLoginParams'
    }).then(res => {
      let base64 = Taro.arrayBufferToBase64(res.result.charCode.data);
      that.setState({
        imgUrl: "data:image/PNG;base64," + base64,
        cookie: res.result.cookie
      })
    })
  }

  changeInput(e) {
    this.setState({
      charCode: e.detail.value
    })
  }

  submit() {
    console.log(this.state.charCode);
    Taro.cloud.callFunction({
      name: 'loginNeau',
      data: {
        charCode: this.state.charCode,
        cookie: this.state.cookie,
        studentID: 'A07170048',
        studentPassWord: 'A07170048'
      }
    }).then(res => {
      console.log(res);
    })
  }

  render() {
    return (
      <View>
        <View>
          <Input onInput={this.changeInput}></Input>
          <Image src={this.state.imgUrl} style='height: 20px;width: 80px;' />
          <Button onClick={this.submit}>提交</Button>
        </View>
      </View>
    )
  }
}
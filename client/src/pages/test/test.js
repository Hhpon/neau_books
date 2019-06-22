import Taro, { Component } from '@tarojs/taro'
import { View, Input, Image, Button } from '@tarojs/components'

import './test.scss'

export default class Test extends Component {

  state = {
    imgUrl: ''
  }

  componentWillMount() {
    this.testConnction()
  }

  testConnction() {
    let that = this
    Taro.cloud.callFunction({
      name: 'testConnction'
    }).then(res => {
      let base64 = Taro.arrayBufferToBase64(res.result.data);
      that.setState({
        imgUrl: "data:image/PNG;base64," + base64
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
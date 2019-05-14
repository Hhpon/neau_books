import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './sell.scss'

export default class Sell extends Component{
  config = {
    navigationBarTitleText: '扫码卖书'
  }
  constructor() {
    super()
    this.state ={

    }
  }
  
  render() {
    return (
      <View>
        <View>sell 页面</View>
      </View>
    )
  }
}
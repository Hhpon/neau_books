import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtIcon, AtToast } from 'taro-ui'
import './sell.scss'

export default class Sell extends Component {
  // 生命周期放在相对上方，方法放在下方

  config = {
    navigationBarTitleText: '扫码卖书'
  }
  constructor() {
    super()
    this.state = {
      isErrorOpened: false,
      toastIcon: '',
      toastText: '',
      toastStatus: '',
      toastDuration: 3000,
      booksInfo: []
    }
  }

  scanCode() {
    console.log('调用扫码');
    let params = {
      scanType: 'barCode'
    }
    let that = this;
    Taro.scanCode(params).then(res => {
      console.log(res);
      that.setState({
        toastStatus: 'loading',
        toastText: '加载中',
        toastDuration: 0,
        isErrorOpened: true
      })
      Taro.cloud.callFunction({
        name: 'getIsbnInfo',
        data: {
          isbn: res.result
        }
      }).then(result => {
        result = result.result
        console.log(result);
        if (result.ret_code === -1) {
          that.setState({
            toastStatus: 'error',
            toastText: '无效的二维码',
            toastDuration: 3000,
            isErrorOpened: true
          })
        }else if(result.ret_code === 0){
          let booksInfo = this.state.booksInfo
          if(booksInfo)
          that.setState({
            isErrorOpened: false
          })
        }else{
          that.setState({
            toastStatus: 'error',
            toastText: '网络出现问题，请稍后再试',
            toastDuration: 3000,
            isErrorOpened: true
          })
        }
      })
    })
  }

  enterInfo() {
    console.log('手动输入');
  }

  render() {
    return (
      <View className='sell'>
        <View>sell 页面</View>
        <View className='scan-code'>
          <View className='main-btn' onClick={this.scanCode}>
            <AtIcon prefixClass='iconfont' value='saoma' size='18'></AtIcon>
            <View>扫码卖书</View>
          </View>
          <View className='secondary-btn' onClick={this.enterInfo}>
            手动输入图书信息
        </View>
        </View>
        <View className='toast'>
          <AtToast duration={this.state.toastDuration} isOpened={this.state.isErrorOpened} status={this.state.toastStatus} text={this.state.toastText} icon={this.state.toastIcon}></AtToast>
        </View>
      </View>
    )
  }
}
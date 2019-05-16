import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtIcon, AtToast } from 'taro-ui'
import SeModal from '@components/modal/index'
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
      booksInfo: [],
      modalBtnContent: '确定',
      isModalOpened: false,
      modalContent: '该书已经发布过了'
    }
  }

  scanCode() {
    console.log('调用扫码');
    let params = {
      scanType: 'barCode'
    }
    let that = this;
    Taro.scanCode(params).then(res => {
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
        console.log(result.data);
        if (result.ret_code === -1) {
          that.setState({
            toastStatus: 'error',
            toastText: '无效的二维码',
            toastDuration: 3000,
            isErrorOpened: true
          })
        } else if (result.ret_code === 0) {
          let booksInfo = this.state.booksInfo
          let isbn = result.data.isbn
          let title = result.data.title
          let isbnIndex = booksInfo.findIndex((element) => {
            return element.isbn === isbn;
          })
          // 该判断主要应用于手动输入图书信息
          let bookTitleIndex = booksInfo.findIndex((element) => {
            return element.title = title
          })
          // 该判断的一部分也一样主要应用于手动输入图书信息
          if (isbnIndex !== -1 || bookTitleIndex !== -1) {
            that.setState({
              toastStatus: 'error',
              toastText: '已经发布过了',
              toastDuration: 3000,
              isErrorOpened: true
            })
            return
          }
          booksInfo.push(result.data)
          that.setState({
            isErrorOpened: false,
            booksInfo: booksInfo
          })
        } else {
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

  modalHandle() {
    console.log('您正在点击modal按钮');
    this.setState({
      isModalOpened: false
    })
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
        <View className='modal'>
          <SeModal content={this.state.modalContent} btnContent={this.state.modalBtnContent} isOpened={this.state.isModalOpened} onModalHandle={this.modalHandle}></SeModal>
        </View>
      </View>
    )
  }
}
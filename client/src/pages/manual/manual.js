import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtMessage, AtModal, AtRadio, AtButton } from 'taro-ui'
import SeInput from '@components/se-input/index'
import SeModal from '@components/modal/index'
import { ERR_OK } from '@common/js/config'

import './manual.scss'

export default class Manual extends Component {

  config = {
    navigationBarTitleText: '手动录入图书信息'
  }

  state = {
    title: '',
    author: '',
    price: null,
    nowPrice: null,
    percentStatus: '',
    percentModalStatus: '',
    isPercentOpened: false,
    percentOptions: [
      { label: '全新', value: 'new' },
      { label: '品相良好', value: 'good' },
      { label: '品相一般', value: 'general' }
    ],
    isTitleError: false,
    isAuthorError: false,
    isPriceError: false,
    isNowPriceError: false,
    isPercentStatusError: false,
    putOutModalContent: '书籍发送以后信息不可更改，确认发送吗？',
    isPutOutModalOpened: false,
    cancelIsOpen: true
  }

  _putOut(bookItem) {
    return new Promise((resolve, reject) => {
      Taro.cloud.callFunction({
        name: 'putOut',
        data: {
          bookItem: bookItem
        }
      })
        .then(res => {
          console.log(res);
          resolve({ code: ERR_OK })
        }).catch(error => {
          reject(error)
        })
    })
  }

  titleChange(e) {
    let value = e.detail.value
    this.setState({
      title: value
    })
    return value
  }

  authorChange(e) {
    let value = e.detail.value
    this.setState({
      author: value
    })
    return value
  }

  priceChange(e) {
    let value;
    if (!e.detail.value) {
      value = e.detail.value
    } else {
      value = +e.detail.value
    }
    console.log(value);
    this.setState({
      price: value
    })
    return value
  }

  nowPriceChange(e) {
    let value;
    if (!e.detail.value) {
      value = e.detail.value
    } else {
      value = +e.detail.value
    }
    this.setState({
      nowPrice: value
    })
    return value
  }

  titleBlur(e) {
    let value = e.detail.value
    if (!value) {
      this.setState({
        isTitleError: true
      })
      return
    }
    this.setState({
      isTitleError: false
    })
  }

  authorBlur(e) {
    let value = e.detail.value
    if (!value) {
      this.setState({
        isAuthorError: true
      })
      return
    }
    this.setState({
      isAuthorError: false
    })
  }

  priceBlur(e) {
    let value = +e.detail.value
    let priceReg = /\b[1-9]([0-9]*)\b/
    if (!priceReg.test(value)) {
      this.setState({
        isPriceError: true
      })
      return
    }
    this.setState({
      isPriceError: false
    })
  }

  nowPriceBlur(e) {
    let value = +e.detail.value
    let nowPriceReg = /\b[1-9]([0-9]*)\b/
    if (!nowPriceReg.test(value)) {
      this.setState({
        isNowPriceError: true
      })
      return
    }
    this.setState({
      isNowPriceError: false
    })
  }

  percentClick() {
    this.setState({
      isPercentOpened: true
    })
  }

  // 改变currentindex标志的品相
  percentStatusChange(value, e) {
    this.setState({
      percentStatus: e.label,
      isPercentOpened: false,
      percentModalStatus: value
    })
  }

  // 点击确认发布按钮
  putOutOne() {
    setTimeout(() => {
      let percentStatus = this.state.percentStatus
      if (this.state.isTitleError || this.state.isAuthorError || this.state.isPriceError || this.state.isNowPriceError || !percentStatus || !this.state.title || !this.state.author || !this.state.price || !this.state.nowPrice) {
        Taro.atMessage({
          'message': '请正确填写内容',
          'type': 'error',
        })
        return
      }
      this.setState({
        isPutOutModalOpened: true
      })
    }, 200)
  }

  async putOutConfirmModalHandle() {
    Taro.showLoading({
      title: '加载中',
      mask: true
    })
    let bookItem = {
      title: this.state.title,
      author: this.state.author,
      price: this.state.price,
      nowPrice: this.state.nowPrice,
      percentStatus: this.state.percentStatus,
      img: 'https://jser.hhp.im/hhp/img/book.png'
    }
    let ret_code = await this._putOut(bookItem)
    if (ret_code.code !== ERR_OK) {
      Taro.hideLoading()
      Taro.atMessage({
        'message': `发布失败，请稍后重试`,
        'type': 'error',
      })
      return
    }
    this.setState({
      isPutOutModalOpened: false
    })
    Taro.hideLoading()
    Taro.atMessage({
      'message': `发布成功`,
      'type': 'success',
    })
    setTimeout(() => {
      Taro.navigateBack({ delta: 1 })
    }, 200)
  }

  putOutCancelModalHandle() {
    this.setState({
      isPutOutModalOpened: false
    })
  }

  render() {
    return (
      <View className='manual'>
        <View>
          <SeInput onBlurInput={this.titleBlur} isError={this.state.isTitleError} value={this.state.title} title='书名' placeholder='请输入书名' onChangeInput={this.titleChange}></SeInput>
          <SeInput onBlurInput={this.authorBlur} isError={this.state.isAuthorError} value={this.state.author} title='主编' placeholder='请输入主编' onChangeInput={this.authorChange}></SeInput>
          <SeInput onBlurInput={this.priceBlur} isError={this.state.isPriceError} value={this.state.price} type='number' title='原价' placeholder='请输入原价' onChangeInput={this.priceChange}></SeInput>
          <SeInput onBlurInput={this.nowPriceBlur} isError={this.state.isNowPriceError} value={this.state.nowPrice} title='现价' type='number' placeholder='请输入现价' onChangeInput={this.nowPriceChange}></SeInput>
          <SeInput isClick onBlurInput={this.percentStatusBlur} isError={this.state.isPercentStatusError} value={this.state.percentStatus} disabled title='品相' placeholder='请输入品相' onClickInput={this.percentClick}></SeInput>
          <View style='margin: 20px 10px;'>
            <AtButton type='primary' onClick={this.putOutOne}>确认发布</AtButton>
          </View>
          <View className='precent-modal'>
            <AtModal isOpened={this.state.isPercentOpened}>
              <AtRadio
                options={this.state.percentOptions}
                value={this.state.percentModalStatus}
                onClick={this.percentStatusChange.bind(this)}
              />
            </AtModal>
          </View>
          <View className='modal'>
            <SeModal onCancelModalHandle={this.putOutCancelModalHandle} cancelIsOpen={this.state.cancelIsOpen} content={this.state.putOutModalContent} isOpened={this.state.isPutOutModalOpened} onConfirmModalHandle={this.putOutConfirmModalHandle}></SeModal>
          </View>
          <AtMessage />
        </View>
      </View>
    )
  }
}
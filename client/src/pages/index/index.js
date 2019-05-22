import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { AtModal, AtModalAction, AtSearchBar, AtMessage } from "taro-ui"
import { OPENID_STORAGE, LIMIT_COUNT, ERR_OK, ERR_NO } from '@common/js/config'
import BookCard from '@components/book-card/index'
import SeModal from '@components/modal/index'

import './index.scss'

const db = Taro.cloud.database()

// import Login from '../../components/login/index'

export default class Index extends Component {

  config = {
    navigationBarTitleText: '首页',
    enablePullDownRefresh: true
  }

  constructor() {
    super();
    this.state = {
      isOpened: false,
      closeOnClickOverlay: false,
      currentIndex: 0,  // 分页获取时的页码
      booksInfo: [],
      isModalOpened: false,
      modalContent: '完成学生认证才可继续发布书籍',
      isCloseOpened: false,
      destineModalContent: '',
      isDestineModalOpened: false,
      currentId: '',
      currentBookIndex: 0
    }
  }

  componentWillMount() {
    this.isAuthorize()
    this._getAllBooksInfo()
  }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() {
    Taro.startPullDownRefresh().then(() => {
      Taro.stopPullDownRefresh()
    })
  }

  componentDidHide() { }

  onPullDownRefresh() {
    let that = this
    this.setState({
      currentIndex: 0,
      booksInfo: []
    }, async () => {
      await that._getAllBooksInfo()
      Taro.stopPullDownRefresh()
    })
  }

  _getOpenId() {
    Taro.cloud
      .callFunction({
        name: "login"
      })
      .then(res => {
        Taro.setStorage({ key: OPENID_STORAGE, data: res.result.openid })
      })
  }

  // 分页获取所有书籍
  _getAllBooksInfo() {
    return new Promise((resolve) => {
      let currentIndex = this.state.currentIndex
      let booksInfo = this.state.booksInfo
      let that = this
      db.collection('booksInfo').where({
        bookStatus: 0
      }).limit(LIMIT_COUNT).skip(LIMIT_COUNT * currentIndex).get().then(res => {
        console.log(res.data);
        let newBooksInfo = booksInfo.concat(res.data)
        that.setState({
          booksInfo: newBooksInfo
        })
        resolve({ code: ERR_OK })
      }).catch(err => {
        console.log(err);
      })
    })
  }

  // 检测是否完成学生认证
  _isAttest() {
    let that = this
    return new Promise((resolve, reject) => {
      let openId = Taro.getStorageSync(OPENID_STORAGE)
      db.collection('userInfo').where({
        // data 字段表示需新增的 JSON 数据
        _openid: openId
      }).get()
        .then((res) => {
          console.log('async')
          if (!res.data[0].studentID) {
            that.setState({
              isModalOpened: true
            })
            resolve(0)
            return;
          }
          resolve(1)
        })
        .catch(() => {
          console.log('catch');
          Taro.atMessage({
            'message': '网络出现问题，请稍后再试',
            'type': 'error',
          })
          reject(0)
        })
    })
  }

  // 授权后的操作
  getuserInfo(e) {
    this._getOpenId()
    let that = this
    let userInfo = e.detail.userInfo
    db.collection('userInfo').add({
      // data 字段表示需新增的 JSON 数据
      data: userInfo
    })
      .then(() => {
        Taro.showTabBar({ animation: true })
        that.setState({
          isOpened: false
        })
      })
      .catch(() => {
        console.log('catch');
      })
  }

  // 检测是否授权
  isAuthorize() {
    let that = this;
    Taro.getSetting({
      success(res) {
        let scopeUserInfo = res.authSetting['scope.userInfo']
        let openId = Taro.getStorageSync(OPENID_STORAGE)
        if (scopeUserInfo && openId) {
          return;
        }
        Taro.hideTabBar({ animation: true })
        that.setState({
          isOpened: true
        })
      }
    })
  }

  // 当未完成学生认证的时候会跳转页面完成学生认证
  modalHandle() {
    console.log('您正在点击modal确定按钮');
    Taro.navigateTo({ url: '/pages/attest/attest' })
    this.setState({
      isModalOpened: false
    })
  }

  // 点击预订按钮进行的操作
  async destineBook(_id, _openid, index) {
    let openId = Taro.getStorageSync(OPENID_STORAGE)
    if (openId === _openid) {
      Taro.atMessage({
        'message': '不能预订自己的书籍，笨蛋',
        'type': 'info',
      })
      return
    }
    let ret_code = await this._isAttest()
    console.log(ret_code);
    if (!ret_code) {
      return
    }
    console.log('可预订');
    this.setState({
      destineModalContent: '预订后不能退订，确认预订嘛',
      isDestineModalOpened: true,
      currentId: _id,
      currentBookIndex: index
    })
  }

  searchHandle() {
    console.log('跳转到搜索页面');
  }

  btnConfirmModalHandle() {
    let _id = this.state.currentId
    let that = this
    let currentBookIndex = this.state.currentBookIndex
    Taro.cloud.callFunction({
      name: 'destineBook',
      data: { _id: _id }
    }).then(res => {
      console.log(res);
      Taro.atMessage({
        'message': '预订成功',
        'type': 'success'
      })
      let booksInfo = this.state.booksInfo
      booksInfo.splice(currentBookIndex, 1)
      that.setState({
        booksInfo: booksInfo
      })
    })
  }

  btnCancelModalHandle() {
    this.setState({
      isDestineModalOpened: false
    })
  }

  render() {
    let booksInfo = this.state.booksInfo
    const BooksList = booksInfo.map((bookItem, index) => {
      return (
        <BookCard onClose={this.closeBtnClick.bind(this, index)} isCloseOpened={this.state.isCloseOpened} key={bookItem._id} taroKey={index} bookInfo={bookItem}>
          <View className='info-des'>
            <View className='des-left'>
              <View className='info-percent'>
                品相：{bookItem.percentStatus}
              </View>
              <View className='info-price'>
                <Text className='price'>￥{bookItem.price}</Text>
                <Text className='now-price'>￥{bookItem.nowPrice}</Text>
              </View>
            </View>
            <View className='des-right'>
              <View onClick={this.destineBook.bind(this, bookItem._id, bookItem._openid, index)}>
                预订
              </View>
            </View>
          </View>
        </BookCard >
      )
    })
    return (
      <View className='index' >
        <View className='search-container' onClick={this.searchHandle}>
          <AtSearchBar
            value={this.state.value}
            disabled
          />
        </View>
        <View className='book-list'>
          {BooksList}
        </View>
        <AtModal isOpened={this.state.isOpened} closeOnClickOverlay={this.state.closeOnClickOverlay}>
          <View className='model-content'>欢迎你来到东农二手书买卖平台</View>
          <AtModalAction><Button open-type='getUserInfo' ongetuserinfo={this.getuserInfo}>确定</Button></AtModalAction>
        </AtModal>
        <View className='modal'>
          <SeModal content={this.state.modalContent} isOpened={this.state.isModalOpened} onConfirmModalHandle={this.modalHandle}></SeModal>
        </View>
        <View className='modal'>
          <SeModal cancelIsOpen content={this.state.destineModalContent} isOpened={this.state.isDestineModalOpened} onConfirmModalHandle={this.btnConfirmModalHandle} onCancelModalHandle={this.btnCancelModalHandle}></SeModal>
        </View>
        <AtMessage />
      </View>
    )
  }
}

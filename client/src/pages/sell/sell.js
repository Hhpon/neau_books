import Taro, { Component } from '@tarojs/taro'
import { View, Text, Input, ScrollView, Button } from '@tarojs/components'
import { AtIcon, AtToast, AtModal, AtRadio, AtMessage } from 'taro-ui'
import SeModal from '@components/modal/index'
import BookCard from '@components/book-card/index'
import { OPENID_STORAGE, ERR_OK } from '@common/js/config'
import './sell.scss'

const db = Taro.cloud.database()

export default class Sell extends Component {
  // 生命周期放在相对上方，方法放在下方

  config = {
    navigationBarTitleText: '扫码卖书'
  }
  constructor() {
    super()
    this.state = {
      currentIndex: 0,
      isErrorOpened: false,
      toastIcon: '',
      toastText: '',
      toastStatus: '',
      toastDuration: 3000,
      booksInfo: [],
      isModalOpened: false,
      modalContent: '完成学生认证才可继续发布书籍',
      percentStatus: '',
      isPercentOpened: false,
      percentOptions: [
        { label: '全新', value: 'new' },
        { label: '品相良好', value: 'good' },
        { label: '品相一般', value: 'general' }
      ],
      putOutModalContent: '书籍发送以后信息不可更改，确认发送吗？',
      isPutOutModalOpened: false,
      cancelIsOpen: true
    }
  }

  componentWillMount() { }

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
          that.setState({
            toastStatus: 'error',
            toastText: '网络出现问题，请稍后再试',
            toastDuration: 3000,
            isErrorOpened: true
          })
          reject('网络问题，请联系管理员')
        })
    })
  }

  // 检测上次发布的书籍是否已经被完善
  _isBooksInfoOver() {
    console.log('触发boosOver方法');
    let booksInfo = this.state.booksInfo
    if (!booksInfo.length) {
      return 0
    }
    let booksIt = booksInfo[booksInfo.length - 1]
    if (!booksIt.nowPrice || !booksIt.percentStatus) {
      Taro.atMessage({
        'message': '请完善书籍信息',
        'type': 'error',
      })
      return 1
    }
    return 0
  }

  _putOut(bookItem) {
    return new Promise((resolve, reject) => {
      Taro.cloud.callFunction({
        name: 'putOut',
        data: {
          bookItem: bookItem
        }
      }).then(res => {
        console.log(res);
        resolve({ code: ERR_OK })
      }).catch(error => {
        console.log(error);
        reject(error)
      })
    })
  }

  // 扫描书籍条形码，并在扫描之前查看是否完成学生认证且是否把刚刚上传的书籍信息完善
  async scanCode(e) {
    e.stopPropagation()
    console.log('调用扫码');
    let ret_code = await this._isAttest()
    if (ret_code !== 1) {
      return;
    }
    let over_code = this._isBooksInfoOver()
    console.log(over_code)
    if (over_code) {
      return
    }
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
        console.log(result);
        if (result.ret_code === -1) {
          that.setState({
            toastStatus: 'error',
            toastText: '无效的二维码',
            toastDuration: 2000,
            isErrorOpened: true
          })
        } else if (result.ret_code === 0) {
          let booksInfo = this.state.booksInfo
          let isbn = result.data.isbn
          let isbnIndex = booksInfo.findIndex((element) => {
            return element.isbn === isbn;
          })
          if (isbnIndex !== -1) {
            that.setState({
              toastStatus: 'error',
              toastText: '已经发布过了',
              toastDuration: 2000,
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
            toastDuration: 2000,
            isErrorOpened: true
          })
        }
      })
    })
  }

  // 手动输入图书信息 - 跳转页面，在另一个页面输入
  async enterInfo() {
    let ret_code = await this._isAttest()
    if (ret_code !== 1) {
      return;
    }
    Taro.navigateTo({ url: '/pages/manual/manual' })
  }

  // 当未完成学生认证的时候会跳转页面完成学生认证
  modalHandle() {
    console.log('您正在点击modal确定按钮');
    Taro.navigateTo({ url: '/pages/attest/attest' })
    this.setState({
      isModalOpened: false
    })
  }

  // 改变当前index 的价格
  nowPriceChange(index, e) {
    let booksInfo = this.state.booksInfo
    booksInfo[index].nowPrice = +e.detail.value
    this.setState({
      booksInfo: booksInfo
    })
  }

  // 设置了currentIndex标志位，来改变品相
  selectedPercent(index, e) {
    console.log('调用方法让modal显示');
    e.stopPropagation()
    this.setState({
      currentIndex: index,
      isPercentOpened: true
    })
  }

  // 改变currentindex标志的品相
  percentStatusChange(value, e) {
    let currentIndex = this.state.currentIndex
    let booksInfo = this.state.booksInfo
    booksInfo[currentIndex].percentStatus = e.label
    this.setState({
      percentStatus: value,
      booksInfo: booksInfo,
      isPercentOpened: false
    })
  }

  // 点击close的时候删除数组中的某个书籍
  closeBtnClick(index) {
    console.log(`正在点击第${index}个子组件close`);
    let booksInfo = this.state.booksInfo
    booksInfo.splice(index, 1)
    this.setState({
      booksInfo: booksInfo
    })
  }

  // toast 当到达时间的时候toast会消失，但是isopened的值不会改变，所以要调用onclose的方法改变isopend的值
  closeToast() {
    this.setState({
      isErrorOpened: false
    })
  }

  // 点击发布按钮之后的操作，首先要检验书籍信息是否完整，然后把书籍信息数组传输到云函数，云函数进行接下来的处理
  async putOutHandle() {
    let over_code = this._isBooksInfoOver()
    console.log(over_code)
    if (over_code) {
      return
    }
    this.setState({
      isPutOutModalOpened: true
    })
  }

  async putOutConfirmModalHandle() {
    let booksInfo = this.state.booksInfo
    let putOutPromiseArr = booksInfo.map(this._putOut)
    await Promise.all(putOutPromiseArr)
    Taro.atMessage({
      'message': `发布成功`,
      'type': 'success',
    })
    this.setState({
      booksInfo: [],
      isPutOutModalOpened: false
    })
  }

  putOutCancelModalHandle() {
    this.setState({
      isPutOutModalOpened: false
    })
  }

  putOutCancelHandle() {
    this.setState({
      isModalOpened: false
    })
  }

  render() {
    let booksInfo = this.state.booksInfo;
    let totalPrice = function () {
      let sum = 0;
      booksInfo.forEach((element) => {
        if (element.nowPrice) {
          sum += element.nowPrice
        }
      })
      return sum
    }
    const BooksList = booksInfo.map((bookItem, index) => {
      return (
        <BookCard onClose={this.closeBtnClick.bind(this, index)} key={bookItem.isbn} taroKey={index} bookInfo={bookItem}>
          <View className='info-des'>
            <Text>价格：</Text>
            <Input onBlur={this.nowPriceChange.bind(this, index)} className='des' type='number' placeholder='价格'></Input>
            <Text>品相：</Text>
            <View onClick={this.selectedPercent.bind(this, index)}>
              <Input value={bookItem.percentStatus} disabled className='des' placeholder='请选择'></Input>
            </View>
          </View>
        </BookCard>
      )
    })
    return (
      <View className='sell'>
        <ScrollView scrollY enableBackToTop className='book-card'>
          {BooksList}
          {!booksInfo.length && <View className='nothing-wrapper'>您还没扫描任何书籍</View>}
        </ScrollView>
        <View className='scan-code'>
          <View className='main-btn' onClick={this.scanCode}>
            <AtIcon prefixClass='iconfont' value='saoma' size='18'></AtIcon>
            <View>扫码卖书</View>
          </View>
          <View className='secondary-btn' onClick={this.enterInfo}>
            手动输入图书信息
          </View>
          {booksInfo.length &&
            <View className='putOutWrapper'>
              <View>{booksInfo.length}本 可卖￥{totalPrice()}</View>
              <Button className='putOutBtn' onClick={this.putOutHandle}>发布</Button>
            </View>
          }
        </View>
        <View className='toast'>
          <AtToast onClose={this.closeToast} duration={this.state.toastDuration} isOpened={this.state.isErrorOpened} status={this.state.toastStatus} text={this.state.toastText} icon={this.state.toastIcon}></AtToast>
        </View>
        <View className='modal'>
          <SeModal onCancelModalHandle={this.putOutCancelHandle} cancelIsOpen content={this.state.modalContent} isOpened={this.state.isModalOpened} onConfirmModalHandle={this.modalHandle}></SeModal>
        </View>
        <View className='modal'>
          <SeModal onCancelModalHandle={this.putOutCancelModalHandle} cancelIsOpen={this.state.cancelIsOpen} content={this.state.putOutModalContent} isOpened={this.state.isPutOutModalOpened} onConfirmModalHandle={this.putOutConfirmModalHandle}></SeModal>
        </View>
        <View className='precent-modal'>
          <AtModal isOpened={this.state.isPercentOpened}>
            <AtRadio
              options={this.state.percentOptions}
              value={this.state.percentStatus}
              onClick={this.percentStatusChange.bind(this)}
            />
          </AtModal>
        </View>
        <AtMessage />
      </View>
    )
  }
}
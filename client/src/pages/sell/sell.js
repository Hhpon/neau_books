import Taro, { Component } from '@tarojs/taro'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import { AtIcon, AtToast, AtModal, AtRadio, AtMessage } from 'taro-ui'
import SeModal from '@components/modal/index'
import BookCard from '@components/book-card/index'
import { OPENID_STORAGE } from '@common/js/config'
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
      booksInfo: [{ author: "Nicholas C.Zakas（著）曹力（译）", binding: "平装", edition: "3", format: "16开", gist: "　　作为JavaScript技术经典名著，《JavaScript高级程序设计（第3版）》承继了之前版本全面深入、贴近实战的特点，在详细讲解了JavaScript语言的核心之后，条分缕析地为读者展示了现有规范及实现为开发Web应用提供的各种支持和特性。", img: "http://app2.showapi.com/isbn/img/6876ed71be3145fba2de078f987b1422.jpg", isbn: "9787115275790", page: "730", paper: "胶版纸", price: "99.00", produce: "", pubdate: "2012-03", publisher: "人民邮电出版社", title: "JavaScript高级程序设计（第3版）" }],
      modalBtnContent: '确定',
      isModalOpened: false,
      modalContent: '完成学生认证才可继续发布书籍',
      percentStatus: '',
      isPercentOpened: false,
      percentOptions: [
        { label: '全新', value: 'new' },
        { label: '品相良好', value: 'good' },
        { label: '品相一般', value: 'general' }
      ]
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

  // 手动输入图书信息 - 跳转页面，在另一个页面输入
  enterInfo() {
    console.log('手动输入');
    this.isAttest()
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
    booksInfo[index].nowPrice = e.detail.value
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

  render() {
    let booksInfo = this.state.booksInfo;
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
        </ScrollView>
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
          <AtToast onClose={this.closeToast} duration={this.state.toastDuration} isOpened={this.state.isErrorOpened} status={this.state.toastStatus} text={this.state.toastText} icon={this.state.toastIcon}></AtToast>
        </View>
        <View className='modal'>
          <SeModal content={this.state.modalContent} btnContent={this.state.modalBtnContent} isOpened={this.state.isModalOpened} onModalHandle={this.modalHandle}></SeModal>
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
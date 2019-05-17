import Taro, { Component } from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { AtIcon, AtToast } from 'taro-ui'
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
      isErrorOpened: false,
      toastIcon: '',
      toastText: '',
      toastStatus: '',
      toastDuration: 3000,
      booksInfo: [{ author: "Nicholas C.Zakas（著）曹力（译）", binding: "平装", edition: "3", format: "16开", gist: "　　作为JavaScript技术经典名著，《JavaScript高级程序设计（第3版）》承继了之前版本全面深入、贴近实战的特点，在详细讲解了JavaScript语言的核心之后，条分缕析地为读者展示了现有规范及实现为开发Web应用提供的各种支持和特性。", img: "http://app2.showapi.com/isbn/img/6876ed71be3145fba2de078f987b1422.jpg", isbn: "9787115275790", page: "730", paper: "胶版纸", price: "99.00", produce: "", pubdate: "2012-03", publisher: "人民邮电出版社", title: "JavaScript高级程序设计（第3版）" }],
      modalBtnContent: '确定',
      isModalOpened: false,
      modalContent: '完成学生认证才可继续发布书籍',
      percentColor: 'color:black'
    }
  }

  componentWillMount() { }

  isAttest() {
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

  async scanCode() {
    console.log('调用扫码');
    let ret_code = await this.isAttest()
    console.log(ret_code);
    if (ret_code !== 1) {
      return;
    }
    console.log('await')
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
    this.isAttest()
  }

  modalHandle() {
    console.log('您正在点击modal确定按钮');
    Taro.navigateTo({ url: '/pages/attest/attest' })
    this.setState({
      isModalOpened: false
    })
  }

  percentChange(value) {
    console.log(value.detail.value);
    if (value.detail.value > 10 || value.detail.value < 0) {
      this.setState({
        percentColor: 'color:red',
        toastStatus: 'error',
        toastText: '请输入有效的数字',
        toastDuration: 1500,
        isErrorOpened: true
      })
    }
    this.setState({
      percentColor: 
    })
  }

  nowPriceChange(value) {
    // this.setState({
    //   nowPrice: value
    // })
    console.log(value);
  }

  render() {
    return (
      <View className='sell'>
        <View className='book-card'>
          <BookCard bookInfo={this.state.booksInfo[0]}>
            <View className='info-des'>
              <Text>价格：</Text>
              <Input onBlur={this.nowPriceChange.bind(this)} className='des' type='number' placeholder='价格'></Input>
              <Text style={this.state.percentColor}>新旧程度：</Text>
              <Input onBlur={this.percentChange} maxlength={2} className='des' type='number' placeholder='几成新'></Input>
            </View>
          </BookCard>
        </View>
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
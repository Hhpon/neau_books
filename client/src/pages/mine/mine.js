import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtTabs, AtTabsPane, AtMessage } from 'taro-ui'
import { OPENID_STORAGE } from '@common/js/config'
import BookCard from '@components/book-card/index'
import SeModal from '@components/modal/index'

import './mine.scss'
// import { rejects } from 'assert';

const db = Taro.cloud.database()

export default class Mine extends Component {
  // 生命周期放在相对上方，方法放在下方

  config = {
    navigationBarTitleText: '个人信息'
  }
  constructor() {
    super()
    this.state = {
      currentPage: 0,
      tabList: [{ title: '我预订的' }, { title: '我发布的' }],
      currentIndex: 1,
      booksInfo: [],
      isModalOpened: false,
      modalContent: ''
    }
  }

  componentDidShow() {
    this._getPutBooks()
  }

  _getPutBooks() {
    let openId = Taro.getStorageSync(OPENID_STORAGE)
    let currentIndex = this.state.currentPage
    let that = this
    return new Promise((resolve, reject) => {
      db.collection('booksInfo').where({
        _openid: openId
      }).limit(20).skip(20 * currentIndex).get().then(res => {
        that.setState({
          currentIndex: currentIndex + 1,
          booksInfo: res.data
        })
        resolve({ code: 1 })
      }).catch(() => {
        reject({ code: 0 })
      })
    })
  }

  handleClick(value) {
    this.setState({
      currentPage: value
    })
  }

  async closeBtnClick(index, e) {
    console.log(index);
    await this._getPutBooks()
    let booksInfo = this.state.booksInfo;
    let bookStatus = booksInfo[index].bookStatus
    if (bookStatus) {
      Taro.atMessage({
        'message': '该书籍已经被预订，不可删除！',
        'type': 'error',
      })
      return
    }
    this.setState({
      isModalOpened: true,
      modalContent: '确定删除该书嘛？',
      currentBook: index
    })
  }

  modalHandle() {
    let currentBook = this.state.currentBook
    let booksInfo = this.state.booksInfo
    let currentBookInfo = booksInfo[currentBook]
    let that = this
    db.collection('booksInfo').doc(currentBookInfo._id).remove().then(res => {
      booksInfo.splice(currentBook, 1)
      that.setState({
        booksInfo: booksInfo
      })
      Taro.atMessage({
        'message': '删除成功！',
        'type': 'success',
      })
    }).catch(() => {
      Taro.atMessage({
        'message': '删除失败！',
        'type': 'error',
      })
    })
    this.setState({
      isModalOpened: false
    })
  }

  render() {
    const BooksList = booksInfo.map((bookItem, index) => {
      return (
        <BookCard onClose={this.closeBtnClick.bind(this, index)} key={bookItem._id} taroKey={index} bookInfo={bookItem}>
          {/* <View className='info-des'>
            <Text>价格：</Text>
            <Input onBlur={this.nowPriceChange.bind(this, index)} className='des' type='number' placeholder='价格'></Input>
            <Text>品相：</Text>
            <View onClick={this.selectedPercent.bind(this, index)}>
              <Input value={bookItem.percentStatus} disabled className='des' placeholder='请选择'></Input>
            </View>
          </View> */}
        </BookCard>
      )
    })
    return (
      <View className='mine'>
        <View className='mine-mes'>
          <View className='avator'>
            <open-data type='userAvatarUrl'></open-data>
          </View>
          <View className='nickname'>
            <open-data type='userNickName'></open-data>
          </View>
        </View>
        <View className='mine-books'>
          <AtTabs current={this.state.current} tabList={this.state.tabList} onClick={this.handleClick.bind(this)}>
            <AtTabsPane current={this.state.current} index={0} >
              <View>
                {BooksList}
              </View>
            </AtTabsPane>
            <AtTabsPane current={this.state.current} index={1}>
              <View>
                
              </View>
            </AtTabsPane>
          </AtTabs>
        </View>
        <View className='model'>
          <SeModal content={this.state.modalContent} isOpened={this.state.isModalOpened} onModalHandle={this.modalHandle}></SeModal>
        </View>
      </View>
    )
  }
}
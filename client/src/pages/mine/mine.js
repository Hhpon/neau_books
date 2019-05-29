import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtTabs, AtTabsPane, AtMessage } from 'taro-ui'
import { OPENID_STORAGE, LIMIT_COUNT, ERR_OK, ERR_NO } from '@common/js/config'
import BookCard from '@components/book-card/index'
import SeModal from '@components/modal/index'

import './mine.scss'
// import { rejects } from 'assert';

const db = Taro.cloud.database()

export default class Mine extends Component {
  // 生命周期放在相对上方，方法放在下方

  config = {
    navigationBarTitleText: '个人信息',
    enablePullDownRefresh: true
  }
  constructor() {
    super()
    this.state = {
      currentPage: 0,
      currentIndex: 0, // 标记当前页数的
      currentDestineIndex: 0, // 标记我预定的当前页数
      currentBook: 0,  // 标志删除书籍索引的
      tabList: [{ title: '我发布的' }, { title: '我预订的' }],
      booksInfo: [],  // 发布的所有书籍
      isModalOpened: false,
      modalContent: '',
      destineBooksInfo: [],
      isCloseOpened: false,
      isLoad: false,
      isPutMore: true,
      isDestineMore: true
    }
  }

  async componentWillMount() {
  }

  componentDidShow() {
    Taro.startPullDownRefresh().then(() => {
      setTimeout(() => {
        Taro.stopPullDownRefresh()
      }, 500);
    })
  }

  // 下拉刷新
  onPullDownRefresh() {
    let that = this
    this.setState({
      currentIndex: 0,
      currentDestineIndex: 0,
      destineBooksInfo: [],
      booksInfo: [],
      isLoad: false,
      isPutMore: true,
      isDestineMore: true
    }, async () => {
      await that._getPutBooks()
      await that._getDestineBooks()
      Taro.stopPullDownRefresh()
    })
  }

  // 上拉加载
  onReachBottom() {
    let that = this
    let currentPage = this.state.currentPage
    let isPutMore = this.state.isPutMore
    let isDestineMore = this.state.isDestineMore
    if (currentPage === 0 && isPutMore) {
      let currentIndex = this.state.currentIndex
      this.setState({
        currentIndex: currentIndex + 1
      }, () => {
        that._getPutBooks()
      })
    } else if (currentPage === 1 && isDestineMore) {
      let currentDestineIndex = this.state.currentDestineIndex
      this.setState({
        currentIndex: currentDestineIndex + 1,
      }, () => {
        that._getDestineBooks()
      })
    }
  }

  // 分页获取我发布的书籍数据
  _getPutBooks() {
    let openId = Taro.getStorageSync(OPENID_STORAGE)
    let currentIndex = this.state.currentIndex
    let booksInfo = this.state.booksInfo
    let that = this
    return new Promise((resolve, reject) => {
      db.collection('booksInfo').where({
        _openid: openId
      }).limit(LIMIT_COUNT).skip(LIMIT_COUNT * currentIndex).orderBy('putOutTime', 'desc').get().then(res => {
        let newBooksInfo = booksInfo.concat(res.data)
        if (res.data.length < LIMIT_COUNT) {
          that.setState({
            isPutMore: false
          })
        }
        that.setState({
          booksInfo: newBooksInfo,
          isLoad: false
        })
        resolve({ code: ERR_OK })
      }).catch(() => {
        reject({ code: ERR_NO })
      })
    })
  }

  _getDestineBooks() {
    let openId = Taro.getStorageSync(OPENID_STORAGE)
    let currentDestineIndex = this.state.currentDestineIndex
    let destineBooksInfo = this.state.destineBooksInfo
    let that = this
    return new Promise((resolve, reject) => {
      db.collection('booksInfo').where({
        destineOpenId: openId
      }).limit(LIMIT_COUNT).skip(LIMIT_COUNT * currentDestineIndex).orderBy('destineTime', 'desc').get().then(res => {
        let newBooksInfo = destineBooksInfo.concat(res.data)
        if (res.data.length < LIMIT_COUNT) {
          that.setState({
            isDestineMore: false
          })
        }
        that.setState({
          destineBooksInfo: newBooksInfo,
          isLoad: false
        })
        resolve({ code: ERR_OK })
      }).catch(error => {
        console.log(error);
        reject({ code: ERR_NO })
      })
    })
  }

  // 分页'我发布的'与'我预订的'
  handleClick(value) {
    this.setState({
      currentPage: value
    })
  }

  // 点击差的时候的方法
  async closeBtnClick(index) {
    let booksInfo = this.state.booksInfo;
    // let bookStatus = booksInfo[index].bookStatus
    let _id = booksInfo[index]._id
    let that = this
    db.collection('booksInfo').doc(_id).get().then((res) => {
      let bookStatus = res.data.bookStatus
      if (bookStatus) {
        Taro.atMessage({
          'message': '该书籍已经被预订，不可删除！',
          'type': 'error',
        })
        return
      }
      that.setState({
        isModalOpened: true,
        modalContent: '确定删除该书嘛？',
        currentBook: index
      })
    })
  }

  // 点击模态框的确定按钮
  onConfirmModalHandle() {
    let currentBook = this.state.currentBook
    let booksInfo = this.state.booksInfo
    let currentBookInfo = booksInfo[currentBook]
    let that = this
    db.collection('booksInfo').doc(currentBookInfo._id).remove().then(() => {
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

  // 点击模态框的取消按钮
  onCancelModalHandle() {
    this.setState({
      isModalOpened: false
    })
  }

  // 改变书籍预订状态
  destineChange(id, index) {
    console.log(id);
    console.log(index);
    Taro.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this
    let destineBooksInfo = this.state.destineBooksInfo
    Taro.cloud.callFunction({
      name: 'destineChange',
      data: {
        id: id
      }
    }).then(res => {
      console.log(res);
      if (res.result.stats.updated !== 1) {
        return
      }
      destineBooksInfo[index].bookStatus = 2
      that.setState({
        destineBooksInfo: destineBooksInfo
      })
      Taro.hideLoading()
    }).catch(err => {
      console.log(err);
    })
  }

  render() {
    let booksInfo = this.state.booksInfo
    let destineBooksInfo = this.state.destineBooksInfo
    let isPutMore = this.state.isPutMore
    let isDestineMore = this.state.isDestineMore
    const DestineBooksList = destineBooksInfo.map((bookItem, index) => {
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
              {
                (bookItem.bookStatus === 1) &&
                <View onClick={this.destineChange.bind(this, bookItem._id, index)}>
                  已预订
                </View>
              }
              {
                (bookItem.bookStatus === 2) &&
                <View>
                  已完成
                </View>
              }
            </View>
          </View>
        </BookCard>
      )
    })
    const BooksList = booksInfo.map((bookItem, index) => {
      return (
        <BookCard onClose={this.closeBtnClick.bind(this, index)} key={bookItem._id} taroKey={index} bookInfo={bookItem}>
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
              <View>
                {bookItem.bookStatus ? '已预订' : '未预订'}
              </View>
            </View>
          </View>
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
          <AtTabs current={this.state.currentPage} tabList={this.state.tabList} onClick={this.handleClick.bind(this)}>
            <AtTabsPane current={this.state.currentPage} index={0} >
              <View>
                {BooksList}
                {(!booksInfo.length && !this.state.isLoad) && <View className='nothing-wrapper'>
                  您还没发布任何书籍
                </View>}
                {(!isPutMore && booksInfo.length) &&
                  <View className='over-down'>已经到底啦，亲╰(*´︶`*)╯</View>
                }
              </View>
            </AtTabsPane>
            <AtTabsPane current={this.state.currentPage} index={1}>
              <View>
                {DestineBooksList}
                {(!destineBooksInfo.length && !this.state.isLoad) && <View className='nothing-wrapper'>
                  您还没预订任何书籍
                </View>}
                {(!isDestineMore && destineBooksInfo.length) &&
                  <View className='over-down'>已经到底啦，亲╰(*´︶`*)╯</View>
                }
              </View>
            </AtTabsPane>
          </AtTabs>
        </View>
        <View className='model'>
          <SeModal cancelIsOpen onCancelModalHandle={this.onCancelModalHandle} content={this.state.modalContent} isOpened={this.state.isModalOpened} onConfirmModalHandle={this.onConfirmModalHandle}></SeModal>
        </View>
        <AtMessage />
      </View>
    )
  }
}
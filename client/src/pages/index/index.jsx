import { ERR_OK, LIMIT_COUNT, OPENID_STORAGE } from '@common/js/config';
import BookCard from '@components/book-card/index';
import SeModal from '@components/modal/index';
import { Button, ScrollView, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { Component } from 'react';
import { AtMessage, AtModal, AtModalAction, AtSearchBar } from 'taro-ui';

import styles from './index.module.scss';

export default class Index extends Component {
  constructor() {
    super();
    this.state = {
      isOpened: false,
      closeOnClickOverlay: false, //点击浮层的时候时候禁止关闭
      currentIndex: 0, // 分页获取时的页码
      booksInfo: [],
      isModalOpened: false,
      modalContent: '完成学生认证才可继续预订书籍',
      isCloseOpened: false,
      destineModalContent: '',
      isDestineModalOpened: false,
      currentId: '',
      currentBookIndex: 0,
      isMore: true,
      isLoading: true,
      currentTagIndex: 0,
      facultyItems: [
        '全部',
        '农学',
        '经管',
        '工程',
        '动科',
        '动医',
        '电信',
        '食品',
        '生命',
        '园艺',
        '资环',
        '水利',
        '文法',
        '理学院',
        '国际',
        '艺术',
      ],
    };
    this.db = Taro.cloud.database();
  }

  componentWillMount() {}

  componentDidMount() {
    this.isAuthorize();
  }

  componentWillUnmount() {}

  componentDidShow() {
    Taro.startPullDownRefresh().then(() => {
      setTimeout(() => {
        Taro.stopPullDownRefresh();
      }, 500);
    });
  }

  componentDidHide() {}

  // 下拉刷新
  onPullDownRefresh() {
    let that = this;
    let currentTagIndex = this.state.currentTagIndex;
    let facultyItem = this.state.facultyItems[currentTagIndex];
    this.setState(
      {
        currentIndex: 0,
        booksInfo: [],
        isMore: true,
        isLoading: true,
      },
      async () => {
        if (currentTagIndex === 0) {
          await that._getAllBooksInfo();
          Taro.stopPullDownRefresh();
          return;
        }
        await that._getFacultyBooksInfo(facultyItem);
        Taro.stopPullDownRefresh();
      },
    );
  }

  // 上拉加载
  onReachBottom() {
    let that = this;
    let currentIndex = this.state.currentIndex;
    let currentTagIndex = this.state.currentTagIndex;
    this.setState(
      {
        currentIndex: currentIndex + 1,
      },
      () => {
        console.log(currentIndex);
        if (currentTagIndex === 0) {
          that._getAllBooksInfo();
          return;
        }
        let facultyItem = this.state.facultyItems[currentTagIndex];
        that._getFacultyBooksInfo(facultyItem);
      },
    );
  }

  _getOpenId() {
    Taro.cloud
      .callFunction({
        name: 'login',
      })
      .then((res) => {
        Taro.setStorage({ key: OPENID_STORAGE, data: res.result.openid });
      });
  }

  // 分页获取所有书籍
  _getAllBooksInfo() {
    return new Promise((resolve) => {
      let currentIndex = this.state.currentIndex;
      let booksInfo = this.state.booksInfo;
      let that = this;
      this.db
        .collection('booksInfo')
        .where({
          bookStatus: 0,
        })
        .limit(LIMIT_COUNT)
        .skip(LIMIT_COUNT * currentIndex)
        .orderBy('putOutTime', 'desc')
        .get()
        .then((res) => {
          let newBooksInfo = booksInfo.concat(res.data);
          if (res.data.length < LIMIT_COUNT) {
            that.setState({
              isMore: false,
            });
          }
          that.setState({
            booksInfo: newBooksInfo,
            isLoading: false,
          });
          resolve({ code: ERR_OK });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  _getFacultyBooksInfo(faculty) {
    return new Promise((resolve, reject) => {
      let currentIndex = this.state.currentIndex;
      let booksInfo = this.state.booksInfo;
      let that = this;
      this.db
        .collection('booksInfo')
        .where({
          bookStatus: 0,
          faculty: faculty,
        })
        .limit(LIMIT_COUNT)
        .skip(LIMIT_COUNT * currentIndex)
        .orderBy('putOutTime', 'desc')
        .get()
        .then((res) => {
          let newBooksInfo = booksInfo.concat(res.data);
          if (res.data.length < LIMIT_COUNT) {
            that.setState({
              isMore: false,
            });
          }
          that.setState({
            booksInfo: newBooksInfo,
            isLoading: false,
          });
          resolve(res.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 检测是否完成学生认证
  _isAttest() {
    let that = this;
    return new Promise((resolve, reject) => {
      let openId = Taro.getStorageSync(OPENID_STORAGE);
      this.db
        .collection('userInfo')
        .where({
          // data 字段表示需新增的 JSON 数据
          _openid: openId,
        })
        .get()
        .then((res) => {
          if (!res.data[0].studentID) {
            that.setState({
              isModalOpened: true,
            });
            resolve(0);
            return;
          }
          resolve(1);
        })
        .catch(() => {
          Taro.atMessage({
            message: '网络出现问题，请稍后再试',
            type: 'error',
          });
          reject(0);
        });
    });
  }

  // 提交预订以前进行的书籍状态校验
  _isBookStatus(_id) {
    return new Promise((resolve) => {
      this.db
        .collection('booksInfo')
        .doc(_id)
        .get()
        .then((res) => {
          resolve(res.data.bookStatus);
        });
    });
  }

  // 授权后的操作
  getuserInfo(e) {
    this._getOpenId();
    let that = this;
    let userInfo = e.detail.userInfo;
    this.db
      .collection('userInfo')
      .add({
        // data 字段表示需新增的 JSON 数据
        data: userInfo,
      })
      .then(() => {
        Taro.showTabBar({ animation: true });
        that.setState({
          isOpened: false,
        });
      })
      .catch(() => {});
  }

  // 检测是否授权
  isAuthorize() {
    let that = this;
    Taro.getSetting({
      success(res) {
        let scopeUserInfo = res.authSetting['scope.userInfo'];
        let openId = Taro.getStorageSync(OPENID_STORAGE);
        if (scopeUserInfo && openId) {
          return;
        }
        Taro.hideTabBar({ animation: true });
        that.setState({
          isOpened: true,
        });
      },
    });
  }

  // 当未完成学生认证的时候会跳转页面完成学生认证
  modalHandle() {
    Taro.navigateTo({ url: '/pages/attest/attest' });
    this.setState({
      isModalOpened: false,
    });
  }

  // 点击预订按钮进行的操作
  async destineBook(_id, _openid, index) {
    let openId = Taro.getStorageSync(OPENID_STORAGE);
    if (openId === _openid) {
      Taro.atMessage({
        message: '不能预订自己的书籍',
        type: 'info',
      });
      return;
    }
    let ret_code = await this._isAttest();
    if (!ret_code) {
      return;
    }
    this.setState({
      destineModalContent: '预订后不能退订，确认预订嘛',
      isDestineModalOpened: true,
      currentId: _id,
      currentBookIndex: index,
    });
  }

  searchHandle() {
    Taro.navigateTo({ url: '/pages/search/search' });
  }

  async btnConfirmModalHandle() {
    Taro.showLoading({
      title: '加载中',
      mask: true,
    });
    let _id = this.state.currentId;
    let that = this;
    let currentBookIndex = this.state.currentBookIndex;
    let retStatus = await this._isBookStatus(_id);
    if (retStatus) {
      Taro.hideLoading();
      Taro.atMessage({
        message: '预订失败',
        type: 'info',
      });
      Taro.startPullDownRefresh().then(() => {
        setTimeout(() => {
          Taro.stopPullDownRefresh();
        }, 500);
      });
      return;
    }
    Taro.cloud
      .callFunction({
        name: 'destineBook',
        data: { _id: _id },
      })
      .then((res) => {
        console.log(res);
        Taro.hideLoading();
        Taro.atMessage({
          message: '预订成功',
          type: 'success',
        });
        let booksInfo = this.state.booksInfo;
        booksInfo.splice(currentBookIndex, 1);
        that.setState({
          isDestineModalOpened: false,
          booksInfo: booksInfo,
        });
      });
  }

  // 点击模态框的取消按钮
  btnCancelModalHandle() {
    this.setState({
      isDestineModalOpened: false,
    });
  }

  btnCancelHandle() {
    this.setState({
      isModalOpened: false,
    });
  }

  // 点击修改当前学院
  facultySelected(facultyItem, index) {
    let that = this;
    this.setState(
      {
        currentIndex: 0,
        booksInfo: [],
        isMore: true,
        isLoading: true,
        currentTagIndex: index,
      },
      () => {
        if (index === 0) {
          that._getAllBooksInfo();
          return;
        }
        that._getFacultyBooksInfo(facultyItem);
      },
    );
  }

  closeBtnClick() {}

  render() {
    let booksInfo = this.state.booksInfo;
    let isMore = this.state.isMore;
    let isLoading = this.state.isLoading;
    let facultyItems = this.state.facultyItems;
    let currentTagIndex = this.state.currentTagIndex;
    const BooksList = booksInfo.map((bookItem, index) => {
      return (
        <BookCard
          onClose={this.closeBtnClick.bind(this, index)}
          bookInfo={bookItem}
          isCloseOpened={this.state.isCloseOpened}
          key={bookItem._id}
          taroKey={index}>
          <View className={styles['info-des']}>
            <View className={styles['des-left']}>
              <View className={styles['info-percent']}>
                品相：{bookItem.percentStatus}
              </View>
              <View className={styles['info-price']}>
                <Text className={styles.price}>￥{bookItem.price}</Text>
                <Text className={styles['now-price']}>
                  ￥{bookItem.nowPrice}
                </Text>
              </View>
            </View>
            <View className={styles['des-right']}>
              <View
                onClick={this.destineBook.bind(
                  this,
                  bookItem._id,
                  bookItem._openid,
                  index,
                )}>
                预订
              </View>
            </View>
          </View>
        </BookCard>
      );
    });
    return (
      <View className={styles.index}>
        <View
          className={styles['search-container']}
          onClick={this.searchHandle}>
          <AtSearchBar value={this.state.value} disabled />
        </View>
        <ScrollView scrollX className={styles['faculty-wrapper']}>
          <View className={styles['search-faculty']}>
            {facultyItems.map((facultyItem, index) => {
              return (
                <View
                  onClick={this.facultySelected.bind(this, facultyItem, index)}
                  key={index}
                  className={
                    currentTagIndex === index
                      ? `${styles['faculty-item']} ${styles['faculty-item-active']}`
                      : styles['faculty-item']
                  }>
                  {facultyItem}
                </View>
              );
            })}
          </View>
        </ScrollView>
        <View className={styles['book-list']}>
          {BooksList}
          {isMore && (
            <View className={styles.loading}>
              <View
                className={`${styles['at-icon']} ${styles['at-icon-loading-2']}`}></View>
              <View>Learn More</View>
            </View>
          )}
          {!isMore && booksInfo.length && (
            <View className={styles['over-down']}>
              已经到底啦，亲╰(*´︶`*)╯
            </View>
          )}
          {!booksInfo.length && !isLoading && (
            <View className={styles['over-down']}>还没有人发布书籍！</View>
          )}
        </View>
        <AtModal
          isOpened={this.state.isOpened}
          closeOnClickOverlay={this.state.closeOnClickOverlay}>
          <View className={styles['model-content']}>
            欢迎你来到东农二手书买卖平台，请完成授权登录以体验完整功能
          </View>
          <AtModalAction>
            <Button
              open-type='getUserInfo'
              onGetUserInfo={this.getuserInfo.bind(this)}>
              确定
            </Button>
          </AtModalAction>
        </AtModal>
        <View className={styles.modal}>
          <SeModal
            cancelIsOpen
            content={this.state.modalContent}
            isOpened={this.state.isModalOpened}
            onConfirmModalHandle={this.modalHandle}
            onCancelModalHandle={this.btnCancelHandle}></SeModal>
        </View>
        <View className={styles.modal}>
          <SeModal
            cancelIsOpen
            content={this.state.destineModalContent}
            isOpened={this.state.isDestineModalOpened}
            onConfirmModalHandle={this.btnConfirmModalHandle}
            onCancelModalHandle={this.btnCancelModalHandle}></SeModal>
        </View>
        <AtMessage />
      </View>
    );
  }
}

import { LIMIT_COUNT, OPENID_STORAGE } from "@common/js/config.js";
import BookCard from "@components/book-card/index";
import SeModal from "@components/modal/index";
import { Input, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import React, { Component } from "react";
import { AtIcon, AtMessage } from "taro-ui";

import "./search.scss";

const db = Taro.cloud.database();

export default class Search extends Component {
  constructor() {
    super();
    this.state = {
      searchInfo: [],
      isMore: true,
      isLoading: true,
      searchValue: "",
      isModalOpened: false,
      modalContent: "完成学生认证才可继续预订书籍",
      isCloseOpened: false,
      destineModalContent: "",
      isDestineModalOpened: false,
      currentIndex: 0,
      currentId: "",
      currentBookIndex: 0,
      timer: null
    };
  }

  componentDidShow() {
    this._getSearchHistory();
  }

  // 上拉加载
  onReachBottom() {
    let that = this;
    let currentIndex = this.state.currentIndex;
    let searchValue = this.state.searchValue;
    this.setState(
      {
        currentIndex: currentIndex + 1
      },
      () => {
        that._getSearchInfo(searchValue);
      }
    );
  }

  // 检测是否完成学生认证
  _isAttest() {
    let that = this;
    return new Promise((resolve, reject) => {
      let openId = Taro.getStorageSync(OPENID_STORAGE);
      db.collection("userInfo")
        .where({
          // data 字段表示需新增的 JSON 数据
          _openid: openId
        })
        .get()
        .then(res => {
          if (!res.data[0].studentID) {
            that.setState({
              isModalOpened: true
            });
            resolve(0);
            return;
          }
          resolve(1);
        })
        .catch(() => {
          Taro.atMessage({
            message: "网络出现问题，请稍后再试",
            type: "error"
          });
          reject(0);
        });
    });
  }

  // 模糊获取搜索信息
  _getSearchInfo(value) {
    // JavaScript高级程序设计（第3版）
    let currentIndex = this.state.currentIndex;
    let searchTitle = new RegExp(".*" + value + ".*", "i");
    return db
      .collection("booksInfo")
      .where({
        title: searchTitle,
        bookStatus: 0
      })
      .orderBy("price", "asc")
      .limit(LIMIT_COUNT)
      .skip(LIMIT_COUNT * currentIndex)
      .get();
  }

  // 提交预订以前进行的书籍状态校验
  _isBookStatus(_id) {
    return new Promise(resolve => {
      db.collection("booksInfo")
        .doc(_id)
        .get()
        .then(res => {
          resolve(res.data.bookStatus);
        });
    });
  }

  // 点击预订按钮进行的操作
  async destineBook(_id, _openid, index) {
    let openId = Taro.getStorageSync(OPENID_STORAGE);
    if (openId === _openid) {
      Taro.atMessage({
        message: "不能预订自己的书籍",
        type: "info"
      });
      return;
    }
    let ret_code = await this._isAttest();
    if (!ret_code) {
      return;
    }
    this.setState({
      destineModalContent: "预订后不能退订，确认预订嘛",
      isDestineModalOpened: true,
      currentId: _id,
      currentBookIndex: index
    });
  }

  async btnConfirmModalHandle() {
    Taro.showLoading({
      title: "加载中",
      mask: true
    });
    let _id = this.state.currentId;
    let that = this;
    let currentBookIndex = this.state.currentBookIndex;
    let retStatus = await this._isBookStatus(_id);
    if (retStatus) {
      Taro.hideLoading();
      Taro.atMessage({
        message: "预订失败",
        type: "info"
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
        name: "destineBook",
        data: { _id: _id }
      })
      .then(res => {
        console.log(res);
        Taro.hideLoading();
        Taro.atMessage({
          message: "预订成功",
          type: "success"
        });
        let booksInfo = this.state.booksInfo;
        booksInfo.splice(currentBookIndex, 1);
        that.setState({
          isDestineModalOpened: false,
          booksInfo: booksInfo
        });
      });
  }

  // 点击模态框的取消按钮
  btnCancelModalHandle() {
    this.setState({
      isDestineModalOpened: false
    });
  }

  btnCancelHandle() {
    this.setState({
      isModalOpened: false
    });
  }

  // 点击输入框里面的close触发
  closeIcon() {
    this.setState({
      searchValue: "",
      searchInfo: []
    });
  }

  // 改变搜索输入框的值
  onSearchValueChange(e) {
    let value = e.detail.value;
    let timer = this.state.timer;
    let that = this;
    this.setState({
      searchValue: e.detail.value
    });
    if (!value) {
      this.setState({
        searchInfo: []
      });
      return;
    }
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      that._getSearchInfo(value).then(res => {
        that.setState({
          searchInfo: res.data
        });
      });
    }, 200);
  }

  // 当未完成学生认证的时候会跳转页面完成学生认证
  modalHandle() {
    Taro.navigateTo({ url: "/pages/attest/attest" });
    this.setState({
      isModalOpened: false
    });
  }

  // // 点击搜搜按钮后进行搜索
  // onSearchValueHandle() {
  //   let value = this.state.searchValue
  //   this._getSearchInfo(value).then(res => {
  //     console.log(res);
  //     this.setState({
  //       searchInfo: res.data
  //     })
  //   })
  //   this._setSearchHistory(value)
  // }

  // // 点击搜索item触发的方法
  // historyItem(value) {
  //   this.setState({
  //     searchValue: value
  //   })
  //   this._getSearchInfo(value).then(res => {
  //     console.log(res);
  //     this.setState({
  //       searchInfo: res.data
  //     })
  //   })
  // }

  // // 点击搜索item的close
  // historyItemClose(index, e) {
  //   e.stopPropagation()
  //   console.log(index);
  // }

  render() {
    let booksInfo = this.state.searchInfo;
    let isMore = this.state.isMore;
    let isLoading = this.state.isLoading;
    let searchValue = this.state.searchValue;
    const BooksList = booksInfo.map((bookItem, index) => {
      return (
        <BookCard
          onClose={this.closeBtnClick.bind(this, index)}
          isCloseOpened={this.state.isCloseOpened}
          key={bookItem._id}
          taroKey={index}
          bookInfo={bookItem}
        >
          <View className="info-des">
            <View className="des-left">
              <View className="info-percent">
                品相：{bookItem.percentStatus}
              </View>
              <View className="info-price">
                <Text className="price">￥{bookItem.price}</Text>
                <Text className="now-price">￥{bookItem.nowPrice}</Text>
              </View>
            </View>
            <View className="des-right">
              <View
                onClick={this.destineBook.bind(
                  this,
                  bookItem._id,
                  bookItem._openid,
                  index
                )}
              >
                预订
              </View>
            </View>
          </View>
        </BookCard>
      );
    });
    return (
      <View className="search">
        <View className="search-container">
          <View className="search-icon">
            <AtIcon value="search" size="18"></AtIcon>
          </View>
          <Input
            focus
            value={searchValue}
            placeholder="搜索书籍名称"
            className="search-input"
            onInput={this.onSearchValueChange}
          ></Input>
          {searchValue && (
            <View className="close-icon" onClick={this.closeIcon}>
              <AtIcon value="close" size="18"></AtIcon>
            </View>
          )}
        </View>
        {searchValue && (
          <View className="book-list">
            {BooksList}
            {!isMore && booksInfo.length && (
              <View className="over-down">已经到底啦，亲╰(*´︶`*)╯</View>
            )}
            {!booksInfo.length && (
              <View className="over-down">找不到相关书籍！</View>
            )}
          </View>
        )}
        <View className="modal">
          <SeModal
            cancelIsOpen
            content={this.state.destineModalContent}
            isOpened={this.state.isDestineModalOpened}
            onConfirmModalHandle={this.btnConfirmModalHandle}
            onCancelModalHandle={this.btnCancelModalHandle}
          ></SeModal>
        </View>
        <View className="modal">
          <SeModal
            cancelIsOpen
            content={this.state.modalContent}
            isOpened={this.state.isModalOpened}
            onConfirmModalHandle={this.modalHandle}
            onCancelModalHandle={this.btnCancelHandle}
          ></SeModal>
        </View>
        <AtMessage />
      </View>
    );
  }
}

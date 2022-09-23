import Taro from "@tarojs/taro";
import { View, Button } from "@tarojs/components";
import { AtModal, AtModalAction } from "taro-ui";
import React, { Component } from "react";

import "./index.weapp.scss";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      closeOnClickOverlay: false
    };
  }

  static defaultProps = {
    cancelIsOpen: false,
    btnCancelContent: "取消",
    btnConfirmContent: "确定"
  };

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  btnConfirmModalHandle() {
    this.props.onConfirmModalHandle();
  }

  btnCancelModalHandle() {
    this.props.onCancelModalHandle();
  }

  render() {
    return (
      <View className="index">
        <AtModal
          isOpened={this.props.isOpened}
          closeOnClickOverlay={this.state.closeOnClickOverlay}
        >
          <View className="model-content">{this.props.content}</View>
          <AtModalAction>
            {this.props.cancelIsOpen && (
              <Button onClick={this.btnCancelModalHandle}>
                {this.props.btnCancelContent}
              </Button>
            )}
            <Button onClick={this.btnConfirmModalHandle}>
              {this.props.btnConfirmContent}
            </Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}

// CustomButton.defaultProps = {
//   cancelIsOpen: false,
//   btnCancelContent: '取消'
// }

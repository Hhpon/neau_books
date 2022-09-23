import Taro from "@tarojs/taro";
import { View, Text, Input } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import React, { Component } from "react";

import "./index.weapp.scss";

export default class SeInput extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static defaultProps = {
    title: "",
    disabled: false,
    type: "text",
    placeholder: "",
    value: "",
    isError: false,
    isClick: false,
    maxlength: 30
  };

  changeInput(e) {
    this.props.onChangeInput(e);
  }

  clickInput(e) {
    let isClick = this.props.isClick;
    if (isClick) {
      this.props.onClickInput(e);
    }
  }

  blurInput(e) {
    this.props.onBlurInput(e);
  }

  render() {
    let isError = this.props.isError;
    return (
      <View className="se-input" onClick={this.clickInput}>
        <Text className={isError ? "is-error" : ""}>{this.props.title}</Text>
        <Input
          onBlur={this.blurInput}
          disabled={this.props.disabled}
          type={this.props.type}
          placeholder={this.props.placeholder}
          value={this.props.value}
          onInput={this.changeInput}
          maxlength={this.props.maxlength}
        ></Input>
        {isError && (
          <View className="alert-icon">
            <AtIcon value="alert-circle" size="16" color="#F00"></AtIcon>
          </View>
        )}
      </View>
    );
  }
}

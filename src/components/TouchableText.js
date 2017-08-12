import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
  button: {
    paddingLeft: 10,
    paddingRight:10,
    paddingTop:10,
    paddingBottom:10
  },
  buttonText: {
    color: '#027afe'
  },
});

export default class TouchableText extends Component {
  render () {
    let {onPress, children, buttonStyle=styles.button, textStyle=styles.buttonText} = this.props;
    return (
      <View>
        <TouchableHighlight
          underlayColor="transparent"
          style={buttonStyle}
          onPress={onPress}
        >
          <Text style={[styles.buttonText, textStyle]}>{children}</Text>
        </TouchableHighlight>
      </View>
    )
  }
}

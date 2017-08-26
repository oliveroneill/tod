import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} from 'react-native';
import PropTypes from 'prop-types';

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

class TouchableText extends Component {
  render () {
    let {onPress, children, buttonStyle=styles.button, textStyle=styles.buttonText} = this.props;
    return (
      <View>
        <TouchableHighlight
          underlayColor="transparent"
          activeOpacity={0.6}
          style={buttonStyle}
          onPress={onPress}
        >
          <Text style={[styles.buttonText, textStyle]}>{children}</Text>
        </TouchableHighlight>
      </View>
    )
  }
}

TouchableText.propTypes = {
  onPress: PropTypes.func.isRequired,
  children: PropTypes.string.isRequired,
  buttonStyle: View.propTypes.style,
  textStyle: Text.propTypes.style
}

TouchableText.defaultProps = {
  buttonStyle: styles.button,
  textStyle: styles.buttonText
}

export default TouchableText;
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  ActivityIndicator,
  Text,
  Button,
} from 'react-native';
import PropTypes from 'prop-types';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
const styles = StyleSheet.create({
  topOfScreen: {
    marginTop: STATUSBAR_HEIGHT + 60,
  },
})

/**
 * Shows loading spinner until the errored prop becomes true,
 * it then shows an error message and retry button
 */
class LoadingScreen extends Component {
  render() {
    let {errored, loadingMessage, errorMessage, retry} = this.props;
    if (errored) {
      // error screen
      return (
        <View>
          <View style={
            [
              styles.topOfScreen,
              {paddingLeft:10, flexDirection: 'row', justifyContent:'center'}
            ]
          }>
            <Text>{errorMessage}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent:'center'}}>
            <Button
              onPress={retry}
              title="Try again"
            />
          </View>
        </View>
      )
    }

    // loading screen
    return (
      <View>
        <ActivityIndicator
          animating={true}
          style={{height: 80}}
          size="large"
        />
        <View style={{flexDirection: 'row', justifyContent:'center'}}>
          <Text>{loadingMessage}</Text>
        </View>
      </View>
    )
  }
}

LoadingScreen.propTypes = {
  errored: PropTypes.bool,
  loadingMessage: PropTypes.string,
  errorMessage: PropTypes.string,
  retry: PropTypes.func
}

LoadingScreen.defaultProps = {
  errored: false,
  loadingMessage: "Loading...",
  errorMessage: "Something went wrong."
}

export default LoadingScreen;
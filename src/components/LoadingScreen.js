import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  ActivityIndicator,
  Text,
  Button,
} from 'react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
const styles = StyleSheet.create({
  topOfScreen: {
    marginTop: STATUSBAR_HEIGHT + 60,
  },
})

class LoadingScreen extends Component {
  render() {
    let {errored, loadingMessage, errorMessage, retry} = this.props;
    return (
      <View>
        {errored ?
          <View>
            <View style={[styles.topOfScreen, {paddingLeft:10, flexDirection: 'row', justifyContent:'center'}]}>
              <Text>{errorMessage}</Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent:'center'}}>
              <Button
                onPress={retry}
                title="Try again"
              />
            </View>
          </View>
        :
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
        }
      </View>
    )
  }
}

export default LoadingScreen;
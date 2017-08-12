import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  DatePickerIOS,
  Picker,
  Animated,
  TouchableHighlight,
} from 'react-native';

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var PickerItem = Picker.Item;

const styles = StyleSheet.create({
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderBottomColor: '#e2e2e2',
    borderBottomWidth:1,
    backgroundColor: '#ffffff'
  },
  closeButtonContainerBordered: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopColor: '#e2e2e2',
    borderTopWidth: 1,
    borderBottomColor: '#e2e2e2',
    borderBottomWidth:1
  },
  closeButton: {
    paddingLeft: 10,
    paddingRight:10,
    paddingTop:10,
    paddingBottom:10
  },
  closeButtonText: {
    color: '#027afe'
  },
  modalDatePicker: {
    position:'absolute',
    bottom: -1,
    right:-1,
    width:deviceWidth,
    backgroundColor:'#FFFFFF'
  },
});
class AnimatedPicker extends Component {
  componentDidMount() {
     Animated.timing(this.props.offSet, {
        duration: 300,
        toValue: 50
      }).start()
  }

  closeModal() {
   Animated.timing(this.props.offSet, {
        duration: 300,
        toValue: deviceHeight
      }).start(this.props.closeModal);
  }

  render() {
    return (
      <Animated.View
        style={[{transform: [{translateY: this.props.offSet}]}, styles.modalDatePicker]}
      >
          <View style={styles.closeButtonContainerBordered}>
            <TouchableHighlight onPress={ this.closeModal.bind(this) } underlayColor="transparent" style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableHighlight>
          </View>
          {this.props.type === "date" ?
            <DatePickerIOS
              date={this.props.currentOption}
              minimumDate={this.props.minDate}
              maximumDate={this.props.maxDate}
              mode="datetime"
              onDateChange={(date) => this.props.changeOption(date)}
            />
          :
            <Picker
              selectedValue={this.props.currentOption}
              onValueChange={(option) => this.props.changeOption(option)}>
              {Array.isArray(this.props.options) ?
                this.props.options.map((option) => (
                  <PickerItem
                    key={option}
                    value={option}
                    label={option}
                  />
                ))
                :
                Object.keys(this.props.options).map((key) => (
                  <PickerItem
                    key={key}
                    value={key}
                    label={this.props.options[key]}
                  />
                ))
              }
            </Picker>
          }
      </Animated.View>
    )
  }
}

export default AnimatedPicker;

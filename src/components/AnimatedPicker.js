import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  DatePickerIOS,
  Picker,
  TouchableHighlight,
  Platform,
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Modal from 'react-native-modal';
import PropTypes from 'prop-types';

import TouchableText from './TouchableText.js';

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var PickerItem = Picker.Item;

const styles = StyleSheet.create({
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopColor: '#e2e2e2',
    borderTopWidth: 1,
    borderBottomWidth:1,
    borderBottomColor: '#e2e2e2',
    backgroundColor: '#ffffff'
  }
});

/**
 * AnimatedPicker can display a set of option choice or date options
 * Use the type prop to specify either "date" or "options"
 * The options param can be an Object of key values or an array
 */
class AnimatedPicker extends Component {
  render() {
    var defaultDate = new Date();
    let usingAndroid = Platform.OS === 'android';
    let isDatePicker = this.props.type === "date";
    let isVisible = this.props.isVisible;
    // check if we need to show specific Android date picker
    let usingAndroidDatePicker = usingAndroid && isDatePicker && isVisible;
    if (isDatePicker)
      defaultDate = this.props.currentOption;
    return (
      <View>
        <DateTimePicker
          isVisible={usingAndroidDatePicker}
          onConfirm={(date) => {this.props.onOptionChange(date); this.props.onClose();}}
          onCancel={this.props.onClose}
          mode='datetime'
          date={defaultDate}
          minimumDate={this.props.minDate}
          maximumDate={this.props.maxDate}
        />
        <Modal
          isVisible={isVisible && !usingAndroidDatePicker}
          style={{justifyContent:'flex-end', margin:0}}
          backdropOpacity={0}
        >
          <View style={styles.closeButtonContainer}>
            <TouchableText
              onPress={this.props.onClose}
            >
              Done
            </TouchableText>
          </View>
          {isDatePicker ?
            <DatePickerIOS
              date={this.props.currentOption}
              minimumDate={this.props.minDate}
              maximumDate={this.props.maxDate}
              mode="datetime"
              onDateChange={this.props.onOptionChange}
              style={{'backgroundColor': '#ffffff'}}
            />
          :
            <Picker
              style={{backgroundColor:'#ffffff'}}
              selectedValue={this.props.currentOption}
              onValueChange={this.props.onOptionChange}>
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
        </Modal>
      </View>
    )
  }
}

AnimatedPicker.propTypes = {
  type: PropTypes.string.isRequired,
  currentOption: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date)
  ]),
  onClose: PropTypes.func.isRequired,
  onOptionChange: PropTypes.func.isRequired,
  options: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  isVisible: PropTypes.bool.isRequired,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date)
}

export default AnimatedPicker;

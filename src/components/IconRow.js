import React, { Component } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import { Icon } from 'react-native-elements'
import PropTypes from 'prop-types';

/**
 * Displays a list of icons in a row
 */
class IconRow extends Component {
  render() {
    return (
      <View style={{flexDirection: 'row', justifyContent:'center'}}>
        {
          this.props.options.map((l, i) => (
            <Icon
              raised
              iconStyle={this.props.current === i ? styles.iconEnabled : styles.icon}
              key={i}
              name={l.icon}
              underlayColor='#e1e1e1'
              onPress={() => this.props.onPress(i)}
              size={30} />
          ))
        }
      </View>
    )
  }
}

IconRow.propTypes = {
  options: PropTypes.array.isRequired,
  current: PropTypes.number.isRequired,
  onPress: PropTypes.func
}

const styles = StyleSheet.create({
  icon: {
    color: '#bdc6cf',
  },
  iconEnabled: {
    color: '#00aced',
  }
});

export default IconRow;
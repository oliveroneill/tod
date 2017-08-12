import React, { Component } from 'react';
import {
  View,
  Modal,
  Dimensions,
} from 'react-native';

import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

import TouchableText from '../components/TouchableText.js';
import styles from '../style/Styles.js'

const {height, width} = Dimensions.get('window');

export default class GoogleMapsPopup extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Enter Destination',
    }
  }
  render () {
    let { params } = this.props.navigation.state;
    let { goBack } = this.props.navigation;
    return (
        <GooglePlacesAutocomplete
          placeholder='Destination'
          placeholderTextColor='#86939e'
          minLength={1}
          autoFocus={true}
          fetchDetails={true}
          query={{
            key: 'AIzaSyC2Og8_dCnQ_iDioA-O6AjhvxWQDx0Vw2g',
            language: 'en',
          }}
          getDefaultValue={() => {
            return params.destinationName;
          }}
          onPress={(data, details = null) => {
            let lat = details.geometry.location.lat;
            let lng = details.geometry.location.lng;
            params.onPress(details.name, lat, lng);
            goBack();
          }}
          styles={{
            textInputContainer: styles.searchBarContainer,
            textInput: styles.searchBarInput,
            listView: {
              backgroundColor:'#ffffff',
            },
          }}
          currentLocation={false}
        />
    )
  }
}
import React, { Component } from 'react';
import {
  View,
  Alert,
  Button,
  Keyboard,
} from 'react-native';
import PropTypes from 'prop-types';
import { Icon } from 'react-native-elements'

import styles from '../style/Styles.js'
import SearchComponent from '../components/SearchComponent.js';
import APIComponent from '../components/APIComponent.js';
import TodAPI from '../utils/TodAPI.js';

class SearchScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams, navigate} = navigation;
    const params = state.params || {};
    const api = params.api;
    const loggedIn = params.loggedIn || false;
    // show a button unless we're not logged in yet
    return {
      title: 'tod',
      headerBackTitle:'Back',
      headerRight: (
        <View>
          { loggedIn ?
            <Icon
              style={styles.navigationHeaderItem}
              name='notifications-none'
              color='#2f93fe'
              activeOpacity={0.6}
              underlayColor="transparent"
              onPress={() => navigate('ManageAlerts', {api: api})}
            />
            :
            null
          }
        </View>
      ),
    };
  };
  state = {};
  constructor(props) {
    super(props);
    this.api = new TodAPI();
    // bind functions
    this.onNotification = this.onNotification.bind(this);
    this.initialise = this.initialise.bind(this);
    this.setCurrentLocation = this.setCurrentLocation.bind(this);
  }

  onNotification(notification) {
    if (notification.alert !== undefined)
      alert(notification.alert);
    else
      alert(notification.notification.body);
  }

  initialise() {
    const { setParams, state } = this.props.navigation;
    // attach the api object to the navigator so that it's used across
    // each screen
    setParams({api: this.api});
  }

  setCurrentLocation(lat, lng) {
    this.setState({currentLocation: {lat: lat, lng: lng}});
    const { setParams } = this.props.navigation;
    // once we've got location we are done with the login process
    setParams({loggedIn: true});
  }

  componentWillMount() {
    // log in and find location
    this.initialise();
  }

  render() {
    const { navigate, setParams } = this.props.navigation;
    if (this.state.currentLocation === undefined) {
      return (
        <View style={styles.screen}>
          <APIComponent
            api={this.api}
            onNotification={this.onNotification}
            onLocation={this.setCurrentLocation}
          />
        </View>
      );
    }
    return (
      <View style={styles.screen}>
        <SearchComponent
          api={this.api}
          currentLocation={this.state.currentLocation}
          navigation={this.props.navigation}
        />
      </View>
    );
  }
}

SearchScreen.propTypes = {
  navigation: PropTypes.object.isRequired
}

export default SearchScreen;

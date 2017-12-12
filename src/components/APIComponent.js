import React, { Component } from 'react';
import {
  View,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';

import LoadingScreen from '../components/LoadingScreen.js';
import TodAPI from '../utils/TodAPI.js';

class APIComponent extends Component {
  state={
    errored: false
  };
  constructor(props) {
    super(props);
    // bind functions
    this.initialise = this.initialise.bind(this);
    this.setupCurrentLocation = this.setupCurrentLocation.bind(this);
  }

  initialise() {
    this.setState({'errored': false});
    let { api, onNotification } = this.props;
    api.setup(
      this.setupCurrentLocation,
      onNotification,
      function(){
        this.setState({'errored': true})
      }.bind(this)
    );
  }

  setupCurrentLocation() {
    let { onLocation } = this.props;
    navigator.geolocation.getCurrentPosition(
      function(origin) {
        let lat = origin.coords.latitude;
        let lng = origin.coords.longitude;
        onLocation(lat, lng);
      }.bind(this),
      function(error){
        Alert.alert("Please enable location and try again");
        this.setState({'errored': true})
      }.bind(this),
      {enableHighAccuracy: false}
    );
  }

  componentWillMount() {
    this.initialise();
  }

  render() {
    return (
      <LoadingScreen
        errored={this.state.errored}
        loadingMessage="Logging in..."
        errorMessage="Unfortunately we couldn't log you in. Please ensure you have an internet connection."
        retry={this.initialise}
      />
    )
  }
}

APIComponent.propTypes = {
  api: PropTypes.instanceOf(TodAPI).isRequired,
  onNotification: PropTypes.func.isRequired,
  onLocation: PropTypes.func.isRequired,
}

export default APIComponent;
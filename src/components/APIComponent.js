import React, { Component } from 'react';
import {
  View
} from 'react-native';
import PropTypes from 'prop-types';

import LoadingScreen from '../components/LoadingScreen.js';
import TtgApi from '../utils/TtgApi.js';

class APIComponent extends Component {
  state={
    errored: false,
    loading: true
  }

  initialise() {
    this.setState({'errored': false});
    this.setState({'loading': true});
    let { api, onNotification } = this.props;
    api.setup(function(){
      // get current location
      this.setupCurrentLocation();
    }.bind(this),
    onNotification,
    function(){
      this.setState({'errored': true})
    }.bind(this));
  }

  setupCurrentLocation() {
    let { onComplete } = this.props;
    navigator.geolocation.getCurrentPosition(
      function(origin) {
        let lat = origin.coords.latitude;
        let lng = origin.coords.longitude;
        this.setState({'loading': false});
        onComplete(lat, lng);
      }.bind(this),
      function(error){
        alert("Please enable location and try again");
        this.setState({'errored': true})
      }.bind(this),
      {enableHighAccuracy: true}
    );
  }

  componentWillMount() {
    this.initialise();
  }

  render() {
    let {children} = this.props;
    if (this.state.loading) {
      return (
        <LoadingScreen
          errored={this.state.errored}
          loadingMessage="Logging in..."
          errorMessage="Unfortunately we couldn't log you in. Please ensure you have an internet connection."
          retry={this.initialise.bind(this)}
        />
      )
    }
    return children;
  }
}

APIComponent.propTypes = {
  api: PropTypes.instanceOf(TtgApi).isRequired,
  onNotification: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
}

export default APIComponent;
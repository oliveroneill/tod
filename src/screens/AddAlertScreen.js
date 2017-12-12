import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Button,
  Alert
} from 'react-native';
import { List, ListItem } from 'react-native-elements'
import PropTypes from 'prop-types';

import TodAPI from '../utils/TodAPI.js';
import LoadingScreen from '../components/LoadingScreen.js';
import TouchableText from '../components/TouchableText.js';
import styles from '../style/Styles.js'

const list = [
  "Every Monday",
  "Every Tuesday",
  "Every Wednesday",
  "Every Thursday",
  "Every Friday",
  "Every Saturday",
  "Every Sunday"
];

class AddAlertScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams, navigate} = navigation;
    const params = state.params || {};
    const scheduleTrip = params.scheduleTrip || function(){};
    return {
      title: 'Schedule Trip',
      headerRight: (
        <TouchableText
          style={styles.navigationHeaderItem}
          onPress={scheduleTrip}
        >Set Alert</TouchableText>
      ),
    };
  };
  state = {
    loading: false,
    enabled: list.map(function(){return false;}),
  };
  constructor(props) {
    super(props);
    // bind functions
    this.onDayPressed = this.onDayPressed.bind(this);
    this.scheduleTrip = this.scheduleTrip.bind(this);
  }
  onDayPressed(i) {
    this.state.enabled[i]=!this.state.enabled[i];
    this.setState({enabled:this.state.enabled});
  }
  scheduleTrip() {
    let params = this.props.navigation.state.params;
    let {
      route,
      transport,
      inputArrival,
      inputArrivalDateString,
      origin,
      dest,
      waitingWindowMs,
      timezoneLocation
    } = params;
    this.setState({loading: true})
    this.api.scheduleTrip(
      origin, dest, route, transport, inputArrival,
      inputArrivalDateString, waitingWindowMs, timezoneLocation,
      this.state.enabled
    )
    .then(function() {
      Alert.alert("Trip successfully scheduled!");
      this.setState({loading:false});
      this.props.navigation.goBack();
    }.bind(this))
    .catch(function() {
      this.setState({loading:false});
      Alert.alert("Something went wrong. Please try again later");
    }.bind(this));
  }
  componentWillMount() {
    this.api = this.props.navigation.state.params.api;
    const { setParams } = this.props.navigation;
    setParams({scheduleTrip: this.scheduleTrip})
  }
  render() {
    let {route, transportIcon, subtitle} = this.props.navigation.state.params;
    return (
      <View style={styles.screen}>
        { this.state.loading ?
          <LoadingScreen
            loadingMessage="Scheduling Trip"
          />
        :
          <View style={styles.container}>
            <List containerStyle={{marginBottom: 20}}>
              <ListItem
                hideChevron={true}
                title={route.name}
                leftIcon={{name:transportIcon}}
                subtitle={subtitle}
                subtitleNumberOfLines={3}
              />
            </List>
            <Text style={{paddingLeft:10, fontSize:15, fontWeight:'bold'}}>Repeat:</Text>
            <List
              containerStyle={{marginBottom: 20}}>
              {
                list.map((l, i) => (
                  <ListItem
                    hideChevron={!this.state.enabled[i]}
                    rightIcon={{name:'done', style:{fontSize:19, color:'#027afe'}}}
                    key={i}
                    title={l}
                    onPress={() => this.onDayPressed(i)}
                    underlayColor='#e1e1e1'
                  />
                ))
              }
            </List>
          </View>
        }
      </View>
    )
  }
}

AddAlertScreen.propTypes = {
  navigation: PropTypes.object.isRequired
}

export default AddAlertScreen;

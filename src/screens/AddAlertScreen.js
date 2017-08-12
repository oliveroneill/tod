import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Button,
} from 'react-native';
import { List, ListItem } from 'react-native-elements'

import TtgApi from '../utils/TtgApi.js';
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
]

class AddAlertScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams, navigate} = navigation;
    const params = state.params || {};
    const scheduleTrip = params.scheduleTrip || function(){};
    return {
      title: 'Schedule Trip',
      headerRight: (
        <Button
          title={"Set Alert"}
          onPress={scheduleTrip}
        />
      ),
    };
  };
  state = {
    loading: false,
    enabled: list.map(function(){return false;}),
  };
  onDayPressed(i) {
    this.state.enabled[i]=!this.state.enabled[i];
    this.setState({enabled:this.state.enabled});
  }
  scheduleTrip() {
    let params = this.props.navigation.state.params;
    let route = params.route;
    let transport = params.transport;
    let inputArrival = params.inputArrival;
    let inputArrivalString = params.inputArrivalDateString;
    let origin = params.origin;
    let dest = params.dest;
    let waitingWindow = params.waitingWindow;
    let repeats = this.state.enabled;
    this.setState({loading: true})
    this.api.scheduleTrip(
      origin, dest, route, transport, inputArrival, inputArrivalString, waitingWindow, repeats
    )
    .then(function() {
      alert("Success!");
      this.setState({loading:false});
      this.props.navigation.goBack();
    }.bind(this))
    .catch(function() {
      this.setState({loading:false});
      alert("Something went wrong. Please try again later");
    }.bind(this));
  }
  componentWillMount() {
    this.api = this.props.navigation.state.params.api;
    const { setParams } = this.props.navigation;
    setParams({scheduleTrip: this.scheduleTrip.bind(this)})
  }
  render() {
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
                title={this.props.navigation.state.params.route.name}
                leftIcon={{name:this.props.navigation.state.params.transportIcon}}
                subtitle={this.props.navigation.state.params.subtitle}
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

export default AddAlertScreen;

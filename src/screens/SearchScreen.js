import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  TouchableHighlight,
  TextInput,
  ListView,
  ListViewDataSource,
  Platform,
  Alert,
  Button,
  Keyboard,
} from 'react-native';
import moment from 'moment-timezone';
import { List, ListItem, Icon } from 'react-native-elements'
import PropTypes from 'prop-types';

import styles from '../style/Styles.js'
import IconRow from '../components/IconRow.js';
import TouchableText from '../components/TouchableText.js';
import AnimatedPicker from '../components/AnimatedPicker.js';
import APIComponent from '../components/APIComponent.js';
import TtgApi from '../utils/TtgApi.js';
import Utils from '../utils/Utils.js'

var deviceHeight = Dimensions.get('window').height;
const transportModes = Utils.getTransportModes();

var waitingOptions = Utils.generateWaitingWindows();

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class SearchScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams, navigate} = navigation;
    const params = state.params || {};
    const api = params.api;
    const loggedIn = params.loggedIn || false;
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
            <View></View>
          }
        </View>
      ),
    };
  };
  state = {
    date: new Date(),
    waitingWindow: 5,
    transportIndex: 0,
    routeName: "",
    // destination
    destination: {
      name:""
    },
    modal: false,
    pickerType: "options",
    options: [],
    onOptionChange: function(){},
    currentValue: null,
    routes: [],
    ds: ds
  };

  setDate(date) {
    this.setState({
      date: date,
      currentValue: date
    }, this.getRoutes.bind(this))
  }

  setRouteName(route) {
    this.setState({
      routeName: route
    }, this.getRoutes.bind(this))
  }

  parseDate(date) {
    let input = moment(date);
    if (moment().isoWeek() == input.isoWeek()) {
      return input.format("dddd h:mma");
    }
    return input.format("ddd MMMM Do h:mma");
  }

  setTransport(option) {
    this.setState({
      transportIndex:option,
    }, this.getRoutes.bind(this))
  }

  setWaitingWindow(option) {
    this.setState({
      waitingWindow:parseInt(option),
      currentValue:option
    }, this.getRoutes.bind(this))
  }

  setDestination(name, lat, lng) {
    this.setState({
      destination: {
        lat: lat,
        lng: lng,
        name: name
      }
    }, this.getRoutes.bind(this))
  }

  setRoutes(routes) {
    this.setState({
      routes:routes,
      ds: this.state.ds.cloneWithRows(routes)
    })
  }

  getRoutes() {
    if (this.state.destination.lat === undefined) return;
    this.setState({status: "Loading"});
    let origin = {lat:this.lat,lng:this.lng};
    let dest = this.state.destination;
    let arrival = Math.ceil(this.state.date.valueOf());
    let transport = transportModes[this.state.transportIndex].name;
    this.api.getRoutes(origin, dest, transport, arrival, this.state.routeName)
    .then((routes) => {
      this.setState({status: undefined});
      this.setRoutes(routes);
    })
    .catch((error) => {
      this.setState({status: "Something went wrong"});
    });
  }

  openInMaps() {
    Utils.openInMaps(moment(this.state.date),
      transportModes[this.state.transportIndex].name,
      {lat:this.lat, lng:this.lng},
      this.state.destination
    );
  }

  renderCell(rowData, sectionID) {
    const { navigate } = this.props.navigation;
    let arrival = moment.unix(rowData.arrival_time / 1000).format('h:mm a');
    let waitingWindowMs = this.state.waitingWindow * 60 * 1000;
    // subtract the waiting window
    let departure_ts = rowData.departure_time - waitingWindowMs;
    let departure = moment.unix(departure_ts / 1000).format('h:mm a');
    let description = rowData.description;
    if (description.length > 0) {
      description += " - ";
    }
    let subtitle = description+"Alert at "+departure+" and arrive at "+arrival;
    let dateString = moment(this.state.date).tz(moment.tz.guess()).format("YYYY-MM-DDTHH:mm:ssZ z");
    let props = {
      origin: {lat:this.lat, lng:this.lng},
      dest: this.state.destination,
      route:rowData,
      inputArrival:Math.ceil(this.state.date.valueOf()),
      inputArrivalDateString:dateString,
      departure:departure_ts,
      subtitle:subtitle,
      transportIcon:transportModes[this.state.transportIndex].icon,
      transport:transportModes[this.state.transportIndex].name,
      waitingWindowMs: waitingWindowMs,
      api: this.api,
    };
    return (
      <ListItem
        key={sectionID}
        title={rowData.name}
        subtitle={subtitle}
        underlayColor='#e1e1e1'
        onPress={() => {navigate('AddAlert', props)}}
        subtitleNumberOfLines={3}
      />
    );
  }

  onNotification(notification) {
    if (notification.alert !== undefined)
      alert(notification.alert);
    else
      alert(notification.notification.body);
  }

  initialise() {
    const { setParams, state } = this.props.navigation;
    this.api = new TtgApi();
    setParams({api: this.api});
    // set the previous destination if we've just navigated to this page
    let params = state.params || {};
    if (params.name !== undefined) {
      this.setDestination(params.name, params.lat, params.lng);
    }
  }

  setCurrentLocation(lat, lng) {
    this.lat = lat;
    this.lng = lng;
    const { setParams } = this.props.navigation;
    setParams({loggedIn: true});
  }

  componentWillMount() {
    this.initialise();
  }

  render() {
    const { navigate, setParams } = this.props.navigation;
    return (
      <View style={styles.screen}>
        <APIComponent
          api={this.api}
          onNotification={this.onNotification}
          onComplete={this.setCurrentLocation.bind(this)}
        >
          <View style={styles.container}>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchBarInput}
                underlineColorAndroid='transparent'
                placeholder='Destination'
                placeholderTextColor='#86939e'
                onFocus={function() {
                  Keyboard.dismiss();
                  navigate('SearchLocation', {
                    destinationName: this.state.destination.name,
                    onPress:this.setDestination.bind(this)
                  })
                }.bind(this)}
                value={this.state.destination.name}
              />
            </View>
            <IconRow
              options={transportModes}
              current={this.state.transportIndex}
              onPress={this.setTransport.bind(this)}
            />
            <View style={{flexDirection: 'row', justifyContent:'center'}}>
              <TouchableHighlight
                style={styles.inputOptions}
                underlayColor="transparent"
                activeOpacity={0.6}
                onPress={ () => this.setState({
                  modal: true,
                  pickerType:"date",
                  currentValue: this.state.date,
                  onOptionChange:this.setDate.bind(this)})
                }
              >
                <Text style={{fontSize: 13, textAlign:'center'}}>
                  Arrive at: {this.parseDate(this.state.date)}
                </Text>
              </TouchableHighlight>
              <Text style={styles.inputOptions}>|</Text>
              <TouchableHighlight
                style={styles.inputOptions}
                underlayColor="transparent"
                activeOpacity={0.6}
                onPress={ () => this.setState({
                  modal: true,
                  pickerType:"options",
                  options: waitingOptions,
                  currentValue: this.state.waitingWindow+"",
                  onOptionChange:this.setWaitingWindow.bind(this)})
                }
              >
                <Text style={{fontSize: 13}}>
                  Waiting Window: {waitingOptions[this.state.waitingWindow]}
                </Text>
              </TouchableHighlight>
            </View>
            {this.state.status ?
              <Text style={{paddingLeft: 10}}>Routes ({this.state.status}):</Text>
            :
              <Text style={{paddingLeft: 10}}>Routes:</Text>
            }
            <List>
              <ListView
                enableEmptySections
                renderRow={this.renderCell.bind(this)}
                dataSource={this.state.ds}
              />
            </List>
            <Button
              onPress={this.openInMaps.bind(this)}
              title="View In Google Maps"
            />
            <AnimatedPicker
              isVisible={this.state.modal}
              onClose={() => this.setState({ modal: false })}
              onOptionChange={this.state.onOptionChange}
              options={this.state.options}
              currentOption={this.state.currentValue}
              type={this.state.pickerType}
              minDate={new Date()}
              maxDate={moment().add(3, 'months').toDate()}
            />
          </View>
        </APIComponent>
      </View>
    )
  }
}

SearchScreen.propTypes = {
  navigation: PropTypes.object.isRequired
}

export default SearchScreen;

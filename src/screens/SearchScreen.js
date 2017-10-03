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
import TodAPI from '../utils/TodAPI.js';
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
  state = {
    // query input
    date: new Date(),
    waitingWindow: 5,
    transportIndex: 0,
    routeName: "",
    destination: {
      name:""
    },
    // search results
    routes: [],
    ds: ds,
    // modal picker info
    modal: false,
    pickerType: "options",
    options: [],
    onOptionChange: function(){},
    currentValue: null
  };
  constructor(props) {
    super(props);
    // bind functions
    this.getRoutes = this.getRoutes.bind(this);
    this.setDate = this.setDate.bind(this);
    this.setRouteName = this.setRouteName.bind(this);
    this.parseDate = this.parseDate.bind(this);
    this.setTransport = this.setTransport.bind(this);
    this.setWaitingWindow = this.setWaitingWindow.bind(this);
    this.setDestination = this.setDestination.bind(this);
    this.setRoutes = this.setRoutes.bind(this);
    this.getRoutes = this.getRoutes.bind(this);
    this.openInMaps = this.openInMaps.bind(this);
    this.renderCell = this.renderCell.bind(this);
    this.onNotification = this.onNotification.bind(this);
    this.initialise = this.initialise.bind(this);
    this.setCurrentLocation = this.setCurrentLocation.bind(this);
  }
  setDate(date) {
    this.setState({
      date: date,
      currentValue: date
    }, this.getRoutes)
  }

  setRouteName(route) {
    this.setState({
      routeName: route
    }, this.getRoutes)
  }

  parseDate(date) {
    let input = moment(date);
    if (moment().isoWeek() == input.isoWeek()) {
      return input.format("dddd h:mma");
    }
    return input.format("ddd MMM Do h:mma");
  }

  setTransport(option) {
    this.setState({
      transportIndex:option,
    }, this.getRoutes)
  }

  setWaitingWindow(option) {
    this.setState({
      waitingWindow:parseInt(option),
      currentValue:option
    }, this.getRoutes)
  }

  setDestination(name, lat, lng) {
    this.setState({
      destination: {
        lat: lat,
        lng: lng,
        name: name
      }
    }, this.getRoutes)
  }

  setRoutes(routes) {
    this.setState({
      routes:routes,
      ds: this.state.ds.cloneWithRows(routes)
    })
  }

  getRoutes() {
    // cancel search if no destination is entered yet
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

  /**
   * Opens the current search in Google Maps
   */
  openInMaps() {
    Utils.openInMaps(moment(this.state.date),
      transportModes[this.state.transportIndex].name,
      {lat:this.lat, lng:this.lng},
      this.state.destination
    );
  }

  /**
   * Render a search result
   */
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
    let tzLocation = moment.tz.guess();
    let dateString = moment(this.state.date).tz(tzLocation).format("YYYY-MM-DDTHH:mm:ssZ z");
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
      timezoneLocation: tzLocation,
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
    this.api = new TodAPI();
    // attach the api object to the navigator so that it's used across
    // each screen
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
    // once we've got location we are done with the login process
    setParams({loggedIn: true});
  }

  componentWillMount() {
    // log in and find location
    this.initialise();
  }

  render() {
    const { navigate, setParams } = this.props.navigation;
    return (
      <View style={styles.screen}>
        <APIComponent
          api={this.api}
          onNotification={this.onNotification}
          onComplete={this.setCurrentLocation}
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
                    onPress:this.setDestination
                  })
                }.bind(this)}
                value={this.state.destination.name}
              />
            </View>
            <IconRow
              options={transportModes}
              current={this.state.transportIndex}
              onPress={this.setTransport}
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
                  onOptionChange:this.setDate})
                }
              >
                <Text style={{fontSize: 11, textAlign:'center'}}>
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
                  onOptionChange:this.setWaitingWindow})
                }
              >
                <Text style={{fontSize: 11}}>
                  Alert {waitingOptions[this.state.waitingWindow]} before
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
                renderRow={this.renderCell}
                dataSource={this.state.ds}
              />
            </List>
            <Button
              onPress={this.openInMaps}
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

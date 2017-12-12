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
import { List, ListItem } from 'react-native-elements'
import PropTypes from 'prop-types';

import styles from '../style/Styles.js'
import IconRow from '../components/IconRow.js';
import TouchableText from '../components/TouchableText.js';
import AnimatedPicker from '../components/AnimatedPicker.js';
import Utils from '../utils/Utils.js'

const ARRIVAL_TIME_MS_FROM_NOW = 30 * 60 * 1000;
const TRANSPORT_MODES = Utils.getTransportModes();
const WAITING_OPTIONS = Utils.generateWaitingWindows();

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class SearchComponent extends Component {
  state = {
    // query input
    date: new Date(Date.now() + ARRIVAL_TIME_MS_FROM_NOW),
    waitingWindow: 5,
    transportIndex: 0,
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
    this.parseDate = this.parseDate.bind(this);
    this.setTransport = this.setTransport.bind(this);
    this.setWaitingWindow = this.setWaitingWindow.bind(this);
    this.setDestination = this.setDestination.bind(this);
    this.setRoutes = this.setRoutes.bind(this);
    this.getRoutes = this.getRoutes.bind(this);
    this.openInMaps = this.openInMaps.bind(this);
    this.renderCell = this.renderCell.bind(this);
  }
  setDate(date) {
    this.setState({
      date: date,
      currentValue: date
    }, this.getRoutes);
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
    }, this.getRoutes);
  }

  setWaitingWindow(option) {
    this.setState({
      waitingWindow:parseInt(option),
      currentValue:option
    }, this.getRoutes);
  }

  setDestination(name, lat, lng) {
    this.setState({
      destination: {
        lat: lat,
        lng: lng,
        name: name
      }
    }, this.getRoutes);
  }

  setRoutes(routes) {
    this.setState({
      routes:routes,
      ds: this.state.ds.cloneWithRows(routes)
    });
  }

  getRoutes() {
    const { currentLocation, api } = this.props;
    // cancel search if no destination is entered yet
    if (this.state.destination.lat === undefined) return;
    this.setState({status: "Loading"});
    let origin = {lat:currentLocation.lat,lng:currentLocation.lng};
    let dest = this.state.destination;
    let arrival = Math.ceil(this.state.date.valueOf());
    let transport = TRANSPORT_MODES[this.state.transportIndex].name;
    api.getRoutes(origin, dest, transport, arrival)
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
    const { currentLocation } = this.props;
    Utils.openInMaps(moment(this.state.date),
      TRANSPORT_MODES[this.state.transportIndex].name,
      {lat:currentLocation.lat, lng:currentLocation.lng},
      this.state.destination
    );
  }

  /**
   * Render a search result
   */
  renderCell(rowData, sectionID) {
    const { currentLocation, api, navigation } = this.props;
    const { navigate } = navigation;
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
      origin: {lat:currentLocation.lat, lng:currentLocation.lng},
      dest: this.state.destination,
      route:rowData,
      inputArrival:Math.ceil(this.state.date.valueOf()),
      inputArrivalDateString:dateString,
      departure:departure_ts,
      subtitle:subtitle,
      transportIcon:TRANSPORT_MODES[this.state.transportIndex].icon,
      transport:TRANSPORT_MODES[this.state.transportIndex].name,
      waitingWindowMs: waitingWindowMs,
      timezoneLocation: tzLocation,
      api: api,
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

  componentWillMount() {
    const { state } = this.props.navigation;
    let params = state.params || {};
    if (params.name !== undefined) {
      this.setDestination(params.name, params.lat, params.lng);
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
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
          options={TRANSPORT_MODES}
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
              options: WAITING_OPTIONS,
              currentValue: this.state.waitingWindow+"",
              onOptionChange:this.setWaitingWindow})
            }
          >
            <Text style={{fontSize: 11}}>
              Alert {WAITING_OPTIONS[this.state.waitingWindow]} before
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
          minDate={new Date(Date.now())}
          maxDate={moment(new Date(Date.now())).add(3, 'months').toDate()}
        />
      </View>
    )
  }
}

SearchComponent.propTypes = {
  navigation: PropTypes.object.isRequired,
  currentLocation: PropTypes.object.isRequired,
  api: PropTypes.object.isRequired
}

export default SearchComponent;

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  TouchableHighlight,
  TextInput,
  Linking,
  ListView,
  ListViewDataSource,
  Platform,
  Alert,
  Button,
  Keyboard,
} from 'react-native';
import moment from 'moment-timezone';
import { List, ListItem, Icon } from 'react-native-elements'

import styles from '../style/Styles.js'
import IconRow from '../components/IconRow.js';
import TouchableText from '../components/TouchableText.js';
import AnimatedPicker from '../components/AnimatedPicker.js';
import LoadingScreen from '../components/LoadingScreen.js';
import TtgApi from '../utils/TtgApi.js';
import Utils from '../utils/Utils.js'

var deviceWidth = Dimensions.get('window').width;
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
      title: 'TTG',
      headerBackTitle:'Back',
      headerRight: (
        <View style={{paddingRight: 10}}>
          { loggedIn ?
            <Icon
              name='notifications-none'
              color='#00aced'
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
    destLat: -1,
    destLng: -1,
    destinationName: "",

    // AnimatedPicker offset
    offSet: new Animated.Value(deviceHeight),
    // picker values
    modal: false,
    pickerType: "date",
    options: [],
    onOptionChange: null,
    currentValue: null,
    minDate: new Date(),
    maxDate: moment().add(3, 'months').toDate(),
    routes: [],
    ds: ds,
    loading:true,
    errored: false,
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
      destLat:lat,
      destLng:lng,
      destinationName: name,
    }, this.getRoutes.bind(this))
  }

  setRoutes(routes) {
    this.setState({
      routes:routes,
      ds: this.state.ds.cloneWithRows(routes)
    })
  }

  getRoutes() {
    this.setState({status: "Loading"});
    let origin = {lat:this.lat,lng:this.lng};
    let dest = {lat:this.state.destLat,lng:this.state.destLng};
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

  renderCell(rowData, sectionID) {
    const { navigate } = this.props.navigation;
    let arrival = moment.unix(rowData.arrival_time / 1000).format('h:mm a');
    // subtract the waiting window
    let departure_ts = rowData.departure_time - this.state.waitingWindow * 60 * 1000;
    let departure = moment.unix(departure_ts / 1000).format('h:mm a');
    let description = rowData.description;
    if (description.length > 0) {
      description += " - ";
    }
    let subtitle = description+"Leave here at "+departure+" and arrive at "+arrival;
    let dateString = moment(this.state.date).tz(moment.tz.guess()).format("YYYY-MM-DDTHH:mm:ssZ z");
    let props = {
      origin: {lat:this.lat, lng:this.lng},
      dest: {lat:this.state.destLat,lng:this.state.destLng},
      route:rowData,
      inputArrival:Math.ceil(this.state.date.valueOf()),
      inputArrivalDateString:dateString,
      departure:departure_ts,
      subtitle:subtitle,
      transportIcon:transportModes[this.state.transportIndex].icon,
      transport:transportModes[this.state.transportIndex].name,
      waitingWindow: this.state.waitingWindow,
      api: this.api,
    };
    return (
      <ListItem
        key={sectionID}
        title={rowData.name}
        subtitle={subtitle}
        underlayColor='#e1e1e1'
        onPress={() => {navigate('AddAlert', props)}}
      />
    );
  }

  openInMaps() {
    let date = moment(this.state.date);
    let dateStr = date.format("MM/DD/YYYY");
    let timeStr = date.format("HH:mm");
    let transport = transportModes[this.state.transportIndex].name;
    let base = "https://www.google.com/maps/dir/?api=1";
    let originArgs = "origin="+this.lat+","+this.lng;
    let destArgs = "destination="+this.state.destLat+","+this.state.destLng;
    let transportArgs = "travelmode="+transport;
    let timingArgs = "ttype=arr&date="+dateStr+"&time="+timeStr;
    let url = base+"&"+originArgs+"&"+destArgs+"&"+transportArgs+"&"+timingArgs;
    Linking.openURL(url);
  }

  initialise() {
    const { setParams } = this.props.navigation;
    this.setState({'errored': false});
    this.setState({'loading': true});
    this.api = new TtgApi(function(){
      // get current location
      this.setupCurrentLocation();
    }.bind(this),
    function(notification){
      alert(notification.alert);
    },
    function(){
      this.setState({'errored': true})
    }.bind(this));
    setParams({api: this.api});
    let params = this.props.navigation.state.params || {};
    if (params.name !== undefined) {
      this.setDestination(params.name, params.lat, params.lng);
    }
  }

  setupCurrentLocation() {
    const { setParams } = this.props.navigation;
    navigator.geolocation.getCurrentPosition(
      function(origin) {
        this.lat = origin.coords.latitude;
        this.lng = origin.coords.longitude;
        this.setState({'loading': false});
        setParams({loggedIn: true});
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
    const { navigate, setParams } = this.props.navigation;
    return (
      <View style={styles.screen}>
        { this.state.loading ?
          <LoadingScreen
            errored={this.state.errored}
            loadingMessage="Logging in..."
            errorMessage="Unfortunately we couldn't log you in. Please ensure you have an internet connection."
            retry={this.initialise.bind(this)}
          />
        :
          <View style={styles.container}>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchBarInput}
                placeholder='Destination'
                onFocus={function() {
                  Keyboard.dismiss();
                  navigate('SearchLocation', {
                    destinationName: this.state.destinationName,
                    onPress:this.setDestination.bind(this)
                  })
                }.bind(this)}
                value={this.state.destinationName}
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
            { this.state.modal ?
              <AnimatedPicker
                closeModal={() => this.setState({ modal: false })}
                offSet={this.state.offSet}
                changeOption={this.state.onOptionChange}
                options={this.state.options}
                currentOption={this.state.currentValue}
                type={this.state.pickerType}
                minDate={this.state.minDate}
                maxDate={this.state.maxDate}
              />
            : null }
          </View>
        }
      </View>
    )
  }
}

export default SearchScreen;

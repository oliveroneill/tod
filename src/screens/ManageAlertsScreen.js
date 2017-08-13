import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  ListView,
  ListViewDataSource,
  Alert,
  Button,
} from 'react-native';
import { List, ListItem } from 'react-native-elements';
import moment from 'moment';

import TouchableText from '../components/TouchableText.js';
import styles from '../style/Styles.js'
import Utils from '../utils/Utils.js'
import LoadingScreen from '../components/LoadingScreen.js';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class ManageAlertsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams, navigate} = navigation;
    const params = state.params || {};
    const editing = params.editing || false;
    const onEdit = params.onEdit;
    return {
      title: 'Manage Trips',
      headerRight: (
        <Button
          title={editing ? "Done" : "Edit"}
          onPress={() => {
            setParams({editing: !editing})
            onEdit();
          }}
        />
      ),
    };
  };
  state = {
    ds: ds,
    trips: [],
    editing: false,
    loading: false,
    errored: false
  };
  getTrips() {
    this.api.getScheduledTrips()
    .then((trips) => {
      this.setState({loading: false});
      this.setTrips(trips);
    })
    .catch((error) => {
      this.setState({errored: true});
    });
  }
  setTrips(trips) {
    this.setState({
      trips:trips,
      ds: this.state.ds.cloneWithRows(trips)
    })
  }
  enableDisableTrip(id) {
    console.log(id);
    this.setState({loading: true});
    this.api.enableDisableTrip(id)
    .then(() => {
      this.getTrips();
    });
  }
  deleteTrip(id) {
    this.setState({loading: true});
    this.api.deleteTrip(id)
    .then(() => {
      this.getTrips()
    });
  }
  onEdit() {
    this.setState({editing:!this.state.editing})
  }
  componentWillMount() {
    this.api = this.props.navigation.state.params.api;
    const { setParams } = this.props.navigation;
    setParams({onEdit: this.onEdit.bind(this)})
  }
  renderCell(rowData, sectionID) {
    let arrivalDate = moment.unix(rowData.route.arrival_time / 1000)
    let arrival = arrivalDate.format('h:mm a');
    let subtitle = "Arrive at "+arrival;
    let days = ["Mon", "Tue", "Wed", "Thurs", "Fri", "Sat", "Sun"];
    var repeats = "";
    for (var i = 0; i < rowData.repeat_days.length; i++) {
      if (rowData.repeat_days[i]) {
        if (repeats.length > 0) {
          repeats += ", ";
        }
        repeats += days[i]
      }
    }
    if (repeats.length > 0)
      subtitle += " Repeats: "+repeats;
    return (
      <ListItem
        key={sectionID}
        leftIcon={{name:Utils.getTransportIcon(rowData.transport_type)}}
        title={rowData.route.description}
        subtitle={subtitle}
        underlayColor='#e1e1e1'
        onPress={() => {Utils.openInMaps(arrivalDate, rowData.transport_type, rowData.origin, rowData.destination)}}
        rightIcon={{'name':'remove-circle', 'color': 'red'}}
        onPressRightIcon={() => this.deleteTrip(rowData.trip_id)}
        hideChevron={!this.state.editing}
        switchButton={!this.state.editing}
        onSwitch={() => this.enableDisableTrip(rowData.trip_id)}
        switched={rowData.enabled}
        subtitleNumberOfLines={3}
      />
    );
  }
  componentDidMount() {
    this.getTrips();
  }
  render() {
    return (
      <View style={styles.screen}>
        { this.state.loading ?
          <LoadingScreen
            loadingMessage="Loading Trips..."
            errored={this.state.errored}
            errorMessage="Something went wrong. Please ensure you have an internet connection."
            retry={this.getTrips.bind(this)}
          />
        :
          <View style={styles.container}>
            <Text style={{paddingLeft: 10}}>Trips: </Text>
            <List>
              <ListView
                enableEmptySections
                renderRow={this.renderCell.bind(this)}
                dataSource={this.state.ds}
              />
            </List>
          </View>
        }
      </View>
    )
  }
}

export default ManageAlertsScreen;

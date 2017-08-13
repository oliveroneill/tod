import {
  Linking,
} from 'react-native';

var transportModes = [
  {name:'transit', icon:'directions-transit'},
  {name:'driving', icon:'directions-car'},
  {name:'walking', icon:'directions-walk'},
  {name:'bicycling', icon:'directions-bike'}
];

var transportDict = {};
for (var i = 0; i < transportModes.length; i++) {
  transportDict[transportModes[i].name] = transportModes[i].icon;
}

class Utils {
  static getTransportIcon(transportType) {
    return transportDict[transportType];
  }
  static getTransportModes() {
    return transportModes;
  }
  static generateWaitingWindows() {
    var waitingOptions = {};
    for (var i = 1; i < 11; i++) {
      waitingOptions[i] = i+" mins";
    }
    for (var i = 15; i < 31; i+=5) {
      waitingOptions[i] = i+" mins";
    }
    return waitingOptions;
  }
  static openInMaps(date, transportName, origin, dest) {
    let dateStr = date.format("MM/DD/YYYY");
    let timeStr = date.format("HH:mm");
    let transport = transportName;
    let base = "https://www.google.com/maps/dir/?api=1";
    let originArgs = "origin="+origin.lat+","+origin.lng;
    let destArgs = "destination="+dest.lat+","+dest.lng;
    let transportArgs = "travelmode="+transport;
    let timingArgs = "ttype=arr&date="+dateStr+"&time="+timeStr;
    let url = base+"&"+originArgs+"&"+destArgs+"&"+transportArgs+"&"+timingArgs;
    Linking.openURL(url);
  }
}

export default Utils;
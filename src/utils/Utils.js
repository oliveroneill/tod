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
}

export default Utils;
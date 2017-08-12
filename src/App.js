import {
  StackNavigator,
} from 'react-navigation';

import {
  AppRegistry,
} from 'react-native';

import SearchScreen from './screens/SearchScreen.js';
import AddAlertScreen from './screens/AddAlertScreen.js';
import ManageAlertsScreen from './screens/ManageAlertsScreen.js';
import SearchLocationScreen from './screens/SearchLocationScreen.js';

const App = StackNavigator({
    Home: { screen: SearchScreen },
    SearchLocation: { screen: SearchLocationScreen },
    AddAlert: { screen: AddAlertScreen },
    ManageAlerts: { screen: ManageAlertsScreen },
  }
);
export default App;
AppRegistry.registerComponent('tod', () => App);

import {
  StyleSheet,
  Platform,
} from 'react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;

export default StyleSheet.create({
  screen:{
    backgroundColor:'#ffffff',
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: STATUSBAR_HEIGHT,
  },
  inputOptions: {
    paddingTop:12,
    paddingLeft: 5,
    paddingRight:5,
    paddingBottom: 12
  },
  searchBarContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: '#e1e8ee',
    borderTopColor: '#e1e1e1',
    borderBottomColor: '#e1e1e1',
    height: 50
  },
  searchBarInput: {
    paddingLeft: 26,
    paddingRight: 19,
    margin: 8,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#bdc6cf',
    color: '#86939e',
    fontSize: 13,
    height: 30
  },
  icon: {
    color: '#bdc6cf',
  },
  iconEnabled: {
    color: '#00aced',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderBottomColor: '#e2e2e2',
    borderBottomWidth:1,
    backgroundColor: '#ffffff'
  },
  screen:{
    backgroundColor:'#ffffff',
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: STATUSBAR_HEIGHT,
  },
  // header: {
  //   flexDirection: 'row',
  // },
  header_item: {
    flex: 1,
    paddingLeft: 10,
    paddingRight:10,
    paddingTop:10,
    paddingBottom:10
  },
  header_button: {
    flexDirection: 'row'
  },
  text_right: {
    textAlign: 'right'
  },
});
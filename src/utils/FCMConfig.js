import Config from 'react-native-config'

const SENDER_ID = Config.FCM_SENDER_ID;
module.exports = {
  FCMServerKey: SENDER_ID
}
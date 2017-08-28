import {FCMServerKey} from './FCMConfig.js';
import uniqueId from 'react-native-unique-id';
import PushNotification from 'react-native-push-notification';

/**
 * Will register for notification and retrieve a unique id for this device
 * This is done asynchronously
 */
class AppSetup {
  constructor() {
    this._id = null;
  }

  _getUserId() {
    return new Promise(function(resolve, reject) {
      // if we've already stored the id then return this
      if (this._id != null) {
        resolve(this._id);
      }
      uniqueId()
        .then(function(id) {
          // store id for later use
          this._id = id;
          resolve(id)
        }.bind(this))
        .catch(error => reject(error));
    }.bind(this));
  }

  /**
   * Call this on app start to register for notifications
   * This also retrieves a unique identifier for the device
   *
   * @param onToken(id, token) - id is a unique id, token is the notification
   * token that should be used to notify this device
   * notification
   * @param onNotification is based on react-native-push-notification's
   * callback
   * @param onError - called if retrieving a unique id fails
   */
  setupNotifications(onToken, onNotification, onError) {
    PushNotification.configure({
      onRegister: function(token) {
        this._getUserId()
        .then((id) => {
          onToken(id, token.token);
        })
        .catch(error => onError(error));
      }.bind(this),
      onNotification: onNotification,
      senderID: FCMServerKey,
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }
}

export default AppSetup;

import {FCMServerKey} from './FCMConfig.js';
import uniqueId from 'react-native-unique-id';
import PushNotification from 'react-native-push-notification';

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

  setupNotifications(onToken, onNotification, onError) {
    PushNotification.configure({
      onRegister: function(token) {
        this._getUserId()
        .then((id) => {
          onToken(id, token.token);
        })
        .catch(error => onError(error));
      }.bind(this),
      onNotification: function(notification) {
        onNotification(notification);
      },
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

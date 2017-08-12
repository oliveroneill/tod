import PushNotification from 'react-native-push-notification';

jest.mock('Linking', () => {

  // we need to mock both Linking.getInitialURL()
  // and Linking.getInitialURL().then()
  const getInitialURL = jest.fn()
  getInitialURL.mockReturnValue({then: jest.fn()})

  return {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
    getInitialURL: getInitialURL
  }
})

jest.mock('PushNotificationIOS', () => ({
  addEventListener: jest.fn(),
  requestPermissions: jest.fn(),
}));

PushNotification.configure = jest.fn((settings) => settings.onRegister({token:"test_token"}));

Date.now = jest.fn(() => 1482363367071);

global.fetch = jest.fn();
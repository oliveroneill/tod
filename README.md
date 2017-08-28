# tod - time of departure

[![Build Status](https://travis-ci.org/oliveroneill/tod.svg?branch=master)](https://travis-ci.org/oliveroneill/tod)

React native app for scheduling trips so that a notification is sent when it's time to leave.

## Table of Contents

* [Configuration](#configuration)
* [Updating to New Releases](#updating-to-new-releases)
* [Available Scripts](#available-scripts)
  * [npm start](#npm-start)
  * [npm test](#npm-test)
  * [npm run ios](#npm-run-ios)
  * [npm run android](#npm-run-android)

## Configuration
API URL and FCM sender ID are set via [react-native-config](https://github.com/luggit/react-native-config), this
can be done by creating a `.env` file and specifying `API_URL` and `FCM_SENDER_ID`.

I'll be open sourcing the server for this project soon and will put a link to that here.

## Updating to New Releases

You should only need to update the global installation of `create-react-native-app` very rarely, ideally never.

Updating the `react-native-scripts` dependency of your app should be as simple as bumping the version number in `package.json` and reinstalling your project's dependencies.

Upgrading to a new version of React Native requires updating the `react-native`, `react`, and `expo` package versions, and setting the correct `sdkVersion` in `app.json`. See the [versioning guide](https://github.com/react-community/create-react-native-app/blob/master/VERSIONS.md) for up-to-date information about package version compatibility.

## Available Scripts

### `npm start`

Runs your app in development mode.

#### `npm test`

Runs the [jest](https://github.com/facebook/jest) test runner on your tests.
There are warnings for each of these tests caused by dependencies as well as type checking that can't be avoided via mocks. These can be ignored until the dependencies update from deprecated `PropTypes` usage. There is also a warning regarding the `Switch` component. I believe this is caused by calling `renderCell` directly where there is no state. This warning is mentioned in [TODO](#todo).

#### `npm run ios`

Like `npm start`, but also attempts to open your app in the iOS Simulator if you're on a Mac and have it installed.

#### `npm run android`

Like `npm start`, but also attempts to open your app on a connected Android device or emulator. Requires an installation of Android build tools (see [React Native docs](https://facebook.github.io/react-native/docs/getting-started.html) for detailed setup). We also recommend installing Genymotion as your Android emulator. Once you've finished setting up the native build environment, there are two options for making the right copy of `adb` available to Create React Native App:

##### Using Android Studio's `adb`

1. Make sure that you can run adb from your terminal.
2. Open Genymotion and navigate to `Settings -> ADB`. Select “Use custom Android SDK tools” and update with your [Android SDK directory](https://stackoverflow.com/questions/25176594/android-sdk-location).

##### Using Genymotion's `adb`

1. Find Genymotion’s copy of adb. On macOS for example, this is normally `/Applications/Genymotion.app/Contents/MacOS/tools/`.
2. Add the Genymotion tools directory to your path (instructions for [Mac](http://osxdaily.com/2014/08/14/add-new-path-to-path-command-line/), [Linux](http://www.computerhope.com/issues/ch001647.htm), and [Windows](https://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/)).
3. Make sure that you can run adb from your terminal.

## TODO
- Figure out how to decouple route data from views so that we can easily snapshot test (this should fix `Switch` warning mentioned in `npm test` section above)
- Use linter such as [semistandard](https://github.com/Flet/semistandard)

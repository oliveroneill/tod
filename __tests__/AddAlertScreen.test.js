import React from 'react';
import renderer from 'react-test-renderer';

import { Alert } from 'react-native';
import { ListItem } from 'react-native-elements';

import { shallow } from 'enzyme';

import AddAlertScreen from '../src/screens/AddAlertScreen.js';

const inputData = {
  route: {
    arrival_time: 1482363467071,
    departure_time: 1482363367071,
    description: "Take x avenue",
    name: "Bus Route 1"
  },
  subtitle: "Take x avenue",
  transport:"walking",
  origin: {lat: -44, lng: 22},
  dest: {
    name: 'Test Address Name, City, Country',
    lat: 21,
    lng: 90
  },
  inputArrival: 1482363467021,
  inputArrivalDateString: "11/11/2011 10am",
  waitingWindowMs: 60000,
  timezoneLocation: "NotReal/Timezone"
};

function createMockProps() {
  return {
    navigation: {
      setParams: jest.fn(),
      state: {
        params: {
          ...inputData,
          api: {
            scheduleTrip: jest.fn().mockReturnValue(
              new Promise(function(resolve, reject) {})
            )
          }
        }
      },
      goBack: jest.fn()
    }
  };
}

describe('AddAlertScreen', () => {
  it('displays route correctly', () => {
    let component = renderer.create(<AddAlertScreen {...createMockProps()}/>);
    expect(component.toJSON()).toMatchSnapshot()
  });

  it('adds route correctly', () => {
    // given
    var scheduleTrip = null;
    let props = createMockProps();
    // scheduleTrip function is passed to the navigation bar
    // We will call this function to test its behaviour
    props.navigation.setParams = jest.fn().mockImplementation((param) => {
      if (param.scheduleTrip === undefined) return;
      scheduleTrip = param.scheduleTrip;
    });
    // mock alert
    Alert.alert = jest.fn();
    let api = props.navigation.state.params.api;
    let promise = Promise.resolve();
    api.scheduleTrip = jest.fn().mockReturnValue(promise);
    let wrapper = shallow(<AddAlertScreen {...props} />);
    // when
    scheduleTrip();
    // then
    expect(api.scheduleTrip).toHaveBeenCalledWith(
      inputData.origin, inputData.dest,
      inputData.route, inputData.transport, inputData.inputArrival,
      inputData.inputArrivalDateString, inputData.waitingWindowMs,
      inputData.timezoneLocation,
      [false, false, false, false, false, false, false]
    );
    // wait for response from api and ensure alert was triggered correctly
    return promise.then(() => {
      wrapper.update();
      expect(Alert.alert).toHaveBeenCalledWith("Trip successfully scheduled!");
    });
  });

  it('adds route with repeats correctly', () => {
    // given
    var scheduleTrip = null;
    let props = createMockProps();
    // scheduleTrip function is passed to the navigation bar
    // We will call this function to test its behaviour
    props.navigation.setParams = jest.fn().mockImplementation((param) => {
      if (param.scheduleTrip === undefined) return;
      scheduleTrip = param.scheduleTrip;
    });
    // mock alert
    Alert.alert = jest.fn();
    let api = props.navigation.state.params.api;
    let promise = Promise.resolve();
    api.scheduleTrip = jest.fn().mockReturnValue(promise);
    let wrapper = shallow(<AddAlertScreen {...props} />);
    // when
    // test setting repeating feature
    // this will set the trip to repeat every Thursday
    wrapper.find(ListItem).at(4).props().onPress();
    wrapper.update();
    scheduleTrip();
    expect(api.scheduleTrip).toHaveBeenCalledWith(
      inputData.origin, inputData.dest,
      inputData.route, inputData.transport, inputData.inputArrival,
      inputData.inputArrivalDateString, inputData.waitingWindowMs,
      inputData.timezoneLocation,
      [false, false, false, true, false, false, false]
    );
    // wait for response from api and ensure alert was triggered correctly
    return promise.then(() => {
      wrapper.update();
      expect(Alert.alert).toHaveBeenCalledWith("Trip successfully scheduled!");
    });
  });

  it('handles failed route add', () => {
    // given
    var scheduleTrip = null;
    let props = createMockProps();
    // scheduleTrip function is passed to the navigation bar
    // We will call this function to test its behaviour
    props.navigation.setParams = jest.fn().mockImplementation((param) => {
      if (param.scheduleTrip === undefined) return;
      scheduleTrip = param.scheduleTrip;
    });
    let api = props.navigation.state.params.api;
    // ensure the request fails
    let promise = Promise.reject();
    api.scheduleTrip = jest.fn().mockReturnValue(promise);
    // mock alert
    Alert.alert = jest.fn();
    let wrapper = shallow(<AddAlertScreen {...props} />);
    // when
    scheduleTrip();
    // then
    expect(api.scheduleTrip).toHaveBeenCalledWith(
      inputData.origin, inputData.dest,
      inputData.route, inputData.transport, inputData.inputArrival,
      inputData.inputArrivalDateString, inputData.waitingWindowMs,
      inputData.timezoneLocation,
      [false, false, false, false, false, false, false]
    );
    // wait for response from api and ensure alert was triggered with correct
    // message
    return promise.catch(() => {
      wrapper.update();
    }).then(() => {
      wrapper.update();
      expect(Alert.alert).toHaveBeenCalledWith(
        "Something went wrong. Please try again later"
      );
    });
  });
});
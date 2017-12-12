import React from 'react';
import renderer from 'react-test-renderer';

import {
  Text,
  TouchableHighlight,
  TextInput,
  ListView
} from 'react-native';
import { ListItem } from 'react-native-elements'
import moment from 'moment-timezone';

import { shallow } from 'enzyme';

import SearchComponent from '../../src/components/SearchComponent.js';
import AnimatedPicker from '../../src/components/AnimatedPicker.js';
import IconRow from '../../src/components/IconRow.js';

function createMockProps(currentLocation, destination) {
  return {
    navigation: {
      setParams: jest.fn(),
      state: {
        params: destination
      },
      navigate: jest.fn()
    },
    currentLocation: currentLocation,
    api: {
      getRoutes: jest.fn().mockReturnValue(
        new Promise(function(resolve, reject) {})
      )
    }
  };
}

function setup(lat, lng) {
  let props = createMockProps({lat, lng});
  return shallow(<SearchComponent {...props} />);
}

describe('SearchComponent', () => {
  it('displays views correctly', () => {
    // snapshot test
    let lat = -44;
    let lng = 22;
    let props = createMockProps({lat, lng});
    let component = renderer.create(<SearchComponent {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('requests the search input', () => {
    // given
    let origin = {lat: -23, lng: 25};
    let destination = {
      name: 'Test Address Name, City, Country',
      lat: 21,
      lng: 90
    };
    let props = createMockProps(origin, destination);
    // when
    let enzymeWrapper = shallow(<SearchComponent {...props} />);
    // set transport type
    let selectedIndex = 2;
    enzymeWrapper.find(IconRow).props().onPress(selectedIndex);
    enzymeWrapper.update();
    // set arrival time
    enzymeWrapper.find(TouchableHighlight).first().props().onPress();
    enzymeWrapper.update();
    // clear previous queries
    props.api.getRoutes.mockClear();
    let arrival = 1482363397071;
    enzymeWrapper.find(AnimatedPicker).props().onOptionChange(new Date(arrival));
    enzymeWrapper.update();
    // then
    expect(props.api.getRoutes).toHaveBeenCalledWith(origin, destination, "walking", arrival);
  });

  it('displays routes correctly', () => {
    // snapshot test
    let lat = -44;
    let lng = 22;
    let props = createMockProps({lat, lng});
    let screen = new SearchComponent({...props});
    let mockRowData = {
      arrival_time: 1482363467071,
      departure_time: 1482363367071,
      description: "Take x avenue",
      name: "Bus Route 1"
    };
    let component = renderer.create(screen.renderCell(mockRowData, 1));
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('updates routes on input change', () => {
    // given
    let origin = {lat: -23, lng: 25};
    let destination = {
      name: 'Test Address Name, City, Country',
      lat: 21,
      lng: 90
    };
    let props = createMockProps(origin, destination);
    let enzymeWrapper = shallow(<SearchComponent {...props} />);
    // set transport type
    let selectedIndex = 2;
    enzymeWrapper.find(IconRow).props().onPress(selectedIndex);
    enzymeWrapper.update();
    // set arrival time
    enzymeWrapper.find(TouchableHighlight).first().props().onPress();
    enzymeWrapper.update();
    // clear previous queries
    props.api.getRoutes.mockClear();
    var arrival = 1482363397071;
    enzymeWrapper.find(AnimatedPicker).props().onOptionChange(new Date(arrival));
    enzymeWrapper.update();
    expect(props.api.getRoutes).toHaveBeenCalledWith(origin, destination, "walking", arrival);
    // update arrival time and ensure that a new query is made
    props.api.getRoutes.mockClear();
    arrival = 1482362397071;
    enzymeWrapper.find(AnimatedPicker).props().onOptionChange(new Date(arrival));
    enzymeWrapper.update();
    expect(props.api.getRoutes).toHaveBeenCalledWith(origin, destination, "walking", arrival);
  });

  it('displays error when route search fails', () => {
    // given
    let origin = {lat: -23, lng: 25};
    let destination = {
      name: 'Test Address Name, City, Country',
      lat: 21,
      lng: 90
    };
    // will fail on API call
    let promise = Promise.reject();
    let props = createMockProps(origin, destination);
    props.api.getRoutes = jest.fn().mockReturnValue(promise);
    // when
    let wrapper = shallow(<SearchComponent {...props} />);
    wrapper.find(IconRow).props().onPress(2);
    wrapper.update();
    // must wait until after the error was received by the component
    return promise
    .catch(() => {})
    .then(() => {
      // then
      wrapper.update();
      let expected = "Routes (Something went wrong):";
      expect(wrapper.find(Text).at(3).props().children.join("")).toEqual(expected);
    });
  });

  it('displays loading message when searching', () => {
    // given
    let origin = {lat: -23, lng: 25};
    let destination = {
      name: 'Test Address Name, City, Country',
      lat: 21,
      lng: 90
    };
    let props = createMockProps(origin, destination);
    props.api.getRoutes = jest.fn().mockReturnValue(Promise.reject());
    // when
    let wrapper = shallow(<SearchComponent {...props} />);
    // switch transport modes
    wrapper.find(IconRow).props().onPress(2);
    wrapper.update();
    // then
    let expected = "Routes (Loading):";
    expect(wrapper.find(Text).at(3).props().children.join("")).toEqual(expected);
  });

  it('navigates to schedule screen on press', () => {
    // given
    let lat = -44;
    let lng = 22;
    let destination = {
      name: 'Test Address Name, City, Country',
      lat: 21,
      lng: 90
    };
    let props = createMockProps({lat, lng});
    let screen = new SearchComponent({...props});
    let mockRowData = {
      arrival_time: 1482363467071,
      departure_time: 1482363367071,
      description: "Take x avenue",
      name: "Bus Route 1"
    };
    let inputArrival = 1482383467071;
    let mockTimezone = "America/Los_Angeles";
    moment.tz.guess = jest.fn().mockReturnValue(mockTimezone);
    let waitingWindow = 2;
    screen.state = {
      waitingWindow: waitingWindow,
      date: new Date(inputArrival),
      destination: destination,
      transportIndex: 1
    };
    // when
    let wrapper = shallow(screen.renderCell(mockRowData, 1));
    wrapper.props().onPress();
    // then
    // convert waiting window to milliseconds
    let expectedWaitingWindow = waitingWindow * 60 * 1000;
    let expected = {
      origin: {lat, lng },
      dest: destination,
      route:mockRowData,
      inputArrival: inputArrival,
      inputArrivalDateString:"2016-12-21T21:11:07-08:00 PST",
      departure:mockRowData.departure_time - expectedWaitingWindow,
      subtitle:"Take x avenue - Alert at 5:34 pm and arrive at 5:37 pm",
      transportIcon: "directions-car",
      transport: "driving",
      waitingWindowMs: expectedWaitingWindow,
      timezoneLocation: mockTimezone,
      api: props.api
    };
    expect(props.navigation.navigate).toHaveBeenCalledWith('AddAlert', expected);
  });
});

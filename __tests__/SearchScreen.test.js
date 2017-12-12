import React from 'react';
import renderer from 'react-test-renderer';

import { shallow } from 'enzyme';

import APIComponent from '../src/components/APIComponent.js';
import SearchComponent from '../src/components/SearchComponent.js';
import SearchScreen from '../src/screens/SearchScreen.js';

function createMockProps() {
  return {
    navigation: {
      setParams: jest.fn(),
      state: {}
    }
  };
}

function setup() {
  return shallow(<SearchScreen {...createMockProps()} />)
}

describe('SearchScreen', () => {
  it('displays loading message (snapshot test)', () => {
    let component = renderer.create(<SearchScreen {...createMockProps()} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('shows loading screen while logging in', () => {
    let enzymeWrapper = setup();
    // ensure loading screen is visible
    let logging = enzymeWrapper.find(APIComponent);
    expect(logging).toHaveLength(1);
  });

  it('shows search screen on logged in', () => {
    let enzymeWrapper = setup();
    let logging = enzymeWrapper.find(APIComponent);
    // set location
    logging.props().onLocation(433, -33);
    enzymeWrapper.update();
    // ensure the loading screen is now gone
    expect(enzymeWrapper.find(APIComponent)).toHaveLength(0);
    // ensure that the search screen is now showing
    let searchBar = enzymeWrapper.find(SearchComponent);
    expect(searchBar).toHaveLength(1);
  });
});

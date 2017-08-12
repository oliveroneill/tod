import React from 'react';
import renderer from 'react-test-renderer';

import LoadingScreen from '../src/components/LoadingScreen.js';

it('displays error with try again option', () => {
  let component = renderer.create(
    <LoadingScreen
      errored={true}
      loadingMessage="Logging in..."
      errorMessage="Unfortunately we couldn't log you in. Please ensure you have an internet connection."
      retry={jest.fn()}
    />
  );
  expect(component.toJSON()).toMatchSnapshot()
});

it('displays loading screen while loading', () => {
  let component = renderer.create(
    <LoadingScreen
      errored={false}
      loadingMessage="Logging in..."
      errorMessage="Unfortunately we couldn't log you in. Please ensure you have an internet connection."
      retry={jest.fn()}
    />
  );
  expect(component.toJSON()).toMatchSnapshot()
});
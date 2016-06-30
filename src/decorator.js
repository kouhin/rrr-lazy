import React from 'react';

import { Lazy } from './Lazy';

const getDisplayName = Component => Component.displayName ||
  Component.name ||
  (typeof Component === 'string' ? Component : 'Component');

export const lazy = (options = {}) => Component => {
  class LazyDecorated extends React.Component {
    static contextTypes = {
      redialContext: React.PropTypes.object,
    };

    constructor(props, context) {
      super(props, context);
      this.displayName = `Lazy${getDisplayName(Component)}`;
    }

    render() {
      return (
        <Lazy {...options}>
          <Component {...this.props} />
        </Lazy>
      );
    }
  }
  LazyDecorated.WrappedComponent = Component;
  return LazyDecorated;
};

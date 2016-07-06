import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import over from 'lodash/over';

import { Lazy } from './Lazy';

const getDisplayName = Component => Component.displayName ||
  Component.name ||
  (typeof Component === 'string' ? Component : 'Component');

export const lazy = (options = {}) => Component => {
  class LazyDecorated extends React.Component {
    static propTypes = {
      children: React.PropTypes.node,
    };

    constructor(props, context) {
      super(props, context);
      this.displayName = `Lazy${getDisplayName(Component)}`;
    }

    getHandler() {
      const load = () => {
        hoistStatics(LazyDecorated, Component);
      };
      return over([load, options.onContentVisible].filter(v => !!v));
    }

    render() {
      const { children, ...props } = this.props; // eslint-disable-line no-unused-vars
      return (
        <Lazy {...props} {...options} onContentVisible={this.getHandler()}>
          <Component
            {...props}
          />
        </Lazy>
      );
    }
  }
  LazyDecorated.WrappedComponent = Component;
  return LazyDecorated;
};

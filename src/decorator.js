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
      reloadComponent: React.PropTypes.func,
    };

    constructor(props, context) {
      super(props, context);
      this.displayName = `Lazy${getDisplayName(Component)}`;
    }

    render() {
      const {
        children, // eslint-disable-line no-unused-vars
        reloadComponent,
        ...props,
      } = this.props;

      const reload = reloadComponent && typeof reloadComponent === 'function'
        ? () => {
          hoistStatics(LazyDecorated, Component);
          return reloadComponent();
        } : null;
      return (
        <Lazy
          {...options}
          reload={reload}
        >
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

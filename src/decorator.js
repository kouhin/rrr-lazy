import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

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
        ...restProps,
      } = this.props;

      const reloadLazyComponent = this.props.reloadComponent &&
        typeof this.props.reloadComponent === 'function'
        ? () => {
          hoistStatics(LazyDecorated, Component);
          return this.props.reloadComponent();
        } : null;
      return (
        <Lazy
          {...options}
          {...restProps}
          reloadLazyComponent={reloadLazyComponent}
        >
          <Component />
        </Lazy>
      );
    }
  }
  LazyDecorated.WrappedComponent = Component;
  return LazyDecorated;
};

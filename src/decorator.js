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
      this.displayName = `lazy(${getDisplayName(Component)})`;
    }

    componentWillMount() {
      this.staticKeys = Object.keys(LazyDecorated);
    }

    shouldComponentUpdate() {
      return false;
    }

    componentWillUnmount() {
      Object.keys(LazyDecorated).forEach(k => {
        if (this.staticKeys.indexOf(k) === -1) {
          delete LazyDecorated[k];
        }
      });
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
          Component={Component}
          reloadLazyComponent={reloadLazyComponent}
        />
      );
    }
  }
  LazyDecorated.WrappedComponent = Component;
  return LazyDecorated;
};

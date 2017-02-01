import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

import Lazy from './Lazy';

const getDisplayName = (Component) => {
  if (!Component) {
    return 'Component';
  }
  return Component.displayName ||
    Component.name ||
    (typeof Component === 'string' ? Component : 'Component');
};

export default (options = {}) => (Component = null) => {
  class LazyDecorated extends React.Component {
    static propTypes = {
      reloadComponent: React.PropTypes.func,
    };

    static get defaultProps() {
      return {
        children: null,
        reloadComponent: () => null,
      };
    }

    componentWillMount() {
      this.staticKeys = Object.keys(LazyDecorated);
    }

    componentWillUnmount() {
      Object.keys(LazyDecorated).forEach((k) => {
        if (this.staticKeys.indexOf(k) === -1) {
          delete LazyDecorated[k];
        }
      });
    }

    render() {
      const {
        children, // eslint-disable-line no-unused-vars
        getComponent,
        ...restProps
      } = {
        ...options,
        ...this.props,
      };

      const reloadLazyComponent =
            (!this.props.reloadComponent ||
             typeof this.props.reloadComponent !== 'function')
            ? null : () => new Promise((resolve) => {
              if (!Component && getComponent) {
                getComponent((c) => {
                   // eslint-disable-next-line no-param-reassign,no-underscore-dangle
                  Component = c && c.__esModule ? c.default : c;
                  resolve(Component);
                });
              } else {
                resolve(Component);
              }
            }).then((c) => {
              hoistStatics(LazyDecorated, c);
              return this.props.reloadComponent();
            });
      return (
        <Lazy
          {...restProps}
          Component={Component}
          reloadLazyComponent={reloadLazyComponent}
        />
      );
    }
  }
  LazyDecorated.displayName = `lazy(${getDisplayName(Component)})`;
  LazyDecorated.WrappedComponent = Component;
  return LazyDecorated;
};

import React from 'react';
import PropTypes from 'prop-types';
import hoistStatics from 'hoist-non-react-statics';

import Lazy from './Lazy';

const getDisplayName = (Component, displayName) => {
  if (displayName) {
    return displayName;
  }
  if (!Component) {
    return 'Component';
  }
  return Component.displayName ||
    Component.name ||
    (typeof Component === 'string' ? Component : 'Component');
};

function isPromise(obj) {
  return obj && typeof obj.then === 'function';
}

function interopRequireDefault(obj) {
  // eslint-disable-next-line no-underscore-dangle
  return obj && obj.__esModule ? obj : { default: obj };
}

export default (options = {}) => (Component = null) => {
  class LazyDecorated extends React.PureComponent {
    static propTypes = {
      reloadComponent: PropTypes.func,
    };

    static get defaultProps() {
      return {
        reloadComponent: () => null,
      };
    }

    constructor(props) {
      super(props);
      this.reloadLazyComponent = this.reloadLazyComponent.bind(this);
      this.resetLazyComponent = this.resetLazyComponent.bind(this);
      this.state = {
        Component,
        element: Component ? React.createElement(Component) : null,
      };
      this.originStatics = Object.getOwnPropertyNames(LazyDecorated);
    }

    componentWillUnmount() {
      this.resetLazyComponent();
    }

    reloadLazyComponent() {
      if (!this.props.reloadComponent || typeof this.props.reloadComponent !== 'function') {
        return null;
      }
      return new Promise((resolve, reject) => {
        if (this.state.Component || !options.getComponent) {
          // Component is already loaded
          resolve();
        } else if (isPromise(options.getComponent)) {
          // getComponent is a Promise, e.g. getComponent = import('./module')
          options.getComponent.then((c) => {
            resolve(interopRequireDefault(c).default);
          });
        } else if (typeof options.getComponent === 'function') {
          const componentReturn = options.getComponent((c) => {
            // getComponent is a lazy bundle,
            // e.g. getComponent = 'bundle-loader!lazy!./module');
            resolve(interopRequireDefault(c).default);
          });
          if (isPromise(componentReturn)) {
            // getComponent is a function and returns Promise,
            // e.g. getComponent = () => import('./module');
            componentReturn.then((c) => {
              resolve(interopRequireDefault(c).default);
            });
          }
        } else {
          reject(new Error('getComponent must be Promise or function'));
        }
      }).then((c) => {
        if (c && this.state.Component !== c) {
          // eslint-disable-next-line no-param-reassign
          Component = c;
          this.setState({
            Component: c,
            element: React.createElement(Component),
          });
        }
        if (this.state.Component) {
          hoistStatics(LazyDecorated, this.state.Component);
        }
        if (typeof this.props.reloadComponent === 'function') {
          this.props.reloadComponent();
        }
        return null;
      });
    }

    resetLazyComponent() {
      const keys = Object.getOwnPropertyNames(LazyDecorated);
      for (let i = 0, total = keys.length; i < total; i += 1) {
        const key = keys[i];
        if (this.originStatics.indexOf(key) === -1) {
          delete LazyDecorated[key];
        }
      }
    }

    render() {
      const {
        displayName, // eslint-disable-line no-unused-vars
        getComponent, // eslint-disable-line no-unused-vars
        ...restOptions
      } = {
        ...options,
      };

      return (
        <Lazy
          {...restOptions}
          reloadLazyComponent={this.reloadLazyComponent}
          resetLazyComponent={this.resetLazyComponent}
        >
          {
            this.state.element
              ? React.cloneElement(this.state.element, this.props) : null
          }
        </Lazy>
      );
    }
  }
  LazyDecorated.displayName = `@lazy(${getDisplayName(Component, options.displayName)})`;
  LazyDecorated.WrappedComponent = Component;
  return LazyDecorated;
};

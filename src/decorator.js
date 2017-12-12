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
  return (
    Component.displayName ||
    Component.name ||
    (typeof Component === 'string' ? Component : 'Component')
  );
};

function isPromise(obj) {
  return obj && typeof obj.then === 'function';
}

function interopRequireDefault(obj) {
  // eslint-disable-next-line no-underscore-dangle
  return obj && obj.__esModule ? obj : { default: obj };
}

export default (options = {}) => (target = null) => {
  let Component = target;
  class LazyDecorated extends React.PureComponent {
    static propTypes = {
      reloadComponent: PropTypes.func
    };

    static get defaultProps() {
      return {
        reloadComponent: () => null
      };
    }

    constructor(props) {
      super(props);
      this.handleLoading = this.handleLoading.bind(this);
      this.handleUnload = this.handleUnload.bind(this);
      this.state = { Component };
      this.originStatics = Object.getOwnPropertyNames(LazyDecorated);
    }

    componentWillUnmount() {
      this.handleUnload();
    }

    handleLoading() {
      if (
        !this.props.reloadComponent ||
        typeof this.props.reloadComponent !== 'function'
      ) {
        return null;
      }
      return Promise.all([
        options.onLoading ? options.onLoading() : Promise.resolve(),
        Promise.resolve()
          .then(() => {
            if (this.state.Component || !options.getComponent) {
              // Component is already loaded
              return null;
            } else if (isPromise(options.getComponent)) {
              // getComponent is a Promise, e.g. getComponent = import('./module')
              return options.getComponent;
            } else if (typeof options.getComponent === 'function') {
              // getComponent is a function and returns Promise,
              // e.g. getComponent = () => import('./module');
              return options.getComponent();
            } else {
              reject(new Error('getComponent must be Promise or function'));
            }
          })
          .then(c => {
            const component = interopRequireDefault(c).default;
            if (component && this.state.Component !== component) {
              Component = component;
              this.setState({ Component: component });
            }
            if (this.state.Component) {
              hoistStatics(LazyDecorated, this.state.Component);
            }
            if (typeof this.props.reloadComponent === 'function') {
              return this.props.reloadComponent();
            }
            return null;
          })
      ]);
    }

    handleUnload() {
      const keys = Object.getOwnPropertyNames(LazyDecorated);
      for (let i = 0, total = keys.length; i < total; i += 1) {
        const key = keys[i];
        if (this.originStatics.indexOf(key) === -1) {
          delete LazyDecorated[key];
        }
      }
      return options.onUnload ? options.onUnload() : Promise.resolve();
    }

    render() {
      const {
        displayName,
        getComponent,
        render: renderElement,
        reloadComponent,
        ...restOptions
      } = {
        ...options,
        ...this.props
      };

      return (
        <Lazy
          {...restOptions}
          render={(status, props) =>
            renderElement(status, props, this.state.Component)
          }
          onLoading={this.handleLoading}
          onUnload={this.handleUnload}
        />
      );
    }
  }
  LazyDecorated.displayName = `@lazy(${getDisplayName(
    Component,
    options.displayName
  )})`;
  LazyDecorated.WrappedComponent = Component;
  return LazyDecorated;
};

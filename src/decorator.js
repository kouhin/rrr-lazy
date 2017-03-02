import React from 'react';
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
      return new Promise((resolve) => {
        if (!this.state.Component && options.getComponent) {
          options.getComponent((c) => {
            // eslint-disable-next-line no-param-reassign,no-underscore-dangle
            Component = c && c.__esModule ? c.default : c;
            resolve(Component);
          });
          return;
        }
        resolve();
      }).then((c) => {
        if (c && this.state.Component !== c) {
          this.setState({
            Component: c,
            element: React.createElement(Component),
          });
        }
        if (this.state.Component) {
          hoistStatics(LazyDecorated, this.state.Component);
        }
        return this.props.reloadComponent();
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

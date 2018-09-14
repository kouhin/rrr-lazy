import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

import Lazy from './Lazy';

function interopRequireDefault(obj) {
  // eslint-disable-next-line no-underscore-dangle
  return obj && obj.__esModule ? obj : { default: obj };
}

function noop() {}

function Empty() {
  return null;
}

class LazyDecorated extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleLoading = this.handleLoading.bind(this);
    this.renderComponent = this.renderComponent.bind(this);
    this.state = {
      Component: null
    };
  }

  handleLoading() {
    const { getComponent, lazyProps } = this.props;
    const { onLoading = noop } = lazyProps;
    return Promise.resolve()
      .then(() => getComponent())
      .then(c => {
        const Component = interopRequireDefault(c).default || Empty;
        this.setState({
          Component
        });
        return onLoading();
      });
  }

  renderComponent(status, props) {
    const { Component } = this.state;
    const { lazyProps } = this.props;
    const { render } = lazyProps;
    if (typeof render === 'function') {
      return render(status, props, Component);
    }
    if (!Component || status !== 'loaded') return null;
    return <Component {...props} />;
  }

  render() {
    const { lazyProps, ownProps } = this.props;
    return (
      <Lazy
        {...ownProps}
        {...lazyProps}
        render={this.renderComponent}
        onLoading={this.handleLoading}
      />
    );
  }
}

LazyDecorated.propTypes = {
  getComponent: PropTypes.func.isRequired,
  lazyProps: PropTypes.object.isRequired,
  ownProps: PropTypes.object.isRequired
};

const lazy = opts => WrappedComponent => {
  const { getComponent, ...lazyProps } = opts;
  const Component = ownProps => (
    <LazyDecorated
      getComponent={
        getComponent === 'function' ? getComponent : () => WrappedComponent
      }
      lazyProps={lazyProps}
      ownProps={ownProps}
    />
  );
  Component.WrappedComponent = WrappedComponent;
  hoistNonReactStatics(Component, WrappedComponent);
  return Component;
};

export default lazy;

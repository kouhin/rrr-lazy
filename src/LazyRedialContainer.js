import React from 'react';

export default class LazyRedialContainer extends React.Component {
  static propTypes = {
    children: React.PropTypes.node.isRequired,
  };

  static contextTypes = {
    lazyRedialContext: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
    };
    this.loadComponent = this.loadComponent.bind(this);
  }

  loadComponent(components, force = true) {
    const lazyRedialContext = this.context.lazyRedialContext;
    this.setState({
      loading: true,
    });
    return lazyRedialContext.runHooks(
      lazyRedialContext.hooks,
      components,
      this.props,
      force,
    ).then(lazyRedialContext.onLazyCompleted)
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch(err => {
        lazyRedialContext.onLazyError(err, components);
        this.setState({
          loading: false,
        });
      });
  }

  render() {
    const { children, ...props } = this.props;
    const { loading } = this.state;
    return React.cloneElement(children, {
      ...props,
      lazyLoading: loading,
      loadComponent: this.loadComponent,
    });
  }
}

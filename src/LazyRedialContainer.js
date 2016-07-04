import React from 'react';

export default class LazyRedialContainer extends React.Component {
  static propTypes = {
    children: React.PropTypes.node.isRequired,
    onLazyCompleted: React.PropTypes.func,
    onLazyError: React.PropTypes.func,
    onLazyStarted: React.PropTypes.func,
  };

  static defaultProps = {
    onLazyError(err, type) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(type, err);
      }
    },
    onLazyStarted() {
      if (process.env.NODE_ENV !== 'production') {
        console.info('Loading started.');
      }
    },
    onLazyCompleted() {
      if (process.env.NODE_ENV !== 'production') {
        console.info('Loading completed');
      }
    },
  };

  static contextTypes = {
    redialContext: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
    };
    this.loadLazyComponent = this.loadLazyComponent.bind(this);
  }

  loadLazyComponent(components) {
    const {
      triggerComponent,
      blocking = [],
      defer = [],
    } = this.context.redialContext;
    const hooks = [].concat(blocking, defer);

    this.setState({
      loading: true,
    });
    this.props.onLazyStarted(components);
    return triggerComponent(components, hooks)
      .then(() => {
        this.setState({ loading: false });
        this.props.onLazyCompleted();
      }).catch(err => {
        this.setState({ loading: false });
        this.props.onLazyError(err);
      });
  }

  render() {
    const { children, ...props } = this.props;
    const { loading } = this.state;
    return React.cloneElement(children, {
      ...props,
      lazyLoading: loading,
      loadLazyComponent: this.loadLazyComponent,
    });
  }
}

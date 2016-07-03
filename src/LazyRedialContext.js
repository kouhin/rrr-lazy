import React from 'react';
import { triggerHooks } from './triggerHooks';

export default class LazyRedialContext extends React.Component {
  static propTypes = {
    children: React.PropTypes.node,
    hooks: React.PropTypes.array,
    locals: React.PropTypes.object,
    onLazyCompleted: React.PropTypes.func,
    onLazyError: React.PropTypes.func,
    onLazyStarted: React.PropTypes.func,
  };

  static defaultProps = {
    hooks: [],
    onLazyError(err, type) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(type, err);
      }
    },
    onLazyStarted(force) {
      if (process.env.NODE_ENV !== 'production') {
        console.info('Loading started. Force:', force);
      }
    },
    onLazyCompleted() {
      if (process.env.NODE_ENV !== 'production') {
        console.info('Loading completed');
      }
    },
  };

  static childContextTypes = {
    lazyRedialContext: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      lazyRedialMap: new WeakMap(),
    };
    this.runHooks = this.runHooks.bind(this);
  }

  getChildContext() {
    return {
      lazyRedialContext: {
        lazyRedialMap: this.state.lazyRedialMap,
        hooks: this.props.hooks,
        runHooks: this.runHooks,
        onLazyCompleted: this.props.onLazyCompleted,
        onLazyError: this.props.onLazyError,
        onLazyStarted: this.props.onLazyStarted,
      },
    };
  }

  runHooks(hooks, components, props, force = false) {
    // Get deferred data, will not block route transitions
    return triggerHooks({
      hooks,
      components,
      renderProps: props,
      lazyRedialMap: this.state.lazyRedialMap,
      locals: this.props.locals,
      force,
    }).then(({ lazyRedialMap }) => {
      this.setState({
        deferredLoading: false,
        lazyRedialMap,
      });
    });
  }

  render() {
    return this.props.children;
  }
}

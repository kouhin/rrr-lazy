import React from 'react';
import PropTypes from 'prop-types';

import { getHistory } from './history';
import createIntersectionListener from './intersectionListener';

const Status = {
  Unload: 'unload',
  Loading: 'loading',
  Loaded: 'loaded'
};

export default class Lazy extends React.PureComponent {
  static propTypes = {
    autoReset: PropTypes.bool,
    render: PropTypes.func.isRequired,
    root: PropTypes.oneOfType(
      [PropTypes.string].concat(
        typeof HTMLElement === 'undefined'
          ? []
          : PropTypes.instanceOf(HTMLElement)
      )
    ),
    rootMargin: PropTypes.string,
    triggerStyle: PropTypes.object, // eslint-disable-line
    onError: PropTypes.func,
    onLoaded: PropTypes.func,
    onLoading: PropTypes.func,
    onUnload: PropTypes.func
  };

  static get defaultProps() {
    return {
      autoReset: true,
      root: null,
      rootMargin: null,
      triggerStyle: null,
      onError: null,
      onLoaded: null,
      onLoading: null,
      onUnload: null
    };
  }

  constructor(props) {
    super(props);
    this.resetState = this.resetState.bind(this);
    this.startListen = this.startListen.bind(this);
    this.stopListen = this.stopListen.bind(this);
    this.enterViewport = this.enterViewport.bind(this);
    this.state = {
      status: Status.Unload
    };
  }

  componentDidMount() {
    if (this.props.autoReset) {
      const history = getHistory();
      if (history && history.listen) {
        this.unlistenHistory = history.listen(() => {
          this.resetState();
        });
      }
    }
    this.startListen();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.status !== prevState.status &&
      this.state.status === Status.Unload
    ) {
      this.startListen();
    }
  }

  componentWillUnmount() {
    this.stopListen();
    if (this.unlistenHistory) {
      this.unlistenHistory();
      this.unlistenHistory = null;
    }
  }

  startListen() {
    if (!Lazy.intersectionListener) {
      const { root, rootMargin } = this.props;
      const opts = {};
      if (root) {
        opts.root =
          typeof root === 'string' ? document.querySelector(root) : root;
      }
      if (rootMargin) {
        opts.rootMargin = rootMargin;
      }
      Lazy.intersectionListener = createIntersectionListener(opts);
    }
    this.stopListen();
    if (this.node && !this.unlisten) {
      this.unlisten = Lazy.intersectionListener.listen(this.node, entry => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          this.stopListen();
          this.enterViewport();
        }
      });
    }
  }

  stopListen() {
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }
  }

  resetState() {
    if (this.state.status === Status.Unload) {
      return;
    }
    this.stopListen();
    this.setState({ status: Status.Unload });
    if (this.props.onUnload) {
      this.props.onUnload();
    }
  }

  enterViewport() {
    if (!this.node || this.state.status !== Status.Unload) {
      return null;
    }
    return Promise.resolve()
      .then(() => {
        if (!this.node) throw new Error('ABORT');
        this.setState({ status: Status.Loading });
        if (this.props.onLoading) {
          return this.props.onLoading();
        }
        return null;
      })
      .then(() => {
        if (!this.node) throw new Error('ABORT');
        this.setState({ status: Status.Loaded });
        if (this.props.onLoaded) {
          return this.props.onLoaded();
        }
        return null;
      })
      .catch(error => {
        if (error.message !== 'ABORT') {
          if (this.props.onError) {
            return this.props.onError(error);
          }
          throw error;
        }
        return null;
      });
  }

  render() {
    const {
      autoReset,
      root,
      rootMargin,
      render,
      triggerStyle,
      onLoaded,
      onLoading,
      onUnload,
      onError,
      ...restProps
    } = this.props;

    const triggerProps = {
      ref: node => {
        this.node = node;
      }
    };
    if (triggerStyle) {
      triggerProps.style = triggerStyle;
    }

    return (
      <>
        <div {...triggerProps} />
        {this.props.render(this.state.status, restProps)}
      </>
    );
  }
}

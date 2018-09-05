import React from 'react';
import PropTypes from 'prop-types';

import { getHistory } from './history';
import createIntersectionListener from './intersectionListener';

const Status = {
  Unload: 'unload',
  Loading: 'loading',
  Loaded: 'loaded'
};

class Lazy extends React.PureComponent {
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
    const { autoReset } = this.props;
    if (autoReset) {
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
    const { status } = this.state;
    if (status !== prevState.status && status === Status.Unload) {
      this.startListen();
    }
  }

  componentWillUnmount() {
    this.stopListen();
    if (this.unlistenHistory) {
      this.unlistenHistory();
      this.unlistenHistory = null;
    }
    if (this.node) {
      this.node = null;
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
    const { status } = this.state;
    const { onUnload } = this.props;
    if (status === Status.Unload) {
      return;
    }
    this.stopListen();
    this.setState({ status: Status.Unload });
    if (onUnload) {
      onUnload();
    }
  }

  enterViewport() {
    const { status } = this.state;
    const { onLoading, onLoaded, onError } = this.props;
    if (!this.node || status !== Status.Unload) {
      return null;
    }
    return Promise.resolve()
      .then(() => {
        if (!this.node) throw new Error('ABORT');
        this.setState({ status: Status.Loading });
        if (onLoading) {
          return onLoading();
        }
        return null;
      })
      .then(() => {
        if (!this.node) throw new Error('ABORT');
        this.setState({ status: Status.Loaded });
        if (onLoaded) {
          return onLoaded();
        }
        return null;
      })
      .catch(error => {
        if (error.message !== 'ABORT') {
          if (onError) {
            return onError(error);
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
      loaderComponent,
      loaderProps = {},
      onLoaded,
      onLoading,
      onUnload,
      onError,
      ...restProps
    } = this.props;
    const { status } = this.state;

    if (status !== Status.Loaded) {
      return React.createElement(
        loaderComponent,
        {
          ...loaderProps,
          ref: node => {
            this.node = node;
          }
        },
        render(status, restProps)
      );
    }
    return render(status, restProps);
  }
}

Lazy.propTypes = {
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
  loaderComponent: PropTypes.string,
  loaderProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onError: PropTypes.func,
  onLoaded: PropTypes.func,
  onLoading: PropTypes.func,
  onUnload: PropTypes.func
};

Lazy.defaultProps = {
  autoReset: true,
  root: null,
  rootMargin: null,
  loaderComponent: 'div',
  loaderProps: null,
  onError: null,
  onLoaded: null,
  onLoading: null,
  onUnload: null
};

export default Lazy;

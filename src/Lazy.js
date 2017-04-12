import React from 'react';
import cx from 'classnames';

import { getHistory } from './history';
import watchOnce from './watchOnce';

const Status = {
  Unload: 'unload',
  Loading: 'loading',
  Loaded: 'loaded',
};

export default class Lazy extends React.PureComponent {

  static propTypes = {
    autoReset: React.PropTypes.bool,
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    mode: React.PropTypes.oneOf(['container', 'placeholder']),
    offset: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string,
    ]),
    placeholder: React.PropTypes.func,
    reloadLazyComponent: React.PropTypes.func,
    resetLazyComponent: React.PropTypes.func,
    style: React.PropTypes.object, // eslint-disable-line react/forbid-prop-types
    visibleClassName: React.PropTypes.string,
    onContentVisible: React.PropTypes.func,
  };

  static get defaultProps() {
    return {
      autoReset: true,
      children: null,
      className: '',
      mode: 'placeholder',
      offset: '0px',
      onContentVisible: () => null,
      placeholder: null,
      reloadLazyComponent: () => null,
      resetLazyComponent: () => null,
      style: null,
      visibleClassName: 'isVisible',
    };
  }

  constructor(props) {
    super(props);

    this.resetState = this.resetState.bind(this);
    this.startWatch = this.startWatch.bind(this);
    this.stopWatch = this.stopWatch.bind(this);
    this.enterViewport = this.enterViewport.bind(this);

    if (!!props.children && React.Children.count(props.children) > 1) {
      console.warn('[rrr-lazy] Only one child is allowed');
    }

    this.state = {
      status: Status.Unload,
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
    this.startWatch();
  }

  componentWillUnmount() {
    this.stopWatch();
    if (this.unlistenHistory) {
      this.unlistenHistory();
      this.unlistenHistory = null;
    }
  }

  startWatch() {
    if (this.node) {
      this.unwatch = watchOnce(this.node, this.props.offset, this.enterViewport);
    }
  }

  stopWatch() {
    if (this.unwatch) {
      this.unwatch();
    }
  }

  resetState() {
    if (this.state.status === Status.Unload) {
      return;
    }
    this.stopWatch();
    this.props.resetLazyComponent();
    this.setState({
      status: Status.Unload,
    }, () => {
      setTimeout(this.startWatch);
    });
  }

  enterViewport() {
    this.stopWatch();
    if (!this.node || this.state.status !== Status.Unload) {
      return;
    }
    if (typeof this.props.reloadLazyComponent !== 'function') {
      this.setState({ status: Status.Loaded }, this.props.onContentVisible);
      return;
    }
    new Promise((resolve, reject) => {
      if (!this.node) {
        reject('ABORT');
        return;
      }
      this.setState({ status: Status.Loading }, resolve);
    })
      .then(() => {
        if (!this.node) return Promise.reject('ABORT');
        return this.props.reloadLazyComponent();
      })
      .then(() => {
        if (!this.node) return Promise.reject('ABORT');
        return this.setState({ status: Status.Loaded }, this.props.onContentVisible);
      })
      .catch((error) => {
        if (error !== 'ABORT') {
          console.error(error);
        }
      });
  }

  renderPlaceholder(children, status) {
    if (this.props.placeholder) {
      return React.cloneElement(
        this.props.placeholder(children, status),
        {
          ref: (node) => { this.node = node; },
        },
      );
    }

    return (
      <div
        className={cx(
          'LazyLoad',
          status === Status.Unload ? null : this.props.visibleClassName,
          this.props.className,
        )}
        ref={(node) => { this.node = node; }}
        style={this.props.style}
      >
        {children}
      </div>
    );
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      autoReset,
      children,
      className,
      mode,
      offset,
      reloadLazyComponent,
      resetLazyComponent,
      style,
      visibleClassName,
      onContentVisible,
    } = this.props;
    /* eslint-enable no-unused-vars */
    const status = this.state.status;
    // Unload
    if (status === Status.Unload) {
      return this.renderPlaceholder(null, status);
    }
    // Loading
    if (status === Status.Loading) {
      return this.renderPlaceholder(
        children,
        status,
      );
    }
    // Loaded
    return mode === 'container' ? this.renderPlaceholder(children, status) : children;
  }
}

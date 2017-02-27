import React from 'react';
import cx from 'classnames';
import scrollMonitor from 'scrollmonitor';

import { getHistory } from './history';

const Status = {
  Unload: 'unload',
  Loading: 'loading',
  Loaded: 'loaded',
};

export default class Lazy extends React.Component {

  static propTypes = {
    autoReset: React.PropTypes.boolean,
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    elementType: React.PropTypes.string,
    initStyle: React.PropTypes.object, // eslint-disable-line react/forbid-prop-types
    mode: React.PropTypes.oneOf(['container', 'placeholder']),
    offset: React.PropTypes.number,
    offsetBottom: React.PropTypes.number,
    offsetHorizontal: React.PropTypes.number,
    offsetLeft: React.PropTypes.number,
    offsetRight: React.PropTypes.number,
    offsetTop: React.PropTypes.number,
    offsetVertical: React.PropTypes.number,
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
      elementType: 'div',
      initStyle: null,
      mode: 'placeholder',
      offset: 0,
      offsetBottom: 0,
      offsetHorizontal: 0,
      offsetLeft: 0,
      offsetRight: 0,
      offsetTop: 0,
      offsetVertical: 0,
      onContentVisible: () => null,
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

    this.placeHolder = React.createElement(
      props.elementType,
      {
        ref: node => (this.node = node),
      },
    );

    if (!!props.children && React.Children.count(props.children) > 1) {
      console.warn('[rrr-lazy] Only one child is allowed');
    }

    this.state = {
      status: Status.Unload,
    };
  }

  componentDidMount() {
    const history = getHistory();
    if (history && history.listenBefore) {
      this.unlistenHistory = history.listen(() => {
        this.resetState();
      });
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

  getOffsets() {
    const {
      offset, offsetVertical, offsetHorizontal,
      offsetTop, offsetBottom, offsetLeft, offsetRight,
    } = this.props;

    const realOffsetAll = offset;
    const realOffsetVertical = offsetVertical || realOffsetAll;
    const realOffsetHorizontal = offsetHorizontal || realOffsetAll;

    return {
      top: offsetTop || realOffsetVertical,
      bottom: offsetBottom || realOffsetVertical,
      left: offsetLeft || realOffsetHorizontal,
      right: offsetRight || realOffsetHorizontal,
    };
  }

  startWatch() {
    if (!this.watcher) {
      this.watcher = scrollMonitor.create(this.node, this.getOffsets());
      this.watcher.enterViewport(this.enterViewport);
    }
    return this.watcher;
  }

  stopWatch() {
    if (this.watcher) {
      this.watcher.destroy();
      this.watcher = null;
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
      this.startWatch();
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
    Promise.all([
      new Promise((resolve) => {
        this.setState({ status: Status.Loading }, resolve);
      }),
      this.props.reloadLazyComponent(),
    ])
      .then(() => {
        this.setState({ status: Status.Loaded }, this.props.onContentVisible);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      autoReset,
      children,
      className,
      elementType,
      initStyle,
      mode,
      offset,
      offsetBottom,
      offsetHorizontal,
      offsetLeft,
      offsetRight,
      offsetTop,
      offsetVertical,
      reloadLazyComponent,
      resetLazyComponent,
      style,
      visibleClassName,
      onContentVisible,
      ...restProps
    } = this.props;
    /* eslint-enable no-unused-vars */

    const status = this.state.status;

    // Unload
    if (status === Status.Unload) {
      return React.cloneElement(
        this.placeHolder,
        {
          ...restProps,
          className: cx('LazyLoad', className),
          style: initStyle || style,
        },
      );
    }

    // Loading
    if (status === Status.Loading) {
      return React.cloneElement(
        this.placeHolder,
        {
          ...restProps,
          className: cx('LazyLoad', className),
          style: initStyle,
        },
        children === null ? null : React.cloneElement(children, restProps),
      );
    }

    // Loaded
    if (mode === 'container') {
      return React.cloneElement(
        this.placeHolder,
        {
          ...restProps,
          className: cx('LazyLoad', className, visibleClassName),
          style,
        },
        children === null ? null : React.cloneElement(children, restProps),
      );
    }
    return children === null ? null : React.cloneElement(children, restProps);
  }
}

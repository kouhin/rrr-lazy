import React from 'react';
import ReactDOM from 'react-dom';
import { add, remove } from 'eventlistener';
import lodashDebounce from 'lodash/debounce';
import lodashThrottle from 'lodash/throttle';
import cx from 'classnames';

import parentScroll from './utils/parentScroll';
import inViewport from './utils/inViewport';

export class Lazy extends React.Component {

  static propTypes = {
    children: React.PropTypes.node.isRequired,
    className: React.PropTypes.string,
    debounce: React.PropTypes.bool,
    elementType: React.PropTypes.string,
    initStyle: React.PropTypes.object,
    mode: React.PropTypes.oneOf(['container', 'placeholder']),
    offset: React.PropTypes.number,
    offsetBottom: React.PropTypes.number,
    offsetHorizontal: React.PropTypes.number,
    offsetLeft: React.PropTypes.number,
    offsetRight: React.PropTypes.number,
    offsetTop: React.PropTypes.number,
    offsetVertical: React.PropTypes.number,
    reloadLazyComponent: React.PropTypes.func,
    style: React.PropTypes.object,
    threshold: React.PropTypes.number,
    throttle: React.PropTypes.number,
    visibleClassName: React.PropTypes.string,
    onContentVisible: React.PropTypes.func,
  };

  static defaultProps = {
    debounce: false,
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
    reloadLazyComponent: () => null,
    style: null,
    throttle: 250,
    visibleClassName: 'isVisible',
  };

  static contextTypes = {
    routerHookContext: React.PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.lazyLoadHandler = this.lazyLoadHandler.bind(this);

    if (props.throttle > 0) {
      if (props.debounce) {
        this.lazyLoadHandler = lodashDebounce(this.lazyLoadHandler, props.throttle);
      } else {
        this.lazyLoadHandler = lodashThrottle(this.lazyLoadHandler, props.throttle);
      }
    }

    if (React.Children.count(props.children) > 1) {
      console.warn('[rrr-lazy] Only one child is allowed');
    }

    this.state = {
      visible: false,
      mounted: false,
    };
  }

  componentDidMount() {
    const eventNode = this.getEventNode();

    this.lazyLoadHandler();

    if (this.lazyLoadHandler.flush) {
      this.lazyLoadHandler.flush();
    }

    add(window, 'resize', this.lazyLoadHandler);
    add(eventNode, 'scroll', this.lazyLoadHandler);
  }

  componentWillReceiveProps() {
    if (!this.state.visible) {
      this.lazyLoadHandler();
    }
  }

  componentWillUnmount() {
    if (this.lazyLoadHandler.cancel) {
      this.lazyLoadHandler.cancel();
    }
    this.detachListeners();
  }

  getEventNode() {
    return parentScroll(ReactDOM.findDOMNode(this));
  }

  getOffset() {
    const {
      offset, offsetVertical, offsetHorizontal,
      offsetTop, offsetBottom, offsetLeft, offsetRight, threshold,
    } = this.props;

    const realOffsetAll = threshold || offset;
    const realOffsetVertical = offsetVertical || realOffsetAll;
    const realOffsetHorizontal = offsetHorizontal || realOffsetAll;

    return {
      top: offsetTop || realOffsetVertical,
      bottom: offsetBottom || realOffsetVertical,
      left: offsetLeft || realOffsetHorizontal,
      right: offsetRight || realOffsetHorizontal,
    };
  }

  lazyLoadHandler() {
    if (!this.state.visible) {
      const offset = this.getOffset();
      const node = ReactDOM.findDOMNode(this);
      const eventNode = this.getEventNode();
      if (node && eventNode && inViewport(node, eventNode, offset)) {
        this.detachListeners();
        this.setState({ visible: true });
        if (this.props.reloadLazyComponent &&
          typeof this.props.reloadLazyComponent === 'function') {
          Promise.resolve()
            .then(() => this.props.reloadLazyComponent())
            .then(() => {
              this.setState({ mounted: true }, () => {
                if (this.props.onContentVisible) {
                  this.props.onContentVisible();
                }
              });
            })
            .catch(error => {
              console.error(error);
            });
        } else {
          this.setState({ mounted: true }, () => {
            if (this.props.onContentVisible) {
              this.props.onContentVisible();
            }
          });
        }
      }
    }
  }

  detachListeners() {
    const eventNode = this.getEventNode();
    remove(window, 'resize', this.lazyLoadHandler);
    remove(eventNode, 'scroll', this.lazyLoadHandler);
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      children,
      className,
      debounce,
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
      style,
      threshold,
      throttle,
      visibleClassName,
      onContentVisible,
      ...restProps,
    } = this.props;
    /* eslint-enable no-unused-vars */

    const { visible, mounted } = this.state;

    const elClasses = cx('LazyLoad', this.props.className, {
      [this.props.visibleClassName]: visible && mounted,
    });

    const placeHolderProps = {
      ...restProps,
      className: elClasses,
    };

    if (!visible) {
      return React.createElement(
        elementType,
        {
          ...placeHolderProps,
          style: initStyle || style,
        }
      );
    }

    const child = React.cloneElement(children, restProps);

    if (mode === 'container' || !this.state.mounted) {
      return React.createElement(
        this.props.elementType,
        {
          ...placeHolderProps,
          style: this.state.mounted ? style : initStyle,
        },
        child
      );
    }
    return child;
  }
}

import React from 'react';
import { add, remove } from 'eventlistener';
import lodashDebounce from 'lodash/debounce';
import lodashThrottle from 'lodash/throttle';
import cx from 'classnames';
import shallowCompare from 'react-addons-shallow-compare';

import parentScroll from './utils/parentScroll';
import inViewport from './utils/inViewport';

export default class Lazy extends React.Component {

  static propTypes = {
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    Component: React.PropTypes.object, // eslint-disable-line react/forbid-prop-types
    debounce: React.PropTypes.bool,
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
    style: React.PropTypes.object, // eslint-disable-line react/forbid-prop-types
    threshold: React.PropTypes.number,
    throttle: React.PropTypes.number,
    visibleClassName: React.PropTypes.string,
    onContentVisible: React.PropTypes.func,
  };

  static get defaultProps() {
    return {
      children: null,
      className: '',
      Component: null,
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
      onContentVisible: () => null,
      reloadLazyComponent: () => null,
      style: null,
      threshold: 0,
      throttle: 250,
      visibleClassName: 'isVisible',
    };
  }

  static contextTypes = {
    routerHookContext: React.PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.lazyLoadHandler = this.lazyLoadHandler.bind(this);
    this.placeHolder = React.createElement(
      props.elementType,
      {
        ref: node => (this.node = node),
      },
    );

    if (props.throttle > 0) {
      if (props.debounce) {
        this.lazyLoadHandler = lodashDebounce(this.lazyLoadHandler, props.throttle);
      } else {
        this.lazyLoadHandler = lodashThrottle(this.lazyLoadHandler, props.throttle);
      }
    }

    if (!!props.children && React.Children.count(props.children) > 1) {
      console.warn('[rrr-lazy] Only one child is allowed');
    }

    this.state = {
      visible: false,
      mounted: false,
    };
  }

  componentDidMount() {
    this.lazyLoadHandler();
    if (this.lazyLoadHandler.flush) {
      this.lazyLoadHandler.flush();
    }
    add(window, 'resize', this.lazyLoadHandler);
    add(this.getEventNode(), 'scroll', this.lazyLoadHandler);
  }

  componentWillReceiveProps() {
    if (!this.state.visible) {
      this.lazyLoadHandler();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillUnmount() {
    if (this.lazyLoadHandler.cancel) {
      this.lazyLoadHandler.cancel();
    }
    this.detachListeners();
  }

  getEventNode() {
    if (!this.eventNode) {
      this.eventNode = parentScroll(this.node);
    }
    return this.eventNode;
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

  lazyLoadHandler(e) {
    if (!this.state.visible) {
      const offset = this.getOffset();
      if (!this.node) {
        return;
      }
      const eventNode = this.getEventNode();
      const isInviewport = inViewport(this.node, eventNode, offset);
      if ((!e || (e.type !== 'resize' && e.type !== 'scroll')) && !isInviewport) {
        return;
      }
      if (this.node && eventNode && inViewport(this.node, eventNode, offset)) {
        this.detachListeners();
        this.setState({ visible: true });
        if (this.props.reloadLazyComponent &&
          typeof this.props.reloadLazyComponent === 'function') {
          Promise.resolve()
            .then(() => this.props.reloadLazyComponent())
            .then(() => {
              this.setState({ mounted: true }, () => {
                if (this.props.onContentVisible) {
                  setTimeout(() => {
                    this.props.onContentVisible();
                  });
                }
              });
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          this.setState({ mounted: true }, () => {
            if (this.props.onContentVisible) {
              setTimeout(() => {
                this.props.onContentVisible();
              });
            }
          });
        }
      }
    }
  }

  detachListeners() {
    remove(window, 'resize', this.lazyLoadHandler);
    remove(this.getEventNode(), 'scroll', this.lazyLoadHandler);
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      children,
      className,
      Component,
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
      ...restProps
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
      return React.cloneElement(
        this.placeHolder,
        {
          ...placeHolderProps,
          style: initStyle || style,
        },
      );
    }

    if (!this.children) {
      if (children) {
        this.children = children;
      } else if (Component) {
        this.children = <Component />;
      } else {
        this.children = null;
      }
    }

    if (!this.children) {
      return null;
    }

    const child = React.cloneElement(this.children, restProps);

    if (mode === 'container' || !this.state.mounted) {
      return React.cloneElement(
        this.placeHolder,
        {
          ...placeHolderProps,
          style: this.state.mounted ? style : initStyle,
        },
        child,
      );
    }
    return child;
  }
}

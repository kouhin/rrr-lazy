import React from 'react';
import ReactDOM from 'react-dom';
import { add, remove } from 'eventlistener';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
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
        this.lazyLoadHandler = debounce(this.lazyLoadHandler, props.throttle);
      } else {
        this.lazyLoadHandler = throttle(this.lazyLoadHandler, props.throttle);
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

  shouldComponentUpdate(_nextProps, nextState) {
    return this.state.visible !== nextState.visible ||
      this.state.mounted !== nextState.mounted;
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
        if (this.context.routerHookContext) {
          const {
            reloadComponent,
          } = this.context.routerHookContext;
          reloadComponent(this.props.children.type)
            .then(() => {
              this.setState({ mounted: true }, () => {
                if (this.props.onContentVisible) {
                  this.props.onContentVisible();
                }
              });
            }).catch(err => {
              console.error(err);
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
    const restProps = {};
    Object.keys(this.props).filter(k => !Lazy.propTypes[k]).forEach(k => {
      restProps[k] = this.props[k];
    });

    const { visible, mounted } = this.state;
    const elClasses = cx('LazyLoad', this.props.className, {
      [this.props.visibleClassName]: visible && mounted,
    });

    const props = {
      ...restProps,
      className: elClasses,
    };

    const initStyle = this.props.initStyle || this.props.style;

    if (!visible) {
      return React.createElement(
        this.props.elementType,
        {
          ...props,
          style: initStyle,
        }
      );
    }

    const child = this.props.children;

    if (this.props.mode === 'container') {
      return React.createElement(
        this.props.elementType,
        {
          ...props,
          style: this.state.mounted ? props.style : initStyle,
        },
        child
      );
    }

    if (!this.state.mounted) {
      return React.createElement(
        this.props.elementType,
        {
          ...props,
          style: initStyle,
        },
        child
      );
    }
    return child;
  }
}

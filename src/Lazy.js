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
    mode: React.PropTypes.oneOf(['container', 'placeholder']),
    offset: React.PropTypes.number,
    offsetBottom: React.PropTypes.number,
    offsetHorizontal: React.PropTypes.number,
    offsetLeft: React.PropTypes.number,
    offsetRight: React.PropTypes.number,
    offsetTop: React.PropTypes.number,
    offsetVertical: React.PropTypes.number,
    style: React.PropTypes.object,
    threshold: React.PropTypes.number,
    throttle: React.PropTypes.number,
    onContentVisible: React.PropTypes.func,
  };

  static defaultProps = {
    debounce: false,
    elementType: 'div',
    mode: 'placeholder',
    offset: 0,
    offsetBottom: 0,
    offsetHorizontal: 0,
    offsetLeft: 0,
    offsetRight: 0,
    offsetTop: 0,
    offsetVertical: 0,
    placeHolderMode: 'once',
    throttle: 250,
  };

  static contextTypes = {
    redialContext: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);

    this.lazyLoadHandler = this.lazyLoadHandler.bind(this);

    if (props.throttle > 0) {
      if (props.debounce) {
        this.lazyLoadHandler = debounce(this.lazyLoadHandler, props.throttle);
      } else {
        this.lazyLoadHandler = throttle(this.lazyLoadHandler, props.throttle);
      }
    }

    this.state = { visible: false };
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
    return nextState.visible;
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
    const offset = this.getOffset();
    const node = ReactDOM.findDOMNode(this);
    const eventNode = this.getEventNode();

    if (node && eventNode && inViewport(node, eventNode, offset)) {
      const { onContentVisible } = this.props;

      this.setState({ visible: true });
      this.detachListeners();

      if (onContentVisible) {
        onContentVisible();
      }
    }
  }

  detachListeners() {
    const eventNode = this.getEventNode();

    remove(window, 'resize', this.lazyLoadHandler);
    remove(eventNode, 'scroll', this.lazyLoadHandler);
  }

  render() {
    const {
      children,
      className,
      elementType,
      mode,
      ...restProps,
    } = this.props;

    const { visible } = this.state;
    const elClasses = cx('LazyLoad', className, {
      isVisible: visible,
      isLoading: this.context.redialContext &&
        this.context.redialContext.loading,
      isDeferredLoading: this.contextTypes.redialContext &&
        this.context.redialContext.deferredLoading,
    });
    const props = {
      ...restProps,
      className: elClasses,
    };
    if (!visible) {
      return React.createElement(
        elementType,
        props
      );
    }
    if (mode === 'container') {
      return React.createElement(
        elementType,
        props,
        children
      );
    }
    return children;
  }
}

import React from 'react';
import ReactDOM from 'react-dom';
import { add, remove } from 'eventlistener';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

import parentScroll from './utils/parentScroll';
import inViewport from './utils/inViewport';

export class Lazy extends React.Component {

  static propTypes = {
    children: React.PropTypes.node.isRequired,
    className: React.PropTypes.string,
    debounce: React.PropTypes.bool,
    offset: React.PropTypes.number,
    offsetBottom: React.PropTypes.number,
    offsetHorizontal: React.PropTypes.number,
    offsetLeft: React.PropTypes.number,
    offsetRight: React.PropTypes.number,
    offsetTop: React.PropTypes.number,
    offsetVertical: React.PropTypes.number,
    placeholder: React.PropTypes.node,
    style: React.PropTypes.object,
    threshold: React.PropTypes.number,
    throttle: React.PropTypes.number,
    onContentVisible: React.PropTypes.func,
  };

  static defaultProps = {
    debounce: false,
    offset: 0,
    offsetBottom: 0,
    offsetHorizontal: 0,
    offsetLeft: 0,
    offsetRight: 0,
    offsetTop: 0,
    offsetVertical: 0,
    throttle: 250,
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

    if (inViewport(node, eventNode, offset)) {
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
    const { children, className, style } = this.props;
    const { visible } = this.state;
    const elClasses = [
      'LazyLoad',
      ...((className || '').split(/\s+/).filter(v => v)),
    ].join(' ');
    return visible ? children : (
      this.props.placeholder || <div className={elClasses} style={style} />
    );
  }
}

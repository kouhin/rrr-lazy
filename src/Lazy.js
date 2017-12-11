import React from 'react';
import PropTypes from 'prop-types';

import { getHistory } from './history';
import watchOnce from './watchOnce';

const Status = {
  Unload: 'unload',
  Loading: 'loading',
  Loaded: 'loaded'
};

export default class Lazy extends React.PureComponent {
  static propTypes = {
    autoReset: PropTypes.bool,
    offset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    render: PropTypes.func,
    triggerStyle: PropTypes.object, // eslint-disable-line
    onError: PropTypes.func,
    onLoaded: PropTypes.func,
    onLoading: PropTypes.func,
    onUnload: PropTypes.func
  };

  static get defaultProps() {
    return {
      autoReset: true,
      offset: '0px',
      render: null,
      triggerStyle: null,
      onError: () => null,
      onLoaded: () => null,
      onLoading: () => null,
      onUnload: () => null
    };
  }

  constructor(props) {
    super(props);
    this.resetState = this.resetState.bind(this);
    this.startWatch = this.startWatch.bind(this);
    this.stopWatch = this.stopWatch.bind(this);
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
      this.unwatch = watchOnce(
        this.node,
        this.props.offset,
        this.enterViewport
      );
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
    this.props.onUnload();
    this.setState({ status: Status.Unload }, this.startWatch);
  }

  enterViewport() {
    this.stopWatch();
    if (!this.node || this.state.status !== Status.Unload) {
      return null;
    }
    return Promise.resolve()
      .then(() => {
        if (!this.node) throw new Error('ABORT');
        this.setState({ status: Status.Loading });
        return this.props.onLoading();
      })
      .then(() => {
        if (!this.node) throw new Error('ABORT');
        this.setState({ status: Status.Loaded });
        return this.props.onLoaded();
      })
      .catch(error => {
        if (error.message !== 'ABORT') {
          this.props.onError();
        }
      });
  }

  render() {
    const {
      autoReset,
      offset,
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

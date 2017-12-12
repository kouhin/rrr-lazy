rrr-lazy
=========================

Lazy load component with react && react-router && react-router-hook.

[![CircleCI](https://circleci.com/gh/kouhin/rrr-lazy/tree/master.svg?style=svg)](https://circleci.com/gh/kouhin/rrr-lazy/tree/master)
[![dependency status](https://david-dm.org/kouhin/rrr-lazy.svg?style=flat-square)](https://david-dm.org/kouhin/rrr-lazy)

## Installationg
rrr-lazy requires **React 16.2.0 or later.**

For npm:
```
npm install rrr-lazy
```

For yarn:

```
yarn add rrr-lazy
```

## Usage

```javascript
import React from 'react';
import { Lazy } from 'rrr-lazy';

const MyComponent = () => (
  <div>
    Scroll to load images.
    <div className="filler" />
    <Lazy
      offset={300}
      render={(status) => (
        <img
          style={{ height: 762, width: 1024 }}
          src={ status === 'loaded' ? 'http://apod.nasa.gov/apod/image/1502/HDR_MVMQ20Feb2015ouellet1024.jpg' : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"/>')}`}
        />
      )}
    />
    <div className="filler" />
    <Lazy
      offset="200px 0px 0px 0px"
      render={(status) => (
        <img
          style={{ height: 683, width: 1024 }}
          src={ status === 'loaded' ? 'http://apod.nasa.gov/apod/image/1502/2015_02_20_conj_bourque1024.jpg' : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"/>')}`}
        />
      )}
    />
    <div className="filler" />
    <Lazy
      offset="0px 50px"
      render={(status) => (
        <img
          style={{ height: 480, width: 480 }}
          src={ status === 'loaded' ? 'http://apod.nasa.gov/apod/image/1502/MarsPlume_jaeschke_480.gif' : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"/>')}`}
        />
      )}
    />
    <div className="filler" />
    <Lazy
      style={{ height: 720 }}
      onLoading={async () => console.log('Loading!')}
      onLoaded={() => console.log('Loaded!')}
      onUnload={() => console.log('Unload!')}
      onError={() => console.log('Error!')}
      render={(status) => (
        <img
          style={{ height: 480, width: 480 }}
          src={ status === 'loaded' ? 'http://apod.nasa.gov/apod/image/1502/ToadSky_Lane_1080_annotated.jpg' : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"/>')}`}
        />
      )}
    />
    <div className="filler" />
  </div>
);
```

It also provides a decorator for better support for lazy data loading with react-router, react-router-hook.

```jsx
import React from 'react';
import { lazy } from 'rrr-lazy';
import { routerHooks } from 'react-router-hook';

@lazy({
  render: (status, props, Component) => {
    if (status === 'unload') {
      return <div style={{ height: 720 }}>Unload</div>;
    } else if (status === 'loading') {
      return <div style={{ height: 720 }}>Loading</div>;
    } else {
      return <Component {...props} />;
    }
  },
  onLoaded: () => console.log('look ma I have been lazyloaded!')
})
@routerHooks({
  fetch: async () => {
    await fetchData();
  },
  defer: async () => {
    await fetchDeferredData();
  },
})
class MyComponent extends React.Component {
  render() {
    return (
      <div>
        <img src='http://apod.nasa.gov/apod/image/1502/HDR_MVMQ20Feb2015ouellet1024.jpg' />
      </div>
    );
  }
}
```

It's very useful when you want to specify the lazy loading component in react-router configuration.

```jsx
import { browserHistory, Router } from 'react-router';
import { useRouterHook, routerHooks } from 'react-router-hook';

import { lazy } from 'rrr-lazy';

const locals = {
  dispatch: store.dispatch, // redux store and dispatch, you can use any locals
  getState: store.getState,
};

const onAborted = () => {
  console.info('aborted');
};
const onCompleted = () => {
  console.info('completed');
};
const onError = (error) => {
  console.error(error);
};

const routerHookMiddleware = useRouterHook({
  locals,
  routerWillEnterHooks: ['fetch'],
  routerDidEnterHooks: ['defer', 'done'],
  onAborted,
  onStarted,
  onCompleted,
  onError,
});
ReactDOM.render((
  <Router
    history={browserHistory}
    render={applyRouterMiddleware(routerHookMiddleware)}
  >
    <Route path="/" component={App}>
      <Route
        path="users"
        components={{
          main: Users,
          footer: lazy({ render: (status, props, Component) => (
            status === 'loaded' ? (
              <div style={{ height: 500 }} />
            ) : (
              <Component {...props} />
            )
          )})(UserFooter)
        }}
      />
    </Route>
  </Router>
), node)
class App extends React.Component {
  render() {
    // the matched child route components become props in the parent
    return (
      <div>
        <div className="Main">
          {/* this will either be <Groups> or <Users> */}
          {this.props.main}
        </div>
        <div className="Footer">
          {/* this will either be <GroupsSidebar> or <UsersSidebar> */}
          {this.props.footer}
        </div>
      </div>
    )
  }
}

@routerHooks({
  fetch: async () => {
    await fetchData();
  },
  defer: async () => {
    await fetchDeferredData();
  },
})
class Users extends React.Component {
  render() {
    return (
      <div>
        {/* if at "/users/123" this will be <Profile> */}
        {/* UsersSidebar will also get <Profile> as this.props.children.
            You can pick where it renders */}
        {this.props.children}
      </div>
    )
  }
}

@routerHooks({
  fetch: async () => {
    await fetchData();
  },
  defer: async () => {
    await fetchDeferredData();
  },
})
class UserFooter extends React.Component {
  render() {
    return (
      <div>
        UserFooter
      </div>
    )
  }
}
```


## API: `Lazy` component

### Props

#### autoReset
Type: `Boolean` Default: `true`

Auto reset Lazy component when url changed (history must be set by `setHistory`, see below).

#### offset
Type: `Number|String` Default: `0px`

The `offset` option allows you to specify how far below, above, to the left, and to the right of the viewport you want to _begin_ displaying your content. When `offset` is a string, it must be a DOMString and followed by "%" or "px", e.g. `500px 0px`.

This value will be used as rootMargin for IntersectionObserver (See [rootMargin](https://wicg.github.io/IntersectionObserver/#dom-intersectionobserver-rootmargin).

If you specify a number, such as `100`, then it will be formatted as `100px 0px`.

#### render()

#### triggerStyle

#### onError()

#### onLoaded()

#### onLoading()

#### onUnload()

## API: @lazy

Usage:

``` javascript
@routerHooks({
  fetch: async () => {
    await fetchData();
  },
  defer: async () => {
    await fetchDeferredData();
  },
})
@lazy({
  render: (status, props, Component) => {
    if (status === 'unload') {
      return <div style={{ height: 720 }}>Unload</div>;
    } else if (status === 'loading') {
      return <div style={{ height: 720 }}>Loading</div>;
    } else {
      return <Component {...props} />;
    }
  },
  onLoaded: () => console.log('look ma I have been lazyloaded!')
})
class MyComponent extends React.Component {
  render() {
    return (
      <div>
        <img src='http://apod.nasa.gov/apod/image/1502/HDR_MVMQ20Feb2015ouellet1024.jpg' />
      </div>
    );
  }
}
```

Or

``` javascript
class MyComponent extends React.Component {
  render() {
    return (
      <div>
        <img src='http://apod.nasa.gov/apod/image/1502/HDR_MVMQ20Feb2015ouellet1024.jpg' />
      </div>
    );
  }
}
const myComponent = lazy({
  render: (status, props, Component) => {
    if (status === 'unload') {
      return <div style={{ height: 720 }}>Unload</div>;
    } else if (status === 'loading') {
      return <div style={{ height: 720 }}>Loading</div>;
    } else {
      return <Component {...props} />;
    }
  },
  onLoaded: () => console.log('look ma I have been lazyloaded!')
})(MyComponent);
```

### options

#### getComponent

With webpack 2 import()

``` javascript
const myComponent = lazy({
  render: (status, props, Component) => {
    if (status === 'unload') {
      return <div style={{ height: 720 }}>Unload</div>;
    } else if (status === 'loading') {
      return <div style={{ height: 720 }}>Loading</div>;
    } else {
      return <Component {...props} />;
    }
  },
  onLoaded: () => console.log('look ma I have been lazyloaded!'),
  getComponent: () => import('./MyComponent'),
})();
```

#### render: function(status, props, Component)

## API: setHistory

Set [history](https://github.com/ReactTraining/history) instance in order to use `autoReset` feature.

rrr-lazy
=========================

Lazy load component with react && react-router && react-router-hook.

[![CircleCI](https://circleci.com/gh/kouhin/rrr-lazy/tree/master.svg?style=svg)](https://circleci.com/gh/kouhin/rrr-lazy/tree/master)
[![dependency status](https://david-dm.org/kouhin/rrr-lazy.svg?style=flat-square)](https://david-dm.org/kouhin/rrr-lazy)

## Installationg
rrr-lazy requires **React 0.14 or later.**

```
npm install --save rrr-lazy
```

## Examples
* [Basic](/examples/basic)

## Usage

```javascript
import React from 'react';
import { Lazy } from 'rrr-lazy';

const MyComponent = () => (
  <div>
    Scroll to load images.
    <div className="filler" />
    <Lazy style={{ height: 762 }} offset={300}>
      <img src='http://apod.nasa.gov/apod/image/1502/HDR_MVMQ20Feb2015ouellet1024.jpg' />
    </Lazy>
    <div className="filler" />
    <Lazy style={{ height: 683 }} offset="200px 0px 0px 0px">
      <img src='http://apod.nasa.gov/apod/image/1502/2015_02_20_conj_bourque1024.jpg' />
    </Lazy>
    <div className="filler" />
    <Lazy style={{ height: 480 }} offset="0px 50px">
      <img src='http://apod.nasa.gov/apod/image/1502/MarsPlume_jaeschke_480.gif' />
    </Lazy>
    <div className="filler" />
    <Lazy
      style={{ height: 720 }}
      onContentVisible={() => console.log('look ma I have been lazyloaded!')}
    >
      <img src='http://apod.nasa.gov/apod/image/1502/ToadSky_Lane_1080_annotated.jpg' />
    </Lazy>
    <div className="filler" />
  </div>
);
```

It also provides a decorator for better support for lazy data loading with react-router, react-router-hook.

```javascript
import React from 'react';
improt { lazy } from 'rrr-lazy';
import { routerHooks } from 'react-router-hook';

@lazy({
  style: {
    height: 720,
  },
  onContentVisible: () => console.log('look ma I have been lazyloaded!')
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

```javascript
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
      <Route path="users" components={{main: Users, footer: lazy({ style: { height: 500 } })(UserFooter)}} />
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

#### placeholder(children, status)
Type: `Function` Default: `null`

A function to render placeholder. You can use this property to customize the placeholder. It receives a children and status. The valid value of status is one of `unload|loading|loaded`.

### className
Type: `string`

The className of Lazy component.

### mode
Type: `placeholder` | `container` Default: `placeholder`

`placeholder` mode: Once your content is loaded, placeholder will be removed.

`container` mode: placeholder won't be removed and act as a container when your content are loaded.

### visibleClassName
Type: `string` Default: `isVisible`

The className that used in **container** mode when component is visible.

The className of placeholder that used in **container** mode during deferred by react-router-hook.

### onContentVisible
Type `Function`

A callback function to execute when the content appears on the screen.

### Other Props

Other props will be delegated to placeholder.

## API: @lazy

Usage:

``` javascript
@lazy({
  style: {
    height: 720,
  },
  onContentVisible: () => console.log('look ma I have been lazyloaded!')
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

Or

``` javascript
const myComponent = @lazy({
  style: {
    height: 720,
  },
  onContentVisible: () => console.log('look ma I have been lazyloaded!')
})(MyComponent);
```

### options

#### getComponent

When the component is null, getComponent will be used to get a component asynchronously.

``` javascript
const myComponent = @lazy({
  style: {
    height: 720,
  },
  onContentVisible: () => console.log('look ma I have been lazyloaded!')
  getComponent: (cb) => {
    cb(MyComponent);
  },
})();
```

With bundle-loader.

``` javascript
const myComponent = @lazy({
  style: {
    height: 720,
  },
  onContentVisible: () => console.log('look ma I have been lazyloaded!')
  getComponent: require('bundle-loader?lazy!./MyComponent'),
})();
```

With webpack 2 import()

``` javascript
const myComponent = @lazy({
  style: {
    height: 720,
  },
  onContentVisible: () => console.log('look ma I have been lazyloaded!')
  getComponent: () => import('./MyComponent'),
})();
```

## API: setHistory

Set [history](https://github.com/ReactTraining/history) instance in order to use `autoReset` feature.

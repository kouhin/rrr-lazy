rrr-lazy
=========================

A fork of react-lazy-load and add support for react-router, react-router-redial and redial.

[![build status](https://img.shields.io/travis/kouhin/rrr-lazy.svg?style=flat-square)](https://travis-ci.org/kouhin/rrr-lazy)
[![dependency status](https://david-dm.org/kouhin/rrr-lazy.svg?style=flat-square)](https://david-dm.org/kouhin/rrr-lazy)

## Notice

This is a fork of [react-lazy-load](https://github.com/loktar00/react-lazy-load).

## Installation
rrr-lazy requires **React 0.14 or later.**

```
npm install --save rrr-lazy react-router react-router-redial redial
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
    <Lazy style={{ height: 762 }} offsetVertical={300}>
      <img src='http://apod.nasa.gov/apod/image/1502/HDR_MVMQ20Feb2015ouellet1024.jpg' />
    </Lazy>
    <div className="filler" />
    <Lazy style={{ height: 683 }} offsetTop={200}>
      <img src='http://apod.nasa.gov/apod/image/1502/2015_02_20_conj_bourque1024.jpg' />
    </Lazy>
    <div className="filler" />
    <Lazy style={{ height: 480 }} offsetHorizontal={50}>
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

It also provides a decorator for better support for lazy data loading with react-router, react-router-redial, redial.

```javascript
import React from 'react';
improt { lazy } from 'rrr-lazy';
import { provideHooks } from 'redial';

@lazy({
  style: {
    height: 720,
  },
  onContentVisible: () => console.log('look ma I have been lazyloaded!')
})
@provideHooks({
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
import { RedialContext } from 'react-router-redial';
import { provideHooks } from 'redial';

import { lazy } from 'rrr-lazy';

ReactDOM.render((
  <Router
    history={browserHistory}
    render={props => (
      <RedialContext
        { ...props }
        blocking={['fetch']}
        defer={['defer', 'done']}
        locals={locals}
        parallel={false}
        onError={onError}
        onStarted={onStarted}
      />)}
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

@provideHooks({
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

@provideHooks({
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


## Props

#### offset
Type: `Number|String` Default: `0`

Aliases: `threshold`

The `offset` option allows you to specify how far below, above, to the left, and to the right of the viewport you want to _begin_ displaying your content. If you specify `0`, your content will be displayed as soon as it is visible in the viewport, if you want to load _1000px_ below or above the viewport, use `1000`.

#### offsetVertical
Type: `Number|String` Default: `offset`'s value

The `offsetVertical` option allows you to specify how far above and below the viewport you want to _begin_ displaying your content.

#### offsetHorizontal
Type: `Number|String` Default: `offset`'s value

The `offsetHorizontal` option allows you to specify how far to the left and right of the viewport you want to _begin_ displaying your contet.

#### offsetTop
Type: `Number|String` Default: `offsetVertical`'s value

The `offsetTop` option allows you to specify how far above the viewport you want to _begin_ displaying your content.

#### offsetBottom
Type: `Number|String` Default: `offsetVertical`'s value

The `offsetBottom` option allows you to specify how far below the viewport you want to _begin_ displaying your content.

#### offsetLeft
Type: `Number|String` Default: `offsetVertical`'s value

The `offsetLeft` option allows you to specify how far to left of the viewport you want to _begin_ displaying your content.

#### offsetRight
Type: `Number|String` Default: `offsetVertical`'s value

The `offsetRight` option allows you to specify how far to the right of the viewport you want to _begin_ displaying your content.

#### throttle
Type: `Number|String` Default: `250`

The throttle is managed by an internal function that prevents performance issues from continuous firing of `scroll` events. Using a throttle will set a small timeout when the user scrolls and will keep throttling until the user stops. The default is `250` milliseconds.

#### debounce
Type: `Boolean` Default: `false`

Set `debounce1` to `true` to use [debounce](https://lodash.com/docs#debounce) function so that the checking function is only triggered after a user stops scrolling.

### style
Type: `object`

The style of Lazy component.

### className
Type: `string`

The className of Lazy component.

### placeholder
Type: Any

A customized placeholder for Lazy component instead of default placeholder.

### onContentVisible
Type `Function`

A callback function to execute when the content appears on the screen.

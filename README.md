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

IntersectionObserver is required by this library. You can use this polyfill for old browsers https://github.com/w3c/IntersectionObserver/tree/master/polyfill

## Usage

### Use as a common lazy component

```javascript
import React from 'react';
import { Lazy } from 'rrr-lazy';

const MyComponent = () => (
  <div>
    <Lazy
      rootMargin="300px 0 300px 0"
      render={(status) => (
        if (status === 'unload') {
          return <div>Unload</div>
        }
        if (status === 'loading') {
          return <div>Loading</div>
        }
        if (status === 'loaded') {
          return (
            <img
              style={{ height: 762, width: 1024 }}
              src={ status === 'loaded' ? 'http://apod.nasa.gov/apod/image/1502/HDR_MVMQ20Feb2015ouellet1024.jpg' : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"/>')}`}
            />
          );
        }
        throw new Error('Unknown status');
      )}
    />
  </div>
);
```

### Loading data or do something else with lifecycle hooks

```jsx
import { lazy } from 'rrr-lazy';

async function onLoading() {
  // Loading data;
  // ...
  return data;
}
async function onLoaded() {
  // Do something on loaded
  // ...
  return result;
}

async function onUnload() {
  // Do something on unload
  // ...
  return result;
}

async function onError(error) {
  // Do something on error
  console.error(error);
  // ...
  return result;
}

class App extends React.Component {
  render() {
    // the matched child route components become props in the parent
    return (
      <Lazy
        rootMargin="300px 0 300px 0"
        render={(status) => (
          if (status === 'unload') {
            return <div>Unload</div>
          }
          if (status === 'loading') {
            return <div>Loading</div>
          }
          if (status === 'loaded') {
            return (
              <img
                style={{ height: 762, width: 1024 }}
                src={ status === 'loaded' ? 'http://apod.nasa.gov/apod/image/1502/HDR_MVMQ20Feb2015ouellet1024.jpg' : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"/>')}`}
              />
            );
          }
          throw new Error('Unknown status');
        )}
        onLoading={onLoading}
        onLoaded={onLoaded}
        onUnload={onUnload}
        onError={onError}
    />
    )
  }
}
```


### Use with react-router-hook

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

## API: `<Lazy audoReset={true} root rootMargin render triggerStyle onError onLoaded onUnload onUnloaded />`

### Props

#### autoReset
Type: `Boolean` Default: `true`

Auto reset Lazy component when history changed (history must be set by `setHistory`, see below).

#### root
Type: `String|HTMLElement` Default: `null`

This value will be used as root for IntersectionObserver (See [root](https://www.w3.org/TR/intersection-observer/#dom-intersectionobserver-root).

#### rootMargin
Type: `String` Default: `null`

This value will be used as rootMargin for IntersectionObserver (See [rootMargin](https://www.w3.org/TR/intersection-observer/#dom-intersectionobserverinit-rootmargin).

#### **render(status, props)**
Type: `Function` **Required**

`status` can be `unload`, `loading`, `loaded`.

`props` are props that passed from `Lazy`. This is designed for `@lazy`, and when you use `<Lazy>` component, you may not need it.

#### triggerStyle

Set the style of trigger. On some old browsers (Chrome 51 - 57 ?) IntersectionObserver may not work properly. You can use `triggerStyle` to do the trick.

Example:

``` javascript
<Lazy
  triggerStyle={{ minHeight: '1px' }}
  render={...}
/>

```

#### onError()

#### onLoaded()

#### onLoading()

#### onUnload()

## API: `@lazy`

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

## API: setHistory

Set [history](https://github.com/ReactTraining/history) instance in order to use `autoReset` feature.

Example:

``` javascript
import { setHistory } from 'rrr-lazy';
import { browserHistory } from 'react-router';
setHistory(browserHistory);
```

## LICENSE

MIT

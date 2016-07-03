import { trigger } from 'redial';
import isPlainObject from 'lodash/isPlainObject';

function getLocals(component, locals) {
  return typeof locals === 'function' ? locals(component) : locals;
}

function getRoutesProps(routes) {
  return routes.reduce((previous, route) => {
    // eslint-disable-next-line no-unused-vars
    const { childRoutes, indexRoute, ...rest } = route;
    return {
      ...previous,
      ...rest,
    };
  }, {});
}

function getAllComponents(components) {
  const arr = Array.isArray(components) ? components : [components];
  const result = [];
  arr.forEach(component => {
    if (typeof component === 'object') {
      Object.keys(component).forEach(key => result.push(component[key]));
    } else {
      result.push(component);
    }
  });
  return result;
}

export function triggerHooks({
  hooks,
  components,
  locals,
  renderProps,
  force = false,
  lazyRedialMap = new WeakMap(),
}) {
  // Set props for specific component
  const setProps = component => props => {
    if (!isPlainObject(props)) {
      throw new Error('The input to setProps needs to be an object');
    }
    lazyRedialMap.set(component, {
      ...lazyRedialMap.get(component),
      ...props,
    });
  };

  // Get components for a specific component
  const getProps = component =>
    () => lazyRedialMap.get(component) || {};

  const completeLocals = component => ({
    location: renderProps.location,
    params: renderProps.params,
    routeProps: getRoutesProps(renderProps.routes),
    setProps: setProps(component),
    getProps: getProps(component),
    force,
    ...getLocals(component, locals),
  });

  const hookComponents = getAllComponents(components || renderProps.components).filter(c => c);
  const promises = hookComponents.map(hookComponent => hooks.reduce((promise, hook) =>
    promise.then(() => trigger(hook, hookComponent, completeLocals)), Promise.resolve())
  );
  return Promise.all(promises).then(() => ({
    lazyRedialMap,
  }));
}

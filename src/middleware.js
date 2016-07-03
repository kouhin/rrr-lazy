import React from 'react';
import LazyRedialContext from './LazyRedialContext';
import LazyRedialContainer from './LazyRedialContainer';

export function useRRRLazy(options) {
  return {
    renderRouterContext: (child, routerProps) => (
      <LazyRedialContext {...routerProps} {...options}>
        {child}
      </LazyRedialContext>
    ),
    renderRouteComponent: (child, routerProps) => (
      <LazyRedialContainer {...routerProps}>
        {child}
      </LazyRedialContainer>
    ),
  };
}

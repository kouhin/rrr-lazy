import React from 'react';
import LazyRedialContainer from './LazyRedialContainer';

export function useRRRLazy(options) {
  return {
    renderRouteComponent: (child, routerProps) => (
      <LazyRedialContainer routerProps={routerProps} {...options}>
        {child}
      </LazyRedialContainer>
    ),
  };
}

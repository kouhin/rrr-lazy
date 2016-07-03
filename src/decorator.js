import React from 'react';

import { Lazy } from './Lazy';

export const lazy = (options = {}) => Component => props => (
  <Lazy {...props} {...options}>
    <Component {...props} />
  </Lazy>
);

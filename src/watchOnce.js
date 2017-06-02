import formatOffset from './formatOffset';
import isIntersecting from './isIntersecting';

const canUseDOM = !!(
  typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
);

if (canUseDOM) {
  // eslint-disable-next-line global-require
  require('intersection-observer');
}

const ric = typeof window !== 'undefined'
      ? (window.requestIdleCallback || window.setTimeout) : setTimeout;

const observers = {};
const callbacks = new WeakMap();

function findObserver(offsetString) {
  let observer = observers[offsetString];
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      if (entries.length < 1) {
        return;
      }
      for (let i = 0, len = entries.length; i < len; i += 1) {
        const entry = entries[i];
        if (entry.isIntersecting === undefined && entry.intersectionRatio === 0) {
          entry.isIntersecting = isIntersecting(null, entry.target, entry.rootBounds);
        }
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          const element = entry.target;
          const callback = callbacks.get(element);
          if (callback) {
            ric(callback);
            callbacks.delete(element);
          }
          observer.unobserve(element);
        }
      }
    }, {
      rootMargin: offsetString,
    });
    observers[offsetString] = observer;
  }
  return observer;
}

export default function watchOnce(element, offset, callback) {
  const offsetString = formatOffset(offset);
  const observer = findObserver(offsetString);
  callbacks.set(element, callback);
  observer.observe(element);
  return () => {
    observer.unobserve(element);
  };
}

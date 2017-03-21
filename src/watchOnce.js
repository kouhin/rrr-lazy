import formatOffset from './formatOffset';

const canUseDOM = !!(
  typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
);

if (canUseDOM) {
  // eslint-disable-next-line global-require
  require('intersection-observer');
}

const animationFrame = typeof window !== 'undefined'
      ? (window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame) : setTimeout;

const observers = {};
const callbacks = new WeakMap();

function findObserver(offsetString) {
  let observer = observers[offsetString];
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (let i = 0, len = entries.length; i < len; i += 1) {
        const entry = entries[i];
        const element = entry.target;
        const callback = callbacks.get(element);
        if (callback) {
          animationFrame(callback);
          callbacks.delete(element);
        }
        observer.unobserve(element);
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

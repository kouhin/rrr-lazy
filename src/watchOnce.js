import formatOffset from './formatOffset';

const observers = {};
const callbacks = new WeakMap();

function findObserver(offsetString) {
  let observer = observers[offsetString];
  if (!observer) {
    observer = new IntersectionObserver(
      entries => {
        if (entries.length < 1) {
          return;
        }
        for (let i = 0, len = entries.length; i < len; i += 1) {
          const entry = entries[i];
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            const element = entry.target;
            const callback = callbacks.get(element);
            if (callback) {
              callbacks.delete(element);
              callback();
            }
            observer.unobserve(element);
          }
        }
      },
      {
        rootMargin: offsetString
      }
    );
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

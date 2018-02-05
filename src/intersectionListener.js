class IntersectionListener {
  constructor(options) {
    this.callbacks = new WeakMap();
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const callback = this.callbacks.get(entry.target);
        if (entry.target && callback) {
          callback(entry, this.observer);
        } else {
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
  }

  listen(element, callback) {
    this.callbacks.set(element, callback);
    this.observer.observe(element);
    return () => {
      this.callbacks.delete(element);
      this.observer.unobserve(element);
    };
  }
}

const observerPool = new WeakMap();

export default function createIntersectionListener(options) {
  const {
    root = typeof window === 'undefined' ? Object : window,
    rootMargin = '',
    threshold = ''
  } = options;
  if (!observerPool.get(root)) {
    observerPool.set(root, {});
  }
  const group = observerPool.get(root);
  const key = `${rootMargin}_${threshold}`;
  let result = group[key];
  if (!result) {
    result = new IntersectionListener(options);
    group[key] = result;
  }
  return result;
}

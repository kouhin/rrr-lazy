const canUseDOM = !!(
  typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
);

let browserHistory = null;

export function getHistory() {
  return browserHistory;
}

export function setHistory(history) {
  if (!canUseDOM) {
    return;
  }
  browserHistory = history;
}

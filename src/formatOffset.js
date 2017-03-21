export default function formatOffset(offset) {
  if (!offset) {
    return '0px';
  }
  if (typeof offset === 'number') {
    return `${offset}px 0px`;
  }
  return offset;
}

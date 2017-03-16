export default function formatOffset(offset) {
  if (!offset) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
  }
  if (typeof offset === 'number') {
    return {
      top: offset,
      right: offset,
      bottom: offset,
      left: offset,
    };
  }

  // typeof offset === 'string'
  let offsets;
  if (typeof offset === 'string') {
    offsets = offset.split(/\s+/).filter(x => x);
  } else if (Array.isArray(offset)) {
    offsets = offset;
  } else {
    throw new Error('offset must be number | string | array');
  }
  const len = offsets.length;
  if (len === 0) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
  } else if (len === 1) {
    return {
      top: offsets[0],
      right: offsets[0],
      bottom: offsets[0],
      left: offsets[0],
    };
  } else if (len === 2) {
    return {
      top: offsets[0],
      right: offsets[1],
      bottom: offsets[0],
      left: offsets[1],
    };
  } else if (len === 3) {
    return {
      top: offsets[0],
      right: offsets[1],
      bottom: offsets[2],
      left: offsets[1],
    };
  } else if (len === 4) {
    return {
      top: offsets[0],
      right: offsets[1],
      bottom: offsets[2],
      left: offsets[3],
    };
  }
  throw new Error(`Invalid offset ${offset}`);
}

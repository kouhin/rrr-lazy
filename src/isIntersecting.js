/**
 * This file is from https://github.com/WICG/IntersectionObserver/blob/gh-pages/polyfill/intersection-observer.js with modifications under Apache License, Version 2.0.
 *
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function computeRectIntersection(rect1, rect2) {
  const top = Math.max(rect1.top, rect2.top);
  const bottom = Math.min(rect1.bottom, rect2.bottom);
  const left = Math.max(rect1.left, rect2.left);
  const right = Math.min(rect1.right, rect2.right);
  const width = right - left;
  const height = bottom - top;

  return (width >= 0 && height >= 0) && {
    top,
    bottom,
    left,
    right,
    width,
    height,
  };
}

function getBoundingClientRect(el) {
  let rect = el.getBoundingClientRect();
  if (!rect) return null;

  // Older IE
  if (!rect.width || !rect.height) {
    rect = {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
    };
  }
  return rect;
}

function computeTargetAndRootIntersection(root, target, rootRect) {
  // If the element isn't displayed, an intersection can't happen.
  if (window.getComputedStyle(target).display === 'none') return null;

  const targetRect = getBoundingClientRect(target);
  let intersectionRect = targetRect;
  let parent = target.parentNode;
  let atRoot = false;

  while (!atRoot) {
    let parentRect = null;

    // If we're at the root element, set parentRect to the already
    // calculated rootRect.
    if (parent === root || parent.nodeType !== 1) {
      atRoot = true;
      parentRect = rootRect;
    } else if (window.getComputedStyle(parent).overflow !== 'visible') {
      // Otherwise check to see if the parent element hides overflow,
      // and if so update parentRect.
      parentRect = getBoundingClientRect(parent);
    }
    // If either of the above conditionals set a new parentRect,
    // calculate new intersection data.
    if (parentRect) {
      intersectionRect = computeRectIntersection(parentRect, intersectionRect);

      if (!intersectionRect) break;
    }
    parent = parent.parentNode;
  }
  return intersectionRect;
}

export default function isIntersecting(root, target, rootRect) {
  return !!computeTargetAndRootIntersection(root, target, rootRect);
}

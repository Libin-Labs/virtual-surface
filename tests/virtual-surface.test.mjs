import test from 'node:test';
import assert from 'node:assert/strict';
import { createVirtualSurface } from '../dist/esm/index.js';

test('computes prefix offsets for variable-size items', () => {
  const surface = createVirtualSurface([10, 20, 5]);
  assert.equal(surface.itemCount, 3);
  assert.equal(surface.totalSize, 35);
  assert.equal(surface.itemOffset(2), 30);
});

test('returns exact visible bounds at viewport edges', () => {
  const surface = createVirtualSurface([10, 20, 5]);
  assert.deepEqual(surface.visibleRange(10, 20), {
    startIndex: 1,
    endIndex: 2,
  });
  assert.deepEqual(surface.visibleRange(30, 5), { startIndex: 2, endIndex: 3 });
  assert.deepEqual(surface.visibleRange(35, 10), {
    startIndex: 3,
    endIndex: 3,
  });
});

test('uses item-count overscan without exceeding item bounds', () => {
  const surface = createVirtualSurface([10, 20, 5]);
  assert.deepEqual(surface.visibleRange(10, 5, 1), {
    startIndex: 0,
    endIndex: 3,
  });
  assert.deepEqual(surface.visibleRange(0, 5, 10), {
    startIndex: 0,
    endIndex: 3,
  });
});

test('preserves the visual position of an anchor', () => {
  const surface = createVirtualSurface([10, 20, 5]);
  const anchor = surface.anchorAt(17);
  assert.deepEqual(anchor, { index: 1, offset: 7 });
  assert.equal(surface.restoreAnchor(anchor), 17);
});

test('clamps stale anchors to the last item and empty surfaces', () => {
  const surface = createVirtualSurface([10, 20]);
  assert.equal(surface.restoreAnchor({ index: 9, offset: 50 }), 30);
  assert.equal(createVirtualSurface([]).restoreAnchor({ index: 0, offset: 1 }), 0);
  assert.equal(createVirtualSurface([]).anchorAt(0), null);
});

test('allows an empty surface and zero-size viewport', () => {
  assert.deepEqual(createVirtualSurface([]).visibleRange(0, 0), {
    startIndex: 0,
    endIndex: 0,
  });
  assert.deepEqual(createVirtualSurface([10]).visibleRange(2, 0), {
    startIndex: 0,
    endIndex: 0,
  });
});

test('rejects invalid item sizes, offsets and limits', () => {
  assert.throws(() => createVirtualSurface([1, 0]), RangeError);
  assert.throws(() => createVirtualSurface([1], { maxItems: 0 }), RangeError);
  const surface = createVirtualSurface([1]);
  assert.throws(() => surface.itemOffset(2), RangeError);
  assert.throws(() => surface.visibleRange(0, 1, -1), RangeError);
});

test('rejects malformed or negative anchors and viewport values', () => {
  const surface = createVirtualSurface([1]);
  assert.throws(() => surface.restoreAnchor({ index: -1, offset: 0 }), TypeError);
  assert.throws(() => surface.visibleRange(-1, 1), RangeError);
  assert.throws(() => surface.anchorAt(Number.NaN), RangeError);
});

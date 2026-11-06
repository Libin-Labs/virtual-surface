# @lp-labs/virtual-surface

Compute headless visible ranges for a one-dimensional sequence of variable-size items. The model stores a prefix-sum index; rendering, measuring, and scrolling remain the consumer's responsibility.

- No runtime or peer dependencies; no browser globals.
- Exact viewport intersection, item-count overscan, offsets, and item-relative anchors.
- ESM, CommonJS, and TypeScript declarations.

## Install

```sh
npm install @lp-labs/virtual-surface
```

Requires Node.js 18+ or an ESM-aware bundler.

## Quickstart

```js
import { createVirtualSurface } from '@lp-labs/virtual-surface';

const surface = createVirtualSurface([24, 48, 32, 60]);
const visible = surface.visibleRange(30, 70, 1);
const anchor = surface.anchorAt(30);
console.log(visible, surface.restoreAnchor(anchor));
```

CommonJS users can call `require('@lp-labs/virtual-surface')`.

## Runtime API and types

Runtime export: `createVirtualSurface`.

- `createVirtualSurface(sizes, options?)` accepts an iterable of positive finite item sizes and builds a stable prefix-sum index.
- `VirtualSurface.itemCount` and `totalSize` expose model dimensions. `itemOffset(index)` returns the start offset, and `itemOffset(itemCount)` returns the total.
- `visibleRange(scrollOffset, viewportSize, overscan?)` returns `[startIndex, endIndex)` for items intersecting the clamped viewport. `overscan` adds that many items before and after the intersection.
- `anchorAt(scrollOffset)` returns an item index and offset within that item, or `null` for an empty surface. `restoreAnchor(anchor)` returns the corresponding offset; `null` restores to zero.
- Type exports: `VirtualRange`, `SurfaceAnchor`, `VirtualSurfaceOptions`, and `VirtualSurface`.

Offsets and viewport sizes are finite and nonnegative. Items must have positive size; zero-size items are not supported. An anchor with a stale index clamps to the last current item, and its within-item offset clamps to that item's size. An empty surface restores all anchors to zero. A zero-size viewport produces an empty range at its position (with overscan extending before that position).

## Bounds and customization

`maxItems` defaults to 100,000 and must be a positive safe integer. Building the surface costs O(n) time and memory; offset lookup and viewport searches are O(log n), with output bounded by visible items plus overscan. The surface is immutable after creation: recreate it when measurements change, then use an anchor captured before the update to restore a scroll position.

Sizes and offsets use JavaScript floating-point numbers; a non-finite accumulated total is rejected. This model does not measure DOM nodes, observe resizes, render placeholders, handle two-dimensional grids, or integrate with a framework.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.

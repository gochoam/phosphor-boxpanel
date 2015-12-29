/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import * as arrays
  from 'phosphor-arrays';

import {
  BoxSizer, boxCalc
} from 'phosphor-boxengine';

import {
  IBoxSizing, boxSizing, sizeLimits
} from 'phosphor-domutil';

import {
  Message, sendMessage
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  PanelLayout
} from 'phosphor-panel';

import {
  ChildMessage, ResizeMessage, Widget
} from 'phosphor-widget';


/**
 * The class name added to left-to-right box layout parents.
 */
const LEFT_TO_RIGHT_CLASS = 'p-mod-left-to-right';

/**
 * The class name added to right-to-left box layout parents.
 */
const RIGHT_TO_LEFT_CLASS = 'p-mod-right-to-left';

/**
 * The class name added to top-to-bottom box layout parents.
 */
const TOP_TO_BOTTOM_CLASS = 'p-mod-top-to-bottom';

/**
 * The class name added to bottom-to-top box layout parents.
 */
const BOTTOM_TO_TOP_CLASS = 'p-mod-bottom-to-top';


/**
 * The layout direction of a box layout.
 */
export
enum Direction {
  /**
   * Left to right direction.
   */
  LeftToRight,

  /**
   * Right to left direction.
   */
  RightToLeft,

  /**
   * Top to bottom direction.
   */
  TopToBottom,

  /**
   * Bottom to top direction.
   */
  BottomToTop,
}


/**
 * A layout which arranges its children in a single row or column.
 */
export
class BoxLayout extends PanelLayout {
  /**
   * Get the layout direction for the box layout.
   */
  get direction(): Direction {
    return this._direction;
  }

  /**
   * Set the layout direction for the box layout.
   */
  set direction(value: Direction) {
    if (this._direction === value) {
      return;
    }
    this._direction = value;
    if (!this.parent) {
      return;
    }
    BoxLayoutPrivate.toggleDirection(this.parent, value);
    this.parent.fit();
  }

  /**
   * Get the inter-element spacing for the box layout.
   */
  get spacing(): number {
    return this._spacing;
  }

  /**
   * Set the inter-element spacing for the box layout.
   */
  set spacing(value: number) {
    value = Math.max(0, value | 0);
    if (this._spacing === value) {
      return;
    }
    this._spacing = value;
    if (!this.parent) {
      return;
    }
    this.parent.fit();
  }

  /**
   * Initialize the children of the layout.
   *
   * #### Notes
   * This method is called automatically when the layout is installed
   * on its parent widget.
   */
  protected initialize(): void {
    BoxLayoutPrivate.toggleDirection(this.parent, this.direction);
    super.initialize();
  }

  /**
   * Attach a child widget to the parent's DOM node.
   *
   * @param index - The current index of the child in the layout.
   *
   * @param child - The child widget to attach to the parent.
   *
   * #### Notes
   * This is a reimplementation of the superclass method.
   */
  protected attachChild(index: number, child: Widget): void {
    arrays.insert(this._sizers, index, new BoxSizer());
    BoxLayoutPrivate.prepareGeometry(child);
    this.parent.node.appendChild(child.node);
    if (this.parent.isAttached) sendMessage(child, Widget.MsgAfterAttach);
    this.parent.fit();
  }

  /**
   * Move a child widget in the parent's DOM node.
   *
   * @param fromIndex - The previous index of the child in the layout.
   *
   * @param toIndex - The current index of the child in the layout.
   *
   * @param child - The child widget to move in the parent.
   *
   * #### Notes
   * This is a reimplementation of the superclass method.
   */
  protected moveChild(fromIndex: number, toIndex: number, child: Widget): void {
    arrays.move(this._sizers, fromIndex, toIndex);
    this.parent.update();
  }

  /**
   * Detach a child widget from the parent's DOM node.
   *
   * @param index - The previous index of the child in the layout.
   *
   * @param child - The child widget to detach from the parent.
   *
   * #### Notes
   * This is a reimplementation of the superclass method.
   */
  protected detachChild(index: number, child: Widget): void {
    arrays.removeAt(this._sizers, index);
    if (this.parent.isAttached) sendMessage(child, Widget.MsgBeforeDetach);
    this.parent.node.removeChild(child.node);
    BoxLayoutPrivate.resetGeometry(child);
    this.parent.fit();
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   */
  protected onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    this.parent.update();
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.parent.fit();
  }

  /**
   * A message handler invoked on a `'child-shown'` message.
   */
  protected onChildShown(msg: ChildMessage): void {
    if (BoxLayoutPrivate.IsIE) { // prevent flicker on IE
      sendMessage(this.parent, Widget.MsgFitRequest);
    } else {
      this.parent.fit();
    }
  }

  /**
   * A message handler invoked on a `'child-hidden'` message.
   */
  protected onChildHidden(msg: ChildMessage): void {
    if (BoxLayoutPrivate.IsIE) { // prevent flicker on IE
      sendMessage(this.parent, Widget.MsgFitRequest);
    } else {
      this.parent.fit();
    }
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: ResizeMessage): void {
    if (this.parent.isVisible) {
      this._update(msg.width, msg.height);
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.parent.isVisible) {
      this._update(-1, -1);
    }
  }

  /**
   * A message handler invoked on a `'fit-request'` message.
   */
  protected onFitRequest(msg: Message): void {
    if (this.parent.isAttached) {
      this._fit();
    }
  }

  /**
   * Fit the layout to the total size required by the child widgets.
   */
  private _fit(): void {
    // Compute the visible item count.
    let nVisible = 0;
    for (let i = 0, n = this.childCount(); i < n; ++i) {
      if (!this.childAt(i).isHidden) nVisible++;
    }

    // Update the fixed space for the visible items.
    this._fixed = this._spacing * Math.max(0, nVisible - 1);

    // Setup the initial size limits.
    let minW = 0;
    let minH = 0;
    let maxW = Infinity;
    let maxH = Infinity;
    let horz = BoxLayoutPrivate.isHorizontal(this._direction);
    if (horz) {
      minW = this._fixed;
      maxW = nVisible > 0 ? minW : maxW;
    } else {
      minH = this._fixed;
      maxH = nVisible > 0 ? minH : maxH;
    }

    // Update the sizers and computed size limits.
    for (let i = 0, n = this.childCount(); i < n; ++i) {
      let child = this.childAt(i);
      let sizer = this._sizers[i];
      if (child.isHidden) {
        sizer.minSize = 0;
        sizer.maxSize = 0;
        continue;
      }
      let limits = sizeLimits(child.node);
      sizer.sizeHint = BoxLayout.getSizeBasis(child);
      sizer.stretch = BoxLayout.getStretch(child);
      if (horz) {
        sizer.minSize = limits.minWidth;
        sizer.maxSize = limits.maxWidth;
        minW += limits.minWidth;
        maxW += limits.maxWidth;
        minH = Math.max(minH, limits.minHeight);
        maxH = Math.min(maxH, limits.maxHeight);
      } else {
        sizer.minSize = limits.minHeight;
        sizer.maxSize = limits.maxHeight;
        minH += limits.minHeight;
        maxH += limits.maxHeight;
        minW = Math.max(minW, limits.minWidth);
        maxW = Math.min(maxW, limits.maxWidth);
      }
    }

    // Update the box sizing and add it to the size constraints.
    let box = this._box = boxSizing(this.parent.node);
    minW += box.horizontalSum;
    minH += box.verticalSum;
    maxW += box.horizontalSum;
    maxH += box.verticalSum;

    // Update the parent's size constraints.
    let style = this.parent.node.style;
    style.minWidth = `${minW}px`;
    style.minHeight = `${minH}px`;
    style.maxWidth = maxW === Infinity ? 'none' : `${maxW}px`;
    style.maxHeight = maxH === Infinity ? 'none' : `${maxH}px`;

    // Notify the ancestor that it should fit immediately.
    let ancestor = this.parent.parent;
    if (ancestor) sendMessage(ancestor, Widget.MsgFitRequest);

    // Notify the parent that it should update immediately.
    sendMessage(this.parent, Widget.MsgUpdateRequest);
  }

  /**
   * Update the layout position and size of the child widgets.
   *
   * The parent offset dimensions should be `-1` if unknown.
   */
  private _update(offsetWidth: number, offsetHeight: number): void {
    // Bail early if there are no children to layout.
    if (this.childCount() === 0) {
      return;
    }

    // Measure the parent if the offset dimensions are unknown.
    if (offsetWidth < 0) {
      offsetWidth = this.parent.node.offsetWidth;
    }
    if (offsetHeight < 0) {
      offsetHeight = this.parent.node.offsetHeight;
    }

    // Ensure the parent box sizing data is computed.
    let box = this._box || (this._box = boxSizing(this.parent.node));

    // Compute the layout area adjusted for border and padding.
    let top = box.paddingTop;
    let left = box.paddingLeft;
    let width = offsetWidth - box.horizontalSum;
    let height = offsetHeight - box.verticalSum;

    // Distribute the layout space and adjust the start position.
    switch (this._direction) {
    case Direction.LeftToRight:
      boxCalc(this._sizers, Math.max(0, width - this._fixed));
      break;
    case Direction.TopToBottom:
      boxCalc(this._sizers, Math.max(0, height - this._fixed));
      break;
    case Direction.RightToLeft:
      boxCalc(this._sizers, Math.max(0, width - this._fixed));
      left += width;
      break;
    case Direction.BottomToTop:
      boxCalc(this._sizers, Math.max(0, height - this._fixed));
      top += height;
      break;
    }

    // Layout the children using the computed box sizes.
    for (let i = 0, n = this.childCount(); i < n; ++i) {
      let child = this.childAt(i);
      if (child.isHidden) {
        continue;
      }
      let size = this._sizers[i].size;
      switch (this._direction) {
      case Direction.LeftToRight:
        BoxLayoutPrivate.setGeometry(child, left, top, size, height);
        left += size + this._spacing;
        break;
      case Direction.TopToBottom:
        BoxLayoutPrivate.setGeometry(child, left, top, width, size);
        top += size + this._spacing;
        break;
      case Direction.RightToLeft:
        BoxLayoutPrivate.setGeometry(child, left - size, top, size, height);
        left -= size + this._spacing;
        break;
      case Direction.BottomToTop:
        BoxLayoutPrivate.setGeometry(child, left, top - size, width, size);
        top -= size + this._spacing;
        break;
      }
    }
  }

  private _fixed = 0;
  private _spacing = 8;
  private _box: IBoxSizing = null;
  private _sizers: BoxSizer[] = [];
  private _direction = Direction.TopToBottom;
}


/**
 * The namespace for the `BoxLayout` class statics.
 */
export
namespace BoxLayout {
  /**
   * A convenience alias of the `LeftToRight` [[Direction]].
   */
  export
  const LeftToRight = Direction.LeftToRight;

  /**
   * A convenience alias of the `RightToLeft` [[Direction]].
   */
  export
  const RightToLeft = Direction.RightToLeft;

  /**
   * A convenience alias of the `TopToBottom` [[Direction]].
   */
  export
  const TopToBottom = Direction.TopToBottom;

  /**
   * A convenience alias of the `BottomToTop` [[Direction]].
   */
  export
  const BottomToTop = Direction.BottomToTop;

  /**
   * Get the box layout stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The box layout stretch factor for the widget.
   */
  export
  function getStretch(widget: Widget): number {
    return BoxLayoutPrivate.stretchProperty.get(widget);
  }

  /**
   * Set the box layout stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the stretch factor.
   */
  export
  function setStretch(widget: Widget, value: number): void {
    BoxLayoutPrivate.stretchProperty.set(widget, value);
  }

  /**
   * Get the box layout size basis for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The box layout size basis for the widget.
   */
  export
  function getSizeBasis(widget: Widget): number {
    return BoxLayoutPrivate.sizeBasisProperty.get(widget);
  }

  /**
   * Set the box layout size basis for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the size basis.
   */
  export
  function setSizeBasis(widget: Widget, value: number): void {
    BoxLayoutPrivate.sizeBasisProperty.set(widget, value);
  }
}


/**
 * The namespace for the `BoxLayout` class private data.
 */
namespace BoxLayoutPrivate {
  /**
   * A flag indicating whether the browser is IE.
   */
  export
  const IsIE = /Trident/.test(navigator.userAgent);

  /**
   * The property descriptor for a widget stretch factor.
   */
  export
  const stretchProperty = new Property<Widget, number>({
    name: 'stretch',
    value: 0,
    coerce: (owner, value) => Math.max(0, value | 0),
    changed: onChildPropertyChanged,
  });

  /**
   * The property descriptor for a widget size basis.
   */
  export
  const sizeBasisProperty = new Property<Widget, number>({
    name: 'sizeBasis',
    value: 0,
    coerce: (owner, value) => Math.max(0, value | 0),
    changed: onChildPropertyChanged,
  });

  /**
   * Test whether a direction has horizontal orientation.
   */
  export
  function isHorizontal(dir: Direction): boolean {
    return dir === Direction.LeftToRight || dir === Direction.RightToLeft;
  }

  /**
   * Toggle the CSS direction class for the given widget.
   */
  export
  function toggleDirection(widget: Widget, dir: Direction): void {
    widget.toggleClass(LEFT_TO_RIGHT_CLASS, dir === Direction.LeftToRight);
    widget.toggleClass(RIGHT_TO_LEFT_CLASS, dir === Direction.RightToLeft);
    widget.toggleClass(TOP_TO_BOTTOM_CLASS, dir === Direction.TopToBottom);
    widget.toggleClass(BOTTOM_TO_TOP_CLASS, dir === Direction.BottomToTop);
  }

  /**
   * Prepare a child widget for absolute layout geometry.
   */
  export
  function prepareGeometry(widget: Widget): void {
    widget.node.style.position = 'absolute';
  }

  /**
   * Reset the layout geometry of a child widget.
   */
  export
  function resetGeometry(widget: Widget): void {
    let rect = rectProperty.get(widget);
    let style = widget.node.style;
    rect.top = NaN;
    rect.left = NaN;
    rect.width = NaN;
    rect.height = NaN;
    style.position = '';
    style.top = '';
    style.left = '';
    style.width = '';
    style.height = '';
  }

  /**
   * Set the layout geometry of a child widget.
   */
  export
  function setGeometry(widget: Widget, left: number, top: number, width: number, height: number): void {
    let resized = false;
    let style = widget.node.style;
    let rect = rectProperty.get(widget);
    if (rect.top !== top) {
      rect.top = top;
      style.top = `${top}px`;
    }
    if (rect.left !== left) {
      rect.left = left;
      style.left = `${left}px`;
    }
    if (rect.width !== width) {
      resized = true;
      rect.width = width;
      style.width = `${width}px`;
    }
    if (rect.height !== height) {
      resized = true;
      rect.height = height;
      style.height = `${height}px`;
    }
    if (resized) {
      sendMessage(widget, new ResizeMessage(width, height));
    }
  }

  /**
   * An object which represents an offset rect.
   */
  interface IRect {
    /**
     * The offset top edge, in pixels.
     */
    top: number;

    /**
     * The offset left edge, in pixels.
     */
    left: number;

    /**
     * The offset width, in pixels.
     */
    width: number;

    /**
     * The offset height, in pixels.
     */
    height: number;
  }

  /**
   * A property descriptor for a widget offset rect.
   */
  var rectProperty = new Property<Widget, IRect>({
    name: 'rect',
    create: () => ({ top: NaN, left: NaN, width: NaN, height: NaN }),
  });

  /**
   * The change handler for the attached child properties.
   */
  function onChildPropertyChanged(child: Widget): void {
    let parent = child.parent;
    let layout = parent && parent.layout;
    if (layout instanceof BoxLayout) parent.fit();
  }
}

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
  ChildMessage, Panel, PanelLayout, ResizeMessage, Widget
} from 'phosphor-widget';

import './index.css';


// TODO - need better solution for storing these class names

/**
 * The class name added to BoxPanel instances.
 */
const BOX_PANEL_CLASS = 'p-BoxPanel';

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
 * A panel which arranges its children in a single row or column.
 *
 * #### Notes
 * This class provides a convenience wrapper around a [[BoxLayout]].
 */
export
class BoxPanel extends Panel {
  /**
   * Create a box layout for a box panel.
   */
  static createLayout(): BoxLayout {
    return new BoxLayout();
  }

  /**
   * Construct a new box panel.
   */
  constructor() {
    super();
    this.addClass(BOX_PANEL_CLASS);
  }

  /**
   * Get the layout direction for the box panel.
   */
  get direction(): Direction {
    return (this.layout as BoxLayout).direction;
  }

  /**
   * Set the layout direction for the box panel.
   */
  set direction(value: Direction) {
    (this.layout as BoxLayout).direction = value;
  }

  /**
   * Get the inter-element spacing for the box panel.
   */
  get spacing(): number {
    return (this.layout as BoxLayout).spacing;
  }

  /**
   * Set the inter-element spacing for the box panel.
   */
  set spacing(value: number) {
    (this.layout as BoxLayout).spacing = value;
  }
}


/**
 * The namespace for the `BoxPanel` class statics.
 */
export
namespace BoxPanel {
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
   * Get the box panel stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The box panel stretch factor for the widget.
   */
  export
  function getStretch(widget: Widget): number {
    return BoxLayout.getStretch(widget);
  }

  /**
   * Set the box panel stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the stretch factor.
   */
  export
  function setStretch(widget: Widget, value: number): void {
    BoxLayout.setStretch(widget, value);
  }

  /**
   * Get the box panel size basis for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The box panel size basis for the widget.
   */
  export
  function getSizeBasis(widget: Widget): number {
    return BoxLayout.getSizeBasis(widget);
  }

  /**
   * Set the box panel size basis for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the size basis.
   */
  export
  function setSizeBasis(widget: Widget, value: number): void {
    BoxLayout.setSizeBasis(widget, value);
  }
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
    return BoxLayoutPrivate.directionProperty.get(this);
  }

  /**
   * Set the layout direction for the box layout.
   */
  set direction(value: Direction) {
    BoxLayoutPrivate.directionProperty.set(this, value);
  }

  /**
   * Get the inter-element spacing for the box layout.
   */
  get spacing(): number {
    return BoxLayoutPrivate.spacingProperty.get(this);
  }

  /**
   * Set the inter-element spacing for the box layout.
   */
  set spacing(value: number) {
    BoxLayoutPrivate.spacingProperty.set(this, value);
  }

  /**
   * Initialize the children of the layout.
   *
   * #### Notes
   * This method is called automatically when the layout is installed
   * on its parent widget.
   */
  protected initialize(): void {
    BoxLayoutPrivate.initialize(this);
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
    BoxLayoutPrivate.addSizer(this, index);
    this.parent.node.appendChild(child.node);
    if (this.parent.isAttached) sendMessage(child, Widget.MsgAfterAttach);
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
    BoxLayoutPrivate.moveSizer(this, fromIndex, toIndex);
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
    if (this.parent.isAttached) sendMessage(child, Widget.MsgBeforeDetach);
    this.parent.node.removeChild(child.node);
    BoxLayoutPrivate.removeSizer(this, index);
    BoxLayoutPrivate.reset(child);
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
    if (BoxLayoutPrivate.IsIE) {
      sendMessage(this.parent, Widget.MsgFitRequest);
    } else {
      this.parent.fit();
    }
  }

  /**
   * A message handler invoked on a `'child-hidden'` message.
   */
  protected onChildHidden(msg: ChildMessage): void {
    if (BoxLayoutPrivate.IsIE) {
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
      BoxLayoutPrivate.update(this, msg.width, msg.height);
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.parent.isVisible) {
      BoxLayoutPrivate.update(this, -1, -1);
    }
  }

  /**
   * A message handler invoked on a `'fit-request'` message.
   */
  protected onFitRequest(msg: Message): void {
    if (this.parent.isAttached) {
      BoxLayoutPrivate.fit(this);
    }
  }
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
   * Get the box panel stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The box panel stretch factor for the widget.
   */
  export
  function getStretch(widget: Widget): number {
    return BoxLayoutPrivate.stretchProperty.get(widget);
  }

  /**
   * Set the box panel stretch factor for the given widget.
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
   * Get the box panel size basis for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The box panel size basis for the widget.
   */
  export
  function getSizeBasis(widget: Widget): number {
    return BoxLayoutPrivate.sizeBasisProperty.get(widget);
  }

  /**
   * Set the box panel size basis for the given widget.
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
   * The property descriptor for the box layout direction.
   */
  export
  const directionProperty = new Property<BoxLayout, Direction>({
    name: 'direction',
    value: Direction.TopToBottom,
    changed: onDirectionChanged,
  });

  /**
   * The property descriptor for the box layout spacing.
   */
  export
  const spacingProperty = new Property<BoxLayout, number>({
    name: 'spacing',
    value: 8,
    coerce: (owner, value) => Math.max(0, value | 0),
    changed: onSpacingChanged,
  });

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
   * Initialize the private layout state.
   *
   * #### Notes
   * This should be called during the layout initialization.
   */
  export
  function initialize(layout: BoxLayout): void {
    updateParentDirection(layout);
  }

  /**
   * Add a sizer to the layout at the specified index.
   */
  export
  function addSizer(layout: BoxLayout, index: number): void {
    arrays.insert(sizersProperty.get(layout), index, new BoxSizer());
    if (layout.parent) layout.parent.fit();
  }

  /**
   * Move a sizer in the layout from one index to another.
   */
  export
  function moveSizer(layout: BoxLayout, fromIndex: number, toIndex: number): void {
    arrays.move(sizersProperty.get(layout), fromIndex, toIndex);
    if (layout.parent) layout.parent.update();
  }

  /**
   * Remove a sizer from the layout at the specified index.
   */
  export
  function removeSizer(layout: BoxLayout, index: number): void {
    arrays.removeAt(sizersProperty.get(layout), index);
    if (layout.parent) layout.parent.fit();
  }

  /**
   * Reset the layout modifications for the given child widget.
   */
  export
  function reset(widget: Widget): void {
    let rect = rectProperty.get(widget);
    let style = widget.node.style;
    rect.top = NaN;
    rect.left = NaN;
    rect.width = NaN;
    rect.height = NaN;
    style.top = '';
    style.left = '';
    style.width = '';
    style.height = '';
  }

  /**
   * Fit the layout to total size required by the child widgets.
   */
  export
  function fit(layout: BoxLayout): void {
    // Bail early if there is no parent.
    let parent = layout.parent;
    if (!parent) {
      return;
    }

    // Compute the visible item count.
    let visibleCount = 0;
    for (let i = 0, n = layout.childCount(); i < n; ++i) {
      if (!layout.childAt(i).isHidden) visibleCount++;
    }

    // Update the fixed space for the visible items.
    let fixedSpace = layout.spacing * Math.max(0, visibleCount - 1);
    fixedSpaceProperty.set(layout, fixedSpace);

    // Update the sizers and compute the new size limits.
    let minW = 0;
    let minH = 0;
    let maxW = Infinity;
    let maxH = Infinity;
    let dir = layout.direction;
    let sizers = sizersProperty.get(layout);
    if (dir === Direction.LeftToRight || dir === Direction.RightToLeft) {
      minW = fixedSpace;
      maxW = visibleCount > 0 ? minW : maxW;
      for (let i = 0, n = layout.childCount(); i < n; ++i) {
        let widget = layout.childAt(i);
        let sizer = sizers[i];
        if (widget.isHidden) {
          sizer.minSize = 0;
          sizer.maxSize = 0;
          continue;
        }
        let limits = sizeLimits(widget.node);
        sizer.sizeHint = sizeBasisProperty.get(widget);
        sizer.stretch = stretchProperty.get(widget);
        sizer.minSize = limits.minWidth;
        sizer.maxSize = limits.maxWidth;
        minW += limits.minWidth;
        maxW += limits.maxWidth;
        minH = Math.max(minH, limits.minHeight);
        maxH = Math.min(maxH, limits.maxHeight);
      }
    } else {
      minH = fixedSpace;
      maxH = visibleCount > 0 ? minH : maxH;
      for (let i = 0, n = layout.childCount(); i < n; ++i) {
        let widget = layout.childAt(i);
        let sizer = sizers[i];
        if (widget.isHidden) {
          sizer.minSize = 0;
          sizer.maxSize = 0;
          continue;
        }
        let limits = sizeLimits(widget.node);
        sizer.sizeHint = sizeBasisProperty.get(widget);
        sizer.stretch = stretchProperty.get(widget);
        sizer.minSize = limits.minHeight;
        sizer.maxSize = limits.maxHeight;
        minH += limits.minHeight;
        maxH += limits.maxHeight;
        minW = Math.max(minW, limits.minWidth);
        maxW = Math.min(maxW, limits.maxWidth);
      }
    }

    // Update the box sizing and add it to the size constraints.
    let box = boxSizing(parent.node);
    boxSizingProperty.set(parent, box);
    minW += box.horizontalSum;
    minH += box.verticalSum;
    maxW += box.horizontalSum;
    maxH += box.verticalSum;

    // Update the panel's size constraints.
    let style = parent.node.style;
    style.minWidth = minW + 'px';
    style.minHeight = minH + 'px';
    style.maxWidth = maxW === Infinity ? 'none' : maxW + 'px';
    style.maxHeight = maxH === Infinity ? 'none' : maxH + 'px';

    // Notifiy the ancestor that it should fit immediately.
    if (parent.parent) sendMessage(parent.parent, Widget.MsgFitRequest);

    // Notify the parent that it should update immediately.
    sendMessage(parent, Widget.MsgUpdateRequest);
  }

  /**
   * Layout the children using the given offset width and height.
   *
   * If the dimensions are unknown, they should be specified as `-1`.
   */
  export
  function update(layout: BoxLayout, offsetWidth: number, offsetHeight: number): void {
    // Bail early if there are no children to layout.
    if (layout.childCount() === 0) {
      return;
    }

    // Bail early if there is no parent.
    let parent = layout.parent;
    if (!parent) {
      return;
    }

    // Measure the parent if the offset dimensions are unknown.
    if (offsetWidth < 0) {
      offsetWidth = parent.node.offsetWidth;
    }
    if (offsetHeight < 0) {
      offsetHeight = parent.node.offsetHeight;
    }

    // Lookup the layout data.
    let dir = layout.direction;
    let spacing = layout.spacing;
    let box = boxSizingProperty.get(parent);
    let sizers = sizersProperty.get(layout);
    let fixedSpace = fixedSpaceProperty.get(layout);

    // Compute the actual layout bounds adjusted for border and padding.
    let top = box.paddingTop;
    let left = box.paddingLeft;
    let width = offsetWidth - box.horizontalSum;
    let height = offsetHeight - box.verticalSum;

    // Distribute the layout space and layout the children.
    if (dir === Direction.LeftToRight) {
      boxCalc(sizers, Math.max(0, width - fixedSpace));
      for (let i = 0, n = layout.childCount(); i < n; ++i) {
        let widget = layout.childAt(i);
        if (widget.isHidden) {
          continue;
        }
        let size = sizers[i].size;
        setGeometry(widget, left, top, size, height);
        left += size + spacing;
      }
    } else if (dir === Direction.TopToBottom) {
      boxCalc(sizers, Math.max(0, height - fixedSpace));
      for (let i = 0, n = layout.childCount(); i < n; ++i) {
        let widget = layout.childAt(i);
        if (widget.isHidden) {
          continue;
        }
        let size = sizers[i].size;
        setGeometry(widget, left, top, width, size);
        top += size + spacing;
      }
    } else if (dir === Direction.RightToLeft) {
      left += width;
      boxCalc(sizers, Math.max(0, width - fixedSpace));
      for (let i = 0, n = layout.childCount(); i < n; ++i) {
        let widget = layout.childAt(i);
        if (widget.isHidden) {
          continue;
        }
        let size = sizers[i].size;
        setGeometry(widget, left - size, top, size, height);
        left -= size + spacing;
      }
    } else {
      top += height;
      boxCalc(sizers, Math.max(0, height - fixedSpace));
      for (let i = 0, n = layout.childCount(); i < n; ++i) {
        let widget = layout.childAt(i);
        if (widget.isHidden) {
          continue;
        }
        let size = sizers[i].size;
        setGeometry(widget, left, top - size, width, size);
        top -= size + spacing;
      }
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
   * A property descriptor for the box sizing of a widget.
   */
  var boxSizingProperty = new Property<Widget, IBoxSizing>({
    name: 'boxSizing',
    create: owner => boxSizing(owner.node),
  });

  /**
   * A property descriptor for the box layout sizers.
   */
  var sizersProperty = new Property<BoxLayout, BoxSizer[]>({
    name: 'sizers',
    create: () => [],
  });

  /**
   * A property descriptor for the box layout fixed spacing.
   */
  var fixedSpaceProperty = new Property<BoxLayout, number>({
    name: 'fixedSpace',
    value: 0,
  });

  /**
   * The change handler for the box layout direction.
   */
  function onDirectionChanged(layout: BoxLayout): void {
    updateParentDirection(layout);
    if (layout.parent) layout.parent.fit();
  }

  /**
   * The change handler for the box layout spacing.
   */
  function onSpacingChanged(layout: BoxLayout): void {
    if (layout.parent) layout.parent.fit();
  }

  /**
   * The change handler for the attached child properties.
   */
  function onChildPropertyChanged(child: Widget): void {
    let parent = child.parent;
    let layout = parent && parent.layout;
    if (layout instanceof BoxLayout) parent.fit();
  }

  /**
   * Update the CSS direction class on the layout parent.
   */
  function updateParentDirection(layout: BoxLayout): void {
    if (!layout.parent) return;
    let parent = layout.parent;
    let dir = layout.direction;
    parent.toggleClass(LEFT_TO_RIGHT_CLASS, dir === Direction.LeftToRight);
    parent.toggleClass(RIGHT_TO_LEFT_CLASS, dir === Direction.RightToLeft);
    parent.toggleClass(TOP_TO_BOTTOM_CLASS, dir === Direction.TopToBottom);
    parent.toggleClass(BOTTOM_TO_TOP_CLASS, dir === Direction.BottomToTop);
  }

  /**
   * Set the offset geometry for the given widget.
   *
   * A resize message will be dispatched to the widget if appropriate.
   */
  function setGeometry(widget: Widget, left: number, top: number, width: number, height: number): void {
    let resized = false;
    let style = widget.node.style;
    let rect = rectProperty.get(widget);
    if (rect.top !== top) {
      rect.top = top;
      style.top = top + 'px';
    }
    if (rect.left !== left) {
      rect.left = left;
      style.left = left + 'px';
    }
    if (rect.width !== width) {
      resized = true;
      rect.width = width;
      style.width = width + 'px';
    }
    if (rect.height !== height) {
      resized = true;
      rect.height = height;
      style.height = height + 'px';
    }
    if (resized) {
      sendMessage(widget, new ResizeMessage(width, height));
    }
  }
}

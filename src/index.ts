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
  Message, postMessage, sendMessage
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  ChildMessage, Panel, ResizeMessage, Widget
} from 'phosphor-widget';

import './index.css';


/**
 * The class name added to BoxPanel instances.
 */
const BOX_PANEL_CLASS = 'p-BoxPanel';

/**
 * The class name added to left-to-right box panels.
 */
const LEFT_TO_RIGHT_CLASS = 'p-mod-left-to-right';

/**
 * The class name added to right-to-left box panels.
 */
const RIGHT_TO_LEFT_CLASS = 'p-mod-right-to-left';

/**
 * The class name added to top-to-bottom box panels.
 */
const TOP_TO_BOTTOM_CLASS = 'p-mod-top-to-bottom';

/**
 * The class name added to bottom-to-top box panels.
 */
const BOTTOM_TO_TOP_CLASS = 'p-mod-bottom-to-top';


/**
 * The layout direction of a box panel.
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
 * A widget which arranges its children in a single row or column.
 */
export
class BoxPanel extends Panel {
  /**
   * A convenience alias of the `LeftToRight` [[Direction]].
   */
  static LeftToRight = Direction.LeftToRight;

  /**
   * A convenience alias of the `RightToLeft` [[Direction]].
   */
  static RightToLeft = Direction.RightToLeft;

  /**
   * A convenience alias of the `TopToBottom` [[Direction]].
   */
  static TopToBottom = Direction.TopToBottom;

  /**
   * A convenience alias of the `BottomToTop` [[Direction]].
   */
  static BottomToTop = Direction.BottomToTop;

  /**
   * The property descriptor for the box panel layout direction.
   *
   * The controls the arrangement of child widgets within the panel.
   * The default value is `TopToBottom`.
   *
   * **See also:** [[direction]]
   */
  static directionProperty = new Property<BoxPanel, Direction>({
    name: 'direction',
    value: Direction.TopToBottom,
    changed: (owner, old, value) => owner._onDirectionChanged(old, value),
  });

  /**
   * The property descriptor for the box panel spacing.
   *
   * The controls the fixed spacing between the child widgets, in
   * pixels. The default value is `8`.
   *
   * **See also:** [[spacing]]
   */
  static spacingProperty = new Property<BoxPanel, number>({
    name: 'spacing',
    value: 8,
    coerce: (owner, value) => Math.max(0, value | 0),
    changed: owner => postMessage(owner, Panel.MsgLayoutRequest),
  });

  /**
   * The property descriptor for a widget stretch factor.
   *
   * This is an attached property which controls how much a child widget
   * stretches or shrinks relative to its siblings when the box panel is
   * resized. The default value is `0`.
   *
   * **See also:** [[getStretch]], [[setStretch]]
   */
  static stretchProperty = new Property<Widget, number>({
    name: 'stretch',
    value: 0,
    coerce: (owner, value) => Math.max(0, value | 0),
    changed: onChildPropertyChanged,
  });

  /**
   * The property descriptor for a widget size basis.
   *
   * This is an attached property which controls the preferred size of
   * a child widget. The widget will be initialized to this size before
   * being expanded or shrunk to fit the available layout space. The
   * default value is `0`.
   *
   * **See also:** [[getSizeBasis]], [[setSizeBasis]]
   */
  static sizeBasisProperty = new Property<Widget, number>({
    name: 'sizeBasis',
    value: 0,
    coerce: (owner, value) => Math.max(0, value | 0),
    changed: onChildPropertyChanged,
  });

  /**
   * Get the box panel stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The box panel stretch factor for the widget.
   *
   * #### Notes
   * This is a pure delegate to the [[stretchProperty]].
   */
  static getStretch(widget: Widget): number {
    return BoxPanel.stretchProperty.get(widget);
  }

  /**
   * Set the box panel stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the stretch factor.
   *
   * #### Notes
   * This is a pure delegate to the [[stretchProperty]].
   */
  static setStretch(widget: Widget, value: number): void {
    BoxPanel.stretchProperty.set(widget, value);
  }

  /**
   * Get the box panel size basis for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The box panel size basis for the widget.
   *
   * #### Notes
   * This is a pure delegate to the [[sizeBasisProperty]].
   */
  static getSizeBasis(widget: Widget): number {
    return BoxPanel.sizeBasisProperty.get(widget);
  }

  /**
   * Set the box panel size basis for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the size basis.
   *
   * #### Notes
   * This is a pure delegate to the [[sizeBasisProperty]].
   */
  static setSizeBasis(widget: Widget, value: number): void {
    BoxPanel.sizeBasisProperty.set(widget, value);
  }

  /**
   * Construct a new box panel.
   */
  constructor() {
    super();
    this.addClass(BOX_PANEL_CLASS);
    this.addClass(TOP_TO_BOTTOM_CLASS);
  }

  /**
   * Dispose of the resources held by the panel.
   */
  dispose(): void {
    this._sizers.length = 0;
    super.dispose();
  }

  /**
   * Get the layout direction for the box panel.
   *
   * #### Notes
   * This is a pure delegate to the [[directionProperty]].
   */
  get direction(): Direction {
    return BoxPanel.directionProperty.get(this);
  }

  /**
   * Set the layout direction for the box panel.
   *
   * #### Notes
   * This is a pure delegate to the [[directionProperty]].
   */
  set direction(value: Direction) {
    BoxPanel.directionProperty.set(this, value);
  }

  /**
   * Get the inter-element spacing for the box panel.
   *
   * #### Notes
   * This is a pure delegate to the [[spacingProperty]].
   */
  get spacing(): number {
    return BoxPanel.spacingProperty.get(this);
  }

  /**
   * Set the inter-element spacing for the box panel.
   *
   * #### Notes
   * This is a pure delegate to the [[spacingProperty]].
   */
  set spacing(value: number) {
    BoxPanel.spacingProperty.set(this, value);
  }

  /**
   * A message handler invoked on a `'child-added'` message.
   */
  protected onChildAdded(msg: ChildMessage): void {
    arrays.insert(this._sizers, msg.currentIndex, new BoxSizer());
    this.node.appendChild(msg.child.node);
    if (this.isAttached) sendMessage(msg.child, Widget.MsgAfterAttach);
    postMessage(this, Panel.MsgLayoutRequest);
  }

  /**
   * A message handler invoked on a `'child-moved'` message.
   */
  protected onChildMoved(msg: ChildMessage): void {
    arrays.move(this._sizers, msg.previousIndex, msg.currentIndex);
    postMessage(this, Widget.MsgUpdateRequest);
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: ChildMessage): void {
    arrays.removeAt(this._sizers, msg.previousIndex);
    if (this.isAttached) sendMessage(msg.child, Widget.MsgBeforeDetach);
    this.node.removeChild(msg.child.node);
    postMessage(this, Panel.MsgLayoutRequest);
    resetGeometry(msg.child);
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   */
  protected onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    sendMessage(this, Widget.MsgUpdateRequest);
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    postMessage(this, Panel.MsgLayoutRequest);
  }

  /**
   * A message handler invoked on a `'child-shown'` message.
   */
  protected onChildShown(msg: ChildMessage): void {
    postMessage(this, Panel.MsgLayoutRequest);
  }

  /**
   * A message handler invoked on a `'child-hidden'` message.
   */
  protected onChildHidden(msg: ChildMessage): void {
    postMessage(this, Panel.MsgLayoutRequest);
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: ResizeMessage): void {
    if (this.isVisible) {
      let width = msg.width < 0 ? this.node.offsetWidth : msg.width;
      let height = msg.height < 0 ? this.node.offsetHeight : msg.height;
      this._layoutChildren(width, height);
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.isVisible) {
      this._layoutChildren(this.node.offsetWidth, this.node.offsetHeight);
    }
  }

  /**
   * A message handler invoked on a `'layout-request'` message.
   */
  protected onLayoutRequest(msg: Message): void {
    if (this.isAttached) {
      this._setupGeometry();
    }
  }

  /**
   * Update the size constraints of the panel.
   */
  private _setupGeometry(): void {
    // Compute the visible item count.
    let visibleCount = 0;
    let children = this.children;
    for (let i = 0, n = children.length; i < n; ++i) {
      if (!children.get(i).hidden) visibleCount++;
    }

    // Update the fixed space for the visible items.
    this._fixedSpace = this.spacing * Math.max(0, visibleCount - 1);

    // Update the sizers and compute the new size limits.
    let minW = 0;
    let minH = 0;
    let maxW = Infinity;
    let maxH = Infinity;
    let dir = this.direction;
    if (dir === Direction.LeftToRight || dir === Direction.RightToLeft) {
      minW = this._fixedSpace;
      maxW = visibleCount > 0 ? minW : maxW;
      for (let i = 0, n = children.length; i < n; ++i) {
        let widget = children.get(i);
        let sizer = this._sizers[i];
        if (widget.hidden) {
          sizer.minSize = 0;
          sizer.maxSize = 0;
          continue;
        }
        let limits = sizeLimits(widget.node);
        sizer.sizeHint = BoxPanel.getSizeBasis(widget);
        sizer.stretch = BoxPanel.getStretch(widget);
        sizer.minSize = limits.minWidth;
        sizer.maxSize = limits.maxWidth;
        minW += limits.minWidth;
        maxW += limits.maxWidth;
        minH = Math.max(minH, limits.minHeight);
        maxH = Math.min(maxH, limits.maxHeight);
      }
    } else {
      minH = this._fixedSpace;
      maxH = visibleCount > 0 ? minH : maxH;
      for (let i = 0, n = children.length; i < n; ++i) {
        let widget = children.get(i);
        let sizer = this._sizers[i];
        if (widget.hidden) {
          sizer.minSize = 0;
          sizer.maxSize = 0;
          continue;
        }
        let limits = sizeLimits(widget.node);
        sizer.sizeHint = BoxPanel.getSizeBasis(widget);
        sizer.stretch = BoxPanel.getStretch(widget);
        sizer.minSize = limits.minHeight;
        sizer.maxSize = limits.maxHeight;
        minH += limits.minHeight;
        maxH += limits.maxHeight;
        minW = Math.max(minW, limits.minWidth);
        maxW = Math.min(maxW, limits.maxWidth);
      }
    }

    // Update the box sizing and add it to the size constraints.
    this._box = boxSizing(this.node);
    minW += this._box.horizontalSum;
    minH += this._box.verticalSum;
    maxW += this._box.horizontalSum;
    maxH += this._box.verticalSum;

    // Update the panel's size constraints.
    let style = this.node.style;
    style.minWidth = minW + 'px';
    style.minHeight = minH + 'px';
    style.maxWidth = maxW === Infinity ? 'none' : maxW + 'px';
    style.maxHeight = maxH === Infinity ? 'none' : maxH + 'px';

    // Notifiy the parent that it should relayout.
    if (this.parent) sendMessage(this.parent, Panel.MsgLayoutRequest);

    // Update the layout for the child widgets.
    sendMessage(this, Widget.MsgUpdateRequest);
  }

  /**
   * Layout the children using the given offset width and height.
   */
  private _layoutChildren(offsetWidth: number, offsetHeight: number): void {
    // Bail early if their are no children to arrange.
    let children = this.children;
    if (children.length === 0) {
      return;
    }

    // Ensure the box sizing is created.
    let box = this._box || (this._box = boxSizing(this.node));

    // Compute the actual layout bounds adjusted for border and padding.
    let top = box.paddingTop;
    let left = box.paddingLeft;
    let width = offsetWidth - box.horizontalSum;
    let height = offsetHeight - box.verticalSum;

    // Distribute the layout space and layout the items.
    let dir = this.direction;
    let spacing = this.spacing;
    if (dir === Direction.LeftToRight) {
      boxCalc(this._sizers, Math.max(0, width - this._fixedSpace));
      for (let i = 0, n = children.length; i < n; ++i) {
        let widget = children.get(i);
        if (widget.hidden) {
          continue;
        }
        let size = this._sizers[i].size;
        setGeometry(widget, left, top, size, height);
        left += size + spacing;
      }
    } else if (dir === Direction.TopToBottom) {
      boxCalc(this._sizers, Math.max(0, height - this._fixedSpace));
      for (let i = 0, n = children.length; i < n; ++i) {
        let widget = children.get(i);
        if (widget.hidden) {
          continue;
        }
        let size = this._sizers[i].size;
        setGeometry(widget, left, top, width, size);
        top += size + spacing;
      }
    } else if (dir === Direction.RightToLeft) {
      left += width;
      boxCalc(this._sizers, Math.max(0, width - this._fixedSpace));
      for (let i = 0, n = children.length; i < n; ++i) {
        let widget = children.get(i);
        if (widget.hidden) {
          continue;
        }
        let size = this._sizers[i].size;
        setGeometry(widget, left - size, top, size, height);
        left -= size + spacing;
      }
    } else {
      top += height;
      boxCalc(this._sizers, Math.max(0, height - this._fixedSpace));
      for (let i = 0, n = children.length; i < n; ++i) {
        let widget = children.get(i);
        if (widget.hidden) {
          continue;
        }
        let size = this._sizers[i].size;
        setGeometry(widget, left, top - size, width, size);
        top -= size + spacing;
      }
    }
  }

  /**
   * The change handler for the [[orientationProperty]].
   */
  private _onDirectionChanged(old: Direction, value: Direction): void {
    this.toggleClass(LEFT_TO_RIGHT_CLASS, value === Direction.LeftToRight);
    this.toggleClass(RIGHT_TO_LEFT_CLASS, value === Direction.RightToLeft);
    this.toggleClass(TOP_TO_BOTTOM_CLASS, value === Direction.TopToBottom);
    this.toggleClass(BOTTOM_TO_TOP_CLASS, value === Direction.BottomToTop);
    postMessage(this, Panel.MsgLayoutRequest);
  }

  private _fixedSpace = 0;
  private _box: IBoxSizing = null;
  private _sizers: BoxSizer[] = [];
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
 * A private attached property which stores a widget offset rect.
 */
const rectProperty = new Property<Widget, IRect>({
  name: 'rect',
  create: createRect,
});


/**
 * Create a new offset rect filled with NaNs.
 */
function createRect(): IRect {
  return { top: NaN, left: NaN, width: NaN, height: NaN };
}


/**
 * Get the offset rect for a widget.
 */
function getRect(widget: Widget): IRect {
  return rectProperty.get(widget);
}


/**
 * Set the offset geometry for the given widget.
 *
 * A resize message will be dispatched to the widget if appropriate.
 */
function setGeometry(widget: Widget, left: number, top: number, width: number, height: number): void {
  let resized = false;
  let rect = getRect(widget);
  let style = widget.node.style;
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


/**
 * Reset the inline geometry and rect cache for the given widget
 */
function resetGeometry(widget: Widget): void {
  let rect = getRect(widget);
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
 * The change handler for the attached child properties.
 */
function onChildPropertyChanged(child: Widget): void {
  if (child.parent instanceof BoxPanel) {
    postMessage(child.parent, Panel.MsgLayoutRequest);
  }
}

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
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  ChildMessage, MSG_AFTER_ATTACH, MSG_BEFORE_DETACH, MSG_LAYOUT_REQUEST,
  ResizeMessage, Widget, clearLayoutGeometry, getLayoutGeometry,
  setLayoutGeometry
} from 'phosphor-widget';

import './index.css';


/**
 * `p-BoxPanel`: the class name added to BoxPanel instances.
 */
export
const BOX_PANEL_CLASS = 'p-BoxPanel';

/**
 * `p-mod-left-to-right`: the class name added to ltr box panels.
 */
export
const LTR_CLASS = 'p-mod-left-to-right';

/**
 * `p-mod-right-to-left`: the class name added to rtl box panels.
 */
export
const RTL_CLASS = 'p-mod-right-to-left';

/**
 * `p-mod-top-to-bottom`: the class name added to ttb box panels.
 */
export
const TTB_CLASS = 'p-mod-top-to-bottom';

/**
 * `p-mod-bottom-to-top`: the class name added to btt box panels.
 */
export
const BTT_CLASS = 'p-mod-bottom-to-top';


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
class BoxPanel extends Widget {
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
    value: 8,
    coerce: (owner, value) => Math.max(0, value | 0),
    changed: owner => postMessage(owner, MSG_LAYOUT_REQUEST),
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
    value: 0,
    coerce: (owner, value) => Math.max(0, value | 0),
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
    value: 0,
    coerce: (owner, value) => Math.max(0, value | 0),
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
    this.addClass(TTB_CLASS);
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
    Property.getChanged(msg.child).connect(this._onPropertyChanged, this);
    arrays.insert(this._sizers, msg.currentIndex, new BoxSizer());
    this.node.appendChild(msg.child.node);
    if (this.isAttached) sendMessage(msg.child, MSG_AFTER_ATTACH);
    postMessage(this, MSG_LAYOUT_REQUEST);
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: ChildMessage): void {
    Property.getChanged(msg.child).disconnect(this._onPropertyChanged, this);
    arrays.removeAt(this._sizers, msg.previousIndex);
    if (this.isAttached) sendMessage(msg.child, MSG_BEFORE_DETACH);
    this.node.removeChild(msg.child.node);
    postMessage(this, MSG_LAYOUT_REQUEST);
    clearLayoutGeometry(msg.child);
  }

  /**
   * A message handler invoked on a `'child-moved'` message.
   */
  protected onChildMoved(msg: ChildMessage): void {
    arrays.move(this._sizers, msg.previousIndex, msg.currentIndex);
    this.update();
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   */
  protected onAfterShow(msg: Message): void {
    this.update(true);
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    postMessage(this, MSG_LAYOUT_REQUEST);
  }

  /**
   * A message handler invoked on a `'child-shown'` message.
   */
  protected onChildShown(msg: ChildMessage): void {
    postMessage(this, MSG_LAYOUT_REQUEST);
  }

  /**
   * A message handler invoked on a `'child-hidden'` message.
   */
  protected onChildHidden(msg: ChildMessage): void {
    postMessage(this, MSG_LAYOUT_REQUEST);
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: ResizeMessage): void {
    if (this.isVisible) {
      var width = msg.width;
      var height = msg.height;
      if (width < 0 || height < 0) {
        var geo = getLayoutGeometry(this);
        if (width < 0) width = geo ? geo.width : this.node.offsetWidth;
        if (height < 0) height = geo ? geo.height : this.node.offsetHeight;
      }
      this._layoutChildren(width, height);
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.isVisible) {
      var geo = getLayoutGeometry(this);
      var width = geo ? geo.width : this.node.offsetWidth;
      var height = geo ? geo.height : this.node.offsetHeight;
      this._layoutChildren(width, height);
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
    var visibleCount = 0;
    for (var i = 0, n = this.childCount; i < n; ++i) {
      if (!this.childAt(i).hidden) visibleCount++;
    }

    // Update the fixed space for the visible items.
    this._fixedSpace = this.spacing * Math.max(0, visibleCount - 1);

    // Update the sizers and compute the new size limits.
    var minW = 0;
    var minH = 0;
    var maxW = Infinity;
    var maxH = Infinity;
    var dir = this.direction;
    if (dir === Direction.LeftToRight || dir === Direction.RightToLeft) {
      minW = this._fixedSpace;
      maxW = visibleCount > 0 ? minW : maxW;
      for (var i = 0, n = this.childCount; i < n; ++i) {
        var widget = this.childAt(i);
        var sizer = this._sizers[i];
        if (widget.hidden) {
          sizer.minSize = 0;
          sizer.maxSize = 0;
          continue;
        }
        var limits = sizeLimits(widget.node);
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
      for (var i = 0, n = this.childCount; i < n; ++i) {
        var widget = this.childAt(i);
        var sizer = this._sizers[i];
        if (widget.hidden) {
          sizer.minSize = 0;
          sizer.maxSize = 0;
          continue;
        }
        var limits = sizeLimits(widget.node);
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

    // Add the box sizing to the size constraints.
    var box = this._box = boxSizing(this.node);
    minW += box.horizontalSum;
    minH += box.verticalSum;
    maxW += box.horizontalSum;
    maxH += box.verticalSum;

    // Update the inline style size constraints.
    var style = this.node.style;
    style.minWidth = minW + 'px';
    style.minHeight = minH + 'px';
    style.maxWidth = maxW < Infinity ? maxW + 'px' : '';
    style.maxHeight = maxH < Infinity ? maxH + 'px' : '';

    // Notifiy the parent that it should relayout.
    if (this.parent) sendMessage(this.parent, MSG_LAYOUT_REQUEST);

    // Update the layout for the child widgets.
    this.update(true);
  }

  /**
   * Layout the children using the given offset width and height.
   */
  private _layoutChildren(offsetWidth: number, offsetHeight: number): void {
    // Bail early if their are no children to arrange.
    if (this.childCount === 0) {
      return;
    }

    // Ensure the box sizing is computed for the panel.
    var box = this._box || (this._box = boxSizing(this.node));

    // Compute the actual layout bounds adjusted for border and padding.
    var top = box.paddingTop;
    var left = box.paddingLeft;
    var width = offsetWidth - box.horizontalSum;
    var height = offsetHeight - box.verticalSum;

    // Distribute the layout space and layout the items.
    var dir = this.direction;
    var spacing = this.spacing;
    if (dir === Direction.LeftToRight) {
      boxCalc(this._sizers, Math.max(0, width - this._fixedSpace));
      for (var i = 0, n = this.childCount; i < n; ++i) {
        var widget = this.childAt(i);
        if (widget.hidden) {
          continue;
        }
        var size = this._sizers[i].size;
        setLayoutGeometry(widget, left, top, size, height);
        left += size + spacing;
      }
    } else if (dir === Direction.TopToBottom) {
      boxCalc(this._sizers, Math.max(0, height - this._fixedSpace));
      for (var i = 0, n = this.childCount; i < n; ++i) {
        var widget = this.childAt(i);
        if (widget.hidden) {
          continue;
        }
        var size = this._sizers[i].size;
        setLayoutGeometry(widget, left, top, width, size);
        top += size + spacing;
      }
    } else if (dir === Direction.RightToLeft) {
      left += width;
      boxCalc(this._sizers, Math.max(0, width - this._fixedSpace));
      for (var i = 0, n = this.childCount; i < n; ++i) {
        var widget = this.childAt(i);
        if (widget.hidden) {
          continue;
        }
        var size = this._sizers[i].size;
        setLayoutGeometry(widget, left - size, top, size, height);
        left -= size + spacing;
      }
    } else {
      top += height;
      boxCalc(this._sizers, Math.max(0, height - this._fixedSpace));
      for (var i = 0, n = this.childCount; i < n; ++i) {
        var widget = this.childAt(i);
        if (widget.hidden) {
          continue;
        }
        var size = this._sizers[i].size;
        setLayoutGeometry(widget, left, top - size, width, size);
        top -= size + spacing;
      }
    }
  }

  /**
   * The change handler for the [[orientationProperty]].
   */
  private _onDirectionChanged(old: Direction, value: Direction): void {
    this.toggleClass(LTR_CLASS, value === Direction.LeftToRight);
    this.toggleClass(RTL_CLASS, value === Direction.RightToLeft);
    this.toggleClass(TTB_CLASS, value === Direction.TopToBottom);
    this.toggleClass(BTT_CLASS, value === Direction.BottomToTop);
    postMessage(this, MSG_LAYOUT_REQUEST);
  }

  /**
   * The handler for the child property changed signal.
   */
  private _onPropertyChanged(sender: Widget, args: IChangedArgs): void {
    switch (args.property) {
    case BoxPanel.stretchProperty:
    case BoxPanel.sizeBasisProperty:
      postMessage(this, MSG_LAYOUT_REQUEST);
    }
  }

  private _fixedSpace = 0;
  private _box: IBoxSizing = null;
  private _sizers: BoxSizer[] = [];
}

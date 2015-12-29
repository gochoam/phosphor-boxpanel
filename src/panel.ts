/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Panel
} from 'phosphor-panel';

import {
  ChildMessage, Widget
} from 'phosphor-widget';

import {
  BoxLayout, Direction
} from './layout';


/**
 * The class name added to BoxPanel instances.
 */
const BOX_PANEL_CLASS = 'p-BoxPanel';

/**
 * The class name added to a BoxPanel child.
 */
const CHILD_CLASS = 'p-BoxPanel-child';


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

  /**
   * A message handler invoked on a `'child-added'` message.
   */
  protected onChildAdded(msg: ChildMessage): void {
    msg.child.addClass(CHILD_CLASS);
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: ChildMessage): void {
    msg.child.removeClass(CHILD_CLASS);
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

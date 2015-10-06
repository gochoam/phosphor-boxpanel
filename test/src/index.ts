/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

import {
  Message, clearMessageData, sendMessage
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  MSG_LAYOUT_REQUEST, ResizeMessage, Widget, attachWidget
} from 'phosphor-widget';

import {
  BOTTOM_TO_TOP_CLASS, BOX_PANEL_CLASS, BoxPanel, Direction,
  LEFT_TO_RIGHT_CLASS, RIGHT_TO_LEFT_CLASS, TOP_TO_BOTTOM_CLASS
} from '../../lib/index';


class LogPanel extends BoxPanel {

  messages: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }
}


class LogWidget extends Widget {

  messages: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }
}


describe('phosphor-boxpanel', () => {


  describe('BOX_PANEL_CLASS', () => {

    it('should equal `p-BoxPanel`', () => {
      expect(BOX_PANEL_CLASS).to.be('p-BoxPanel');
    });

  });

  describe('LEFT_TO_RIGHT_CLASS', () => {

    it('should equal `p-mod-left-to-right`', () => {
      expect(LEFT_TO_RIGHT_CLASS).to.be('p-mod-left-to-right');
    });

  });

  describe('RIGHT_TO_LEFT_CLASS', () => {

    it('should equal `p-mod-right-to-left`', () => {
      expect(RIGHT_TO_LEFT_CLASS).to.be('p-mod-right-to-left');
    });

  });

  describe('TOP_TO_BOTTOM_CLASS', () => {

    it('should equal `p-mod-top-to-bottom`', () => {
      expect(TOP_TO_BOTTOM_CLASS).to.be('p-mod-top-to-bottom');
    });

  });

  describe('BOTTOM_TO_TOP_CLASS', () => {

    it('should equal `p-mod-bottom-to-top`', () => {
      expect(BOTTOM_TO_TOP_CLASS).to.be('p-mod-bottom-to-top');
    });

  });

  describe('BoxPanel', () => {

    describe('.LeftToRight', () => {

      it('should be an alias of the `LeftToRight` Direction', () => {
        expect(BoxPanel.LeftToRight).to.be(Direction.LeftToRight);
      });

    });

    describe('.RightToLeft', () => {

      it('should be an alias of the `RightToLeft` Direction', () => {
        expect(BoxPanel.RightToLeft).to.be(Direction.RightToLeft);
      });

    });

    describe('.TopToBottom', () => {

      it('should be an alias of the `TopToBottom` Direction', () => {
        expect(BoxPanel.TopToBottom).to.be(Direction.TopToBottom);
      });

    });

    describe('.BottomToTop', () => {

      it('should be an alias of the `BottomToTop` Direction', () => {
        expect(BoxPanel.BottomToTop).to.be(Direction.BottomToTop);
      });

    });

    describe('.directionProperty', () => {

      it('should be a property descriptor', () => {
        expect(BoxPanel.directionProperty instanceof Property).to.be(true);
      });

      it('should default to `TopToBottom`', () => {
        var panel = new BoxPanel();
        var direction = BoxPanel.directionProperty.get(panel);
        expect(direction).to.be(Direction.TopToBottom);
      });

      it('should toggle the directional CSS classes', () => {
        var panel = new LogPanel();
        BoxPanel.directionProperty.set(panel, Direction.LeftToRight);
        expect(panel.hasClass(LEFT_TO_RIGHT_CLASS)).to.be(true);
        expect(panel.hasClass(RIGHT_TO_LEFT_CLASS)).to.be(false);
        expect(panel.hasClass(TOP_TO_BOTTOM_CLASS)).to.be(false);
        expect(panel.hasClass(BOTTOM_TO_TOP_CLASS)).to.be(false);
        BoxPanel.directionProperty.set(panel, Direction.RightToLeft);
        expect(panel.hasClass(LEFT_TO_RIGHT_CLASS)).to.be(false);
        expect(panel.hasClass(RIGHT_TO_LEFT_CLASS)).to.be(true);
        expect(panel.hasClass(TOP_TO_BOTTOM_CLASS)).to.be(false);
        expect(panel.hasClass(BOTTOM_TO_TOP_CLASS)).to.be(false);
        BoxPanel.directionProperty.set(panel, Direction.TopToBottom);
        expect(panel.hasClass(LEFT_TO_RIGHT_CLASS)).to.be(false);
        expect(panel.hasClass(RIGHT_TO_LEFT_CLASS)).to.be(false);
        expect(panel.hasClass(TOP_TO_BOTTOM_CLASS)).to.be(true);
        expect(panel.hasClass(BOTTOM_TO_TOP_CLASS)).to.be(false);
        BoxPanel.directionProperty.set(panel, Direction.BottomToTop);
        expect(panel.hasClass(LEFT_TO_RIGHT_CLASS)).to.be(false);
        expect(panel.hasClass(RIGHT_TO_LEFT_CLASS)).to.be(false);
        expect(panel.hasClass(TOP_TO_BOTTOM_CLASS)).to.be(false);
        expect(panel.hasClass(BOTTOM_TO_TOP_CLASS)).to.be(true);
      });

      it('should post a `layout-request`', (done) => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        clearMessageData(panel);
        BoxPanel.directionProperty.set(panel, Direction.BottomToTop);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('.spacingProperty', () => {

      it('should be a property descriptor', () => {
        expect(BoxPanel.spacingProperty instanceof Property).to.be(true);
      });

      it('should default to `8`', () => {
        var panel = new BoxPanel();
        expect(BoxPanel.spacingProperty.get(panel)).to.be(8);
      });

      it('should floor fractional values', () => {
        var panel = new BoxPanel();
        BoxPanel.spacingProperty.set(panel, 5.5);
        expect(BoxPanel.spacingProperty.get(panel)).to.be(5);
      });

      it('should clamp values to a minimum of zero', () => {
        var panel = new BoxPanel();
        BoxPanel.spacingProperty.set(panel, -4);
        expect(BoxPanel.spacingProperty.get(panel)).to.be(0);
      });

      it('should post a `layout-request`', (done) => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        clearMessageData(panel);
        BoxPanel.spacingProperty.set(panel, 4);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('.stretchProperty', () => {

      it('should be a property descriptor', () => {
        expect(BoxPanel.stretchProperty instanceof Property).to.be(true);
      });

      it('should default to `0`', () => {
        var widget = new Widget();
        expect(BoxPanel.stretchProperty.get(widget)).to.be(0);
      });

      it('should floor fractional values', () => {
        var widget = new Widget();
        BoxPanel.stretchProperty.set(widget, 5.5);
        expect(BoxPanel.stretchProperty.get(widget)).to.be(5);
      });

      it('should clamp values to a minimum of zero', () => {
        var widget = new Widget();
        BoxPanel.stretchProperty.set(widget, -4);
        expect(BoxPanel.stretchProperty.get(widget)).to.be(0);
      });

      it('should post a `layout-request` to the panel', (done) => {
        var panel = new LogPanel();
        var child0 = new Widget();
        var child1 = new Widget();
        attachWidget(panel, document.body);
        panel.children = [child0, child1];
        clearMessageData(panel);
        BoxPanel.stretchProperty.set(child0, 4);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('.sizeBasisProperty', () => {

      it('should be a property descriptor', () => {
        expect(BoxPanel.sizeBasisProperty instanceof Property).to.be(true);
      });

      it('should default to `0`', () => {
        var widget = new Widget();
        expect(BoxPanel.sizeBasisProperty.get(widget)).to.be(0);
      });

      it('should floor fractional values', () => {
        var widget = new Widget();
        BoxPanel.sizeBasisProperty.set(widget, 5.5);
        expect(BoxPanel.sizeBasisProperty.get(widget)).to.be(5);
      });

      it('should clamp values to a minimum of zero', () => {
        var widget = new Widget();
        BoxPanel.sizeBasisProperty.set(widget, -4);
        expect(BoxPanel.sizeBasisProperty.get(widget)).to.be(0);
      });

      it('should post `layout-request` to the parent', (done) => {
        var panel = new LogPanel();
        var child0 = new Widget();
        var child1 = new Widget();
        attachWidget(panel, document.body);
        panel.children = [child0, child1];
        clearMessageData(panel);
        BoxPanel.sizeBasisProperty.set(child0, 4);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('.getStretch', () => {

      it('should return the panel stretch factor for the given widget', () => {
        var widget = new Widget();
        expect(BoxPanel.getStretch(widget)).to.be(0);
      });

      it('should be a pure delegate to stretchProperty', () => {
        var widget = new Widget();
        BoxPanel.stretchProperty.set(widget, 1);
        expect(BoxPanel.getStretch(widget)).to.be(1);
      });

    });

    describe('.setStretch', () => {

      it('should set the split panel stretch factor for the given widget.', () => {
        var widget = new Widget();
        BoxPanel.setStretch(widget, 1);
        expect(BoxPanel.getStretch(widget)).to.be(1);
      });

      it('should be a pure delegate to stretchProperty', () => {
        var widget = new Widget();
        BoxPanel.setStretch(widget, 1);
        expect(BoxPanel.stretchProperty.get(widget)).to.be(1);
      });

    });

    describe('.getSizeBasis', () => {

      it('should return the box panel size basis for the given widget', () => {
        var widget = new Widget();
        expect(BoxPanel.getSizeBasis(widget)).to.be(0);
      });

      it('should be a pure delegate to stretchProperty', () => {
        var widget = new Widget();
        BoxPanel.sizeBasisProperty.set(widget, 1);
        expect(BoxPanel.getSizeBasis(widget)).to.be(1);
      });

    });

    describe('.setSizeBasis', () => {

      it('should set the box panel size basis for the given widget.', () => {
        var widget = new Widget();
        BoxPanel.setSizeBasis(widget, 1);
        expect(BoxPanel.getSizeBasis(widget)).to.be(1);
      });

      it('should be a pure delegate to sizeBasisProperty', () => {
        var widget = new Widget();
        BoxPanel.setSizeBasis(widget, 1);
        expect(BoxPanel.sizeBasisProperty.get(widget)).to.be(1);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        var panel = new BoxPanel();
        expect(panel instanceof BoxPanel).to.be(true);
      });

      it('should add `BOX_PANEL_CLASS` and `TOP_TO_BOTTOM_CLASS` ', () => {
        var panel = new BoxPanel();
        expect(panel.hasClass(BOX_PANEL_CLASS)).to.be(true);
        expect(panel.hasClass(TOP_TO_BOTTOM_CLASS)).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the panel', () => {
        var panel = new BoxPanel();
        panel.children = [new Widget(), new Widget()];
        panel.dispose();
        expect(panel.isDisposed).to.be(true);
        expect(panel.children.length).to.be(0);
      });

    });

    describe('#direction', () => {

      it('should get the layout direction for the box panel', () => {
        var panel = new BoxPanel();
        expect(panel.direction).to.be(Direction.TopToBottom);
      });

      it('should set the layout direction for the box panel', () => {
        var panel = new BoxPanel();
        panel.direction = Direction.LeftToRight;
        expect(panel.direction).to.be(Direction.LeftToRight);
      });

      it('should a pure delegate to the directionProperty', () => {
        var panel = new BoxPanel();
        BoxPanel.directionProperty.set(panel, Direction.LeftToRight);
        expect(panel.direction).to.be(Direction.LeftToRight);
        panel.direction = Direction.TopToBottom;
        var direction = BoxPanel.directionProperty.get(panel);
        expect(direction).to.be(Direction.TopToBottom);
      });

    });

    describe('#spacing', () => {

      it('should get the inter-element spacing for the box panel', () => {
        var panel = new BoxPanel();
        expect(panel.spacing).to.be(8);
      });

      it('should set the inter-element spacing for the box panel', () => {
        var panel = new BoxPanel();
        panel.spacing = 4;
        expect(panel.spacing).to.be(4);
      });

      it('should a pure delegate to the spacingProperty', () => {
        var panel = new BoxPanel();
        BoxPanel.spacingProperty.set(panel, 4);
        expect(panel.spacing).to.be(4);
        panel.spacing = 8;
        var spacing = BoxPanel.spacingProperty.get(panel);
        expect(spacing).to.be(8);
      });

    });

    describe('#onChildAdded()', () => {

      it('should be invoked when a child is added', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        expect(panel.messages.indexOf('child-added')).to.be(-1);
        panel.children = [widget];
        expect(panel.messages.indexOf('child-added')).to.not.be(-1);
      });

      it('should send `after-attach` to the child', () => {
        var panel = new LogPanel();
        var widget = new LogWidget();
        attachWidget(panel, document.body);
        expect(widget.messages.indexOf('after-attach')).to.be(-1);
        panel.children = [widget];
        expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
      });

      it('should post a `layout-request`', (done) => {
        var panel = new LogPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        clearMessageData(panel);
        panel.children = [widget];
        expect(panel.messages.indexOf('layout-request')).to.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('#onChildRemoved()', () => {

      it('should be invoked when a child is removed', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        panel.children = [widget];
        expect(panel.messages.indexOf('child-removed')).to.be(-1);
        panel.children = [];
        expect(panel.messages.indexOf('child-removed')).to.not.be(-1);
      });

      it('should send `before-detach` to the child', () => {
        var panel = new LogPanel();
        var widget = new LogWidget();
        attachWidget(panel, document.body);
        panel.children = [widget];
        expect(widget.messages.indexOf('before-detach')).to.be(-1);
        panel.children = [];
        expect(widget.messages.indexOf('before-detach')).to.not.be(-1);
      });

      it('should post a `layout-request`', (done) => {
        var panel = new LogPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        panel.children = [widget];
        clearMessageData(panel);
        panel.children = [];
        expect(panel.messages.indexOf('layout-request')).to.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

      it('should clear the offset geometry of the child', () => {
        var panel = new BoxPanel();
        var child = new Widget();
        panel.children = [child];
        child.setOffsetGeometry(5, 5, 5, 5);
        expect(child.offsetRect).to.eql({ left: 5, top: 5, width: 5, height: 5 });
        panel.children = [];
        expect(child.offsetRect).to.eql({ left: 0, top: 0, width: 0, height: 0 });
      });

    });

    describe('#onChildMoved()', () => {

      it('should be invoked when a child is moved', () => {
        var panel = new LogPanel();
        var widget0 = new Widget();
        var widget1 = new Widget();
        attachWidget(panel, document.body);
        panel.children = [widget0, widget1];
        expect(panel.messages.indexOf('child-moved')).to.be(-1);
        panel.moveChild(1, 0);
        expect(panel.messages.indexOf('child-moved')).to.not.be(-1);
      });

      it('should post an `update-request`', (done) => {
        var panel = new LogPanel();
        var widget0 = new Widget();
        var widget1 = new Widget();
        attachWidget(panel, document.body);
        panel.children = [widget0, widget1];
        clearMessageData(panel);
        panel.moveChild(1, 0);
        expect(panel.messages.indexOf('update-request')).to.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('update-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('#onAfterShow()', () => {

      it('should be invoked when the panel is shown', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        panel.hidden = true;
        expect(panel.messages.indexOf('after-show')).to.be(-1);
        panel.hidden = false;
        expect(panel.messages.indexOf('after-show')).to.not.be(-1);
      });

      it('should send an `update-request`', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        clearMessageData(panel);
        panel.hidden = true;
        expect(panel.messages.indexOf('update-request')).to.be(-1);
        panel.hidden = false;
        expect(panel.messages.indexOf('update-request')).to.not.be(-1);
      });

    });

    describe('#onAfterAttach()', () => {

      it('should be invoked when the panel is attached', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        expect(panel.messages.indexOf('after-attach')).to.not.be(-1);
      });

      it('post a `layout-request`', (done) => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        expect(panel.messages.indexOf('layout-request')).to.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('#onChildShown()', () => {

      it('should be invoked when a child is shown', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        widget.hidden = true;
        panel.children = [widget];
        attachWidget(panel, document.body);
        expect(panel.messages.indexOf('child-shown')).to.be(-1);
        widget.hidden = false;
        expect(panel.messages.indexOf('child-shown')).to.not.be(-1);
      });

      it('should post a `layout-request`', (done) => {
        var panel = new LogPanel();
        var widget = new Widget();
        widget.hidden = true;
        panel.children = [widget];
        attachWidget(panel, document.body);
        clearMessageData(panel);
        widget.hidden = false;
        expect(panel.messages.indexOf('layout-request')).to.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('#onChildHidden()', () => {

      it('should be invoked when a child is hidden', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.children = [widget];
        attachWidget(panel, document.body);
        expect(panel.messages.indexOf('child-hidden')).to.be(-1);
        widget.hidden = true;
        expect(panel.messages.indexOf('child-hidden')).to.not.be(-1);
      });

      it('should post a `layout-request`', (done) => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.children = [widget];
        attachWidget(panel, document.body);
        clearMessageData(panel);
        widget.hidden = true;
        expect(panel.messages.indexOf('layout-request')).to.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('#onResize()', () => {

      it('should be invoked on a `resize` message', () => {
        var panel = new LogPanel();
        var message = new ResizeMessage(100, 100);
        attachWidget(panel, document.body);
        sendMessage(panel, message);
        expect(panel.messages.indexOf('resize')).to.not.be(-1);
      });

      it('should handle an unknown size', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        sendMessage(panel, ResizeMessage.UnknownSize);
        expect(panel.messages.indexOf('resize')).to.not.be(-1);
      });

      it('should resize the children', () => {
        var panel = new BoxPanel();
        var child0 = new Widget();
        var child1 = new Widget();
        panel.children = [child0, child1];
        attachWidget(panel, document.body);
        panel.node.style.position = 'absolute';
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        panel.setOffsetGeometry(0, 0, 100, 100);
        var r1 = child0.offsetRect;
        var r2 = child1.offsetRect;
        expect(r1).to.eql({ left: 0, top: 0, width: 100, height: 46 });
        expect(r2).to.eql({ left: 0, top: 54, width: 100, height: 46 });
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked on an `update-request` message', () => {
        var panel = new LogPanel();
        panel.update(true);
        expect(panel.messages.indexOf('update-request')).to.not.be(-1);
      });

      it('should resize the children', () => {
        var panel = new BoxPanel();
        var child0 = new Widget();
        var child1 = new Widget();
        panel.children = [child0, child1];
        attachWidget(panel, document.body);
        panel.node.style.position = 'absolute';
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        panel.node.style.top = '0px';
        panel.node.style.left = '0px';
        panel.node.style.width = '200px';
        panel.node.style.height = '200px';
        panel.update(true);
        var r1 = child0.offsetRect;
        var r2 = child1.offsetRect;
        expect(r1).to.eql({ left: 0, top: 0, width: 200, height: 96 });
        expect(r2).to.eql({ left: 0, top: 104, width: 200, height: 96 });
      });

    });

    describe('#onLayoutRequest()', () => {

      it('should be invoked on a `layout-request` message', () => {
        var panel = new LogPanel();
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
      });

      it('should send a `layout-request` to its parent', () => {
        var panel1 = new LogPanel();
        var panel2 = new LogPanel();
        panel2.parent = panel1;
        attachWidget(panel1, document.body);
        clearMessageData(panel1);
        clearMessageData(panel2);
        expect(panel1.messages.indexOf('layout-request')).to.be(-1);
        sendMessage(panel2, MSG_LAYOUT_REQUEST);
        expect(panel1.messages.indexOf('layout-request')).to.not.be(-1);
      });

      it('should setup the geometry of the panel', () => {
        var panel = new BoxPanel();
        var child = new Widget();
        child.node.style.minWidth = '50px';
        child.node.style.minHeight = '50px';
        panel.children = [child];
        attachWidget(panel, document.body);
        expect(panel.node.style.minWidth).to.be('');
        expect(panel.node.style.minHeight).to.be('');
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        expect(panel.node.style.minWidth).to.be('50px');
        expect(panel.node.style.minHeight).to.be('50px');
      });

    });

    context('resize behavior', () => {

      it('should handle `left-to-right`', () => {
        var panel = new BoxPanel();
        var child0 = new Widget();
        var child1 = new Widget();
        var child2 = new Widget();
        child2.hidden = true;
        panel.direction = Direction.LeftToRight;
        child0.node.style.minWidth = '30px';
        child1.node.style.minHeight = '50px';
        panel.children = [child0, child1, child2];
        attachWidget(panel, document.body);
        panel.node.style.position = 'absolute';
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        panel.setOffsetGeometry(0, 0, 50, 100);
        var r1 = child0.offsetRect;
        var r2 = child1.offsetRect;
        expect(r1).to.eql({ left: 0, top: 0, width: 36, height: 100 });
        expect(r2).to.eql({ left: 44, top: 0, width: 6, height: 100 });
        expect(panel.node.style.minWidth).to.be('38px');
        expect(panel.node.style.minHeight).to.be('50px');
      });

      it('should handle `right-to-left`', () => {
        var panel = new BoxPanel();
        var child0 = new Widget();
        var child1 = new Widget();
        var child2 = new Widget();
        child2.hidden = true;
        panel.direction = Direction.RightToLeft;
        child0.node.style.minWidth = '30px';
        child1.node.style.minHeight = '50px';
        panel.children = [child0, child1, child2];
        attachWidget(panel, document.body);
        panel.node.style.position = 'absolute';
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        panel.setOffsetGeometry(0, 0, 50, 100);
        var r1 = child0.offsetRect;
        var r2 = child1.offsetRect;
        expect(r1).to.eql({ left: 14, top: 0, width: 36, height: 100 });
        expect(r2).to.eql({ left: 0, top: 0, width: 6, height: 100 });
        expect(panel.node.style.minWidth).to.be('38px');
        expect(panel.node.style.minHeight).to.be('50px');
      });

      it('should handle `top-to-bottom`', () => {
        var panel = new BoxPanel();
        var child0 = new Widget();
        var child1 = new Widget();
        var child2 = new Widget();
        child2.hidden = true;
        panel.direction = Direction.TopToBottom;
        child0.node.style.minWidth = '30px';
        child1.node.style.minHeight = '50px';
        panel.children = [child0, child1, child2];
        attachWidget(panel, document.body);
        panel.node.style.position = 'absolute';
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        panel.setOffsetGeometry(0, 0, 100, 70);
        var r1 = child0.offsetRect;
        var r2 = child1.offsetRect;
        expect(r1).to.eql({ left: 0, top: 0, width: 100, height: 6 });
        expect(r2).to.eql({ left: 0, top: 14, width: 100, height: 56 });
        expect(panel.node.style.minWidth).to.be('30px');
        expect(panel.node.style.minHeight).to.be('58px');
      });

      it('should handle `bottom-to-top`', () => {
        var panel = new BoxPanel();
        var child0 = new Widget();
        var child1 = new Widget();
        var child2 = new Widget();
        child2.hidden = true;
        panel.direction = Direction.BottomToTop;
        child0.node.style.minWidth = '30px';
        child1.node.style.minHeight = '50px';
        panel.children = [child0, child1, child2];
        attachWidget(panel, document.body);
        panel.node.style.position = 'absolute';
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        panel.setOffsetGeometry(0, 0, 100, 70);
        var r1 = child0.offsetRect;
        var r2 = child1.offsetRect;
        expect(r1).to.eql({ left: 0, top: 64, width: 100, height: 6 });
        expect(r2).to.eql({ left: 0, top: 0, width: 100, height: 56 });
        expect(panel.node.style.minWidth).to.be('30px');
        expect(panel.node.style.minHeight).to.be('58px');
      });

    });

  });

});

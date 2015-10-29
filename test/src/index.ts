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
  ResizeMessage, Widget
} from 'phosphor-widget';

import {
  BoxPanel, Direction
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
        let panel = new BoxPanel();
        let direction = BoxPanel.directionProperty.get(panel);
        expect(direction).to.be(Direction.TopToBottom);
      });

      it('should toggle the directional CSS classes', () => {
        let panel = new LogPanel();
        BoxPanel.directionProperty.set(panel, Direction.LeftToRight);
        expect(panel.hasClass('p-mod-left-to-right')).to.be(true);
        expect(panel.hasClass('p-mod-right-to-left')).to.be(false);
        expect(panel.hasClass('p-mod-top-to-bottom')).to.be(false);
        expect(panel.hasClass('p-mod-bottom-to-top')).to.be(false);
        BoxPanel.directionProperty.set(panel, Direction.RightToLeft);
        expect(panel.hasClass('p-mod-left-to-right')).to.be(false);
        expect(panel.hasClass('p-mod-right-to-left')).to.be(true);
        expect(panel.hasClass('p-mod-top-to-bottom')).to.be(false);
        expect(panel.hasClass('p-mod-bottom-to-top')).to.be(false);
        BoxPanel.directionProperty.set(panel, Direction.TopToBottom);
        expect(panel.hasClass('p-mod-left-to-right')).to.be(false);
        expect(panel.hasClass('p-mod-right-to-left')).to.be(false);
        expect(panel.hasClass('p-mod-top-to-bottom')).to.be(true);
        expect(panel.hasClass('p-mod-bottom-to-top')).to.be(false);
        BoxPanel.directionProperty.set(panel, Direction.BottomToTop);
        expect(panel.hasClass('p-mod-left-to-right')).to.be(false);
        expect(panel.hasClass('p-mod-right-to-left')).to.be(false);
        expect(panel.hasClass('p-mod-top-to-bottom')).to.be(false);
        expect(panel.hasClass('p-mod-bottom-to-top')).to.be(true);
      });

      it('should post a `layout-request`', (done) => {
        let panel = new LogPanel();
        Widget.attach(panel, document.body);
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
        let panel = new BoxPanel();
        expect(BoxPanel.spacingProperty.get(panel)).to.be(8);
      });

      it('should floor fractional values', () => {
        let panel = new BoxPanel();
        BoxPanel.spacingProperty.set(panel, 5.5);
        expect(BoxPanel.spacingProperty.get(panel)).to.be(5);
      });

      it('should clamp values to a minimum of zero', () => {
        let panel = new BoxPanel();
        BoxPanel.spacingProperty.set(panel, -4);
        expect(BoxPanel.spacingProperty.get(panel)).to.be(0);
      });

      it('should post a `layout-request`', (done) => {
        let panel = new LogPanel();
        Widget.attach(panel, document.body);
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
        let widget = new Widget();
        expect(BoxPanel.stretchProperty.get(widget)).to.be(0);
      });

      it('should floor fractional values', () => {
        let widget = new Widget();
        BoxPanel.stretchProperty.set(widget, 5.5);
        expect(BoxPanel.stretchProperty.get(widget)).to.be(5);
      });

      it('should clamp values to a minimum of zero', () => {
        let widget = new Widget();
        BoxPanel.stretchProperty.set(widget, -4);
        expect(BoxPanel.stretchProperty.get(widget)).to.be(0);
      });

      it('should post a `layout-request` to the panel', (done) => {
        let panel = new LogPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        Widget.attach(panel, document.body);
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
        let widget = new Widget();
        expect(BoxPanel.sizeBasisProperty.get(widget)).to.be(0);
      });

      it('should floor fractional values', () => {
        let widget = new Widget();
        BoxPanel.sizeBasisProperty.set(widget, 5.5);
        expect(BoxPanel.sizeBasisProperty.get(widget)).to.be(5);
      });

      it('should clamp values to a minimum of zero', () => {
        let widget = new Widget();
        BoxPanel.sizeBasisProperty.set(widget, -4);
        expect(BoxPanel.sizeBasisProperty.get(widget)).to.be(0);
      });

      it('should post `layout-request` to the parent', (done) => {
        let panel = new LogPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        Widget.attach(panel, document.body);
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
        let widget = new Widget();
        expect(BoxPanel.getStretch(widget)).to.be(0);
      });

      it('should be a pure delegate to stretchProperty', () => {
        let widget = new Widget();
        BoxPanel.stretchProperty.set(widget, 1);
        expect(BoxPanel.getStretch(widget)).to.be(1);
      });

    });

    describe('.setStretch', () => {

      it('should set the split panel stretch factor for the given widget.', () => {
        let widget = new Widget();
        BoxPanel.setStretch(widget, 1);
        expect(BoxPanel.getStretch(widget)).to.be(1);
      });

      it('should be a pure delegate to stretchProperty', () => {
        let widget = new Widget();
        BoxPanel.setStretch(widget, 1);
        expect(BoxPanel.stretchProperty.get(widget)).to.be(1);
      });

    });

    describe('.getSizeBasis', () => {

      it('should return the box panel size basis for the given widget', () => {
        let widget = new Widget();
        expect(BoxPanel.getSizeBasis(widget)).to.be(0);
      });

      it('should be a pure delegate to stretchProperty', () => {
        let widget = new Widget();
        BoxPanel.sizeBasisProperty.set(widget, 1);
        expect(BoxPanel.getSizeBasis(widget)).to.be(1);
      });

    });

    describe('.setSizeBasis', () => {

      it('should set the box panel size basis for the given widget.', () => {
        let widget = new Widget();
        BoxPanel.setSizeBasis(widget, 1);
        expect(BoxPanel.getSizeBasis(widget)).to.be(1);
      });

      it('should be a pure delegate to sizeBasisProperty', () => {
        let widget = new Widget();
        BoxPanel.setSizeBasis(widget, 1);
        expect(BoxPanel.sizeBasisProperty.get(widget)).to.be(1);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        let panel = new BoxPanel();
        expect(panel instanceof BoxPanel).to.be(true);
      });

      it('should add `p-BoxPanel` and `p-mod-top-to-bottom` ', () => {
        let panel = new BoxPanel();
        expect(panel.hasClass('p-BoxPanel')).to.be(true);
        expect(panel.hasClass('p-mod-top-to-bottom')).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the panel', () => {
        let panel = new BoxPanel();
        panel.children = [new Widget(), new Widget()];
        panel.dispose();
        expect(panel.isDisposed).to.be(true);
        expect(panel.children.length).to.be(0);
      });

    });

    describe('#direction', () => {

      it('should get the layout direction for the box panel', () => {
        let panel = new BoxPanel();
        expect(panel.direction).to.be(Direction.TopToBottom);
      });

      it('should set the layout direction for the box panel', () => {
        let panel = new BoxPanel();
        panel.direction = Direction.LeftToRight;
        expect(panel.direction).to.be(Direction.LeftToRight);
      });

      it('should a pure delegate to the directionProperty', () => {
        let panel = new BoxPanel();
        BoxPanel.directionProperty.set(panel, Direction.LeftToRight);
        expect(panel.direction).to.be(Direction.LeftToRight);
        panel.direction = Direction.TopToBottom;
        let direction = BoxPanel.directionProperty.get(panel);
        expect(direction).to.be(Direction.TopToBottom);
      });

    });

    describe('#spacing', () => {

      it('should get the inter-element spacing for the box panel', () => {
        let panel = new BoxPanel();
        expect(panel.spacing).to.be(8);
      });

      it('should set the inter-element spacing for the box panel', () => {
        let panel = new BoxPanel();
        panel.spacing = 4;
        expect(panel.spacing).to.be(4);
      });

      it('should a pure delegate to the spacingProperty', () => {
        let panel = new BoxPanel();
        BoxPanel.spacingProperty.set(panel, 4);
        expect(panel.spacing).to.be(4);
        panel.spacing = 8;
        let spacing = BoxPanel.spacingProperty.get(panel);
        expect(spacing).to.be(8);
      });

    });

    describe('#onChildAdded()', () => {

      it('should be invoked when a child is added', () => {
        let panel = new LogPanel();
        let widget = new Widget();
        Widget.attach(panel, document.body);
        expect(panel.messages.indexOf('child-added')).to.be(-1);
        panel.children = [widget];
        expect(panel.messages.indexOf('child-added')).to.not.be(-1);
      });

      it('should send `after-attach` to the child', () => {
        let panel = new LogPanel();
        let widget = new LogWidget();
        Widget.attach(panel, document.body);
        expect(widget.messages.indexOf('after-attach')).to.be(-1);
        panel.children = [widget];
        expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
      });

      it('should post a `layout-request`', (done) => {
        let panel = new LogPanel();
        let widget = new Widget();
        Widget.attach(panel, document.body);
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
        let panel = new LogPanel();
        let widget = new Widget();
        Widget.attach(panel, document.body);
        panel.children = [widget];
        expect(panel.messages.indexOf('child-removed')).to.be(-1);
        panel.children = [];
        expect(panel.messages.indexOf('child-removed')).to.not.be(-1);
      });

      it('should send `before-detach` to the child', () => {
        let panel = new LogPanel();
        let widget = new LogWidget();
        Widget.attach(panel, document.body);
        panel.children = [widget];
        expect(widget.messages.indexOf('before-detach')).to.be(-1);
        panel.children = [];
        expect(widget.messages.indexOf('before-detach')).to.not.be(-1);
      });

      it('should post a `layout-request`', (done) => {
        let panel = new LogPanel();
        let widget = new Widget();
        Widget.attach(panel, document.body);
        panel.children = [widget];
        clearMessageData(panel);
        panel.children = [];
        expect(panel.messages.indexOf('layout-request')).to.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('#onChildMoved()', () => {

      it('should be invoked when a child is moved', () => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        Widget.attach(panel, document.body);
        panel.children = [widget0, widget1];
        expect(panel.messages.indexOf('child-moved')).to.be(-1);
        panel.moveChild(1, 0);
        expect(panel.messages.indexOf('child-moved')).to.not.be(-1);
      });

      it('should post an `update-request`', (done) => {
        let panel = new LogPanel();
        let widget0 = new Widget();
        let widget1 = new Widget();
        Widget.attach(panel, document.body);
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
        let panel = new LogPanel();
        Widget.attach(panel, document.body);
        panel.hidden = true;
        expect(panel.messages.indexOf('after-show')).to.be(-1);
        panel.hidden = false;
        expect(panel.messages.indexOf('after-show')).to.not.be(-1);
      });

      it('should send an `update-request`', () => {
        let panel = new LogPanel();
        Widget.attach(panel, document.body);
        clearMessageData(panel);
        panel.hidden = true;
        expect(panel.messages.indexOf('update-request')).to.be(-1);
        panel.hidden = false;
        expect(panel.messages.indexOf('update-request')).to.not.be(-1);
      });

    });

    describe('#onAfterAttach()', () => {

      it('should be invoked when the panel is attached', () => {
        let panel = new LogPanel();
        Widget.attach(panel, document.body);
        expect(panel.messages.indexOf('after-attach')).to.not.be(-1);
      });

      it('post a `layout-request`', (done) => {
        let panel = new LogPanel();
        Widget.attach(panel, document.body);
        expect(panel.messages.indexOf('layout-request')).to.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('#onChildShown()', () => {

      it('should be invoked when a child is shown', () => {
        let panel = new LogPanel();
        let widget = new Widget();
        widget.hidden = true;
        panel.children = [widget];
        Widget.attach(panel, document.body);
        expect(panel.messages.indexOf('child-shown')).to.be(-1);
        widget.hidden = false;
        expect(panel.messages.indexOf('child-shown')).to.not.be(-1);
      });

      it('should post a `layout-request`', (done) => {
        let panel = new LogPanel();
        let widget = new Widget();
        widget.hidden = true;
        panel.children = [widget];
        Widget.attach(panel, document.body);
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
        let panel = new LogPanel();
        let widget = new Widget();
        panel.children = [widget];
        Widget.attach(panel, document.body);
        expect(panel.messages.indexOf('child-hidden')).to.be(-1);
        widget.hidden = true;
        expect(panel.messages.indexOf('child-hidden')).to.not.be(-1);
      });

      it('should post a `layout-request`', (done) => {
        let panel = new LogPanel();
        let widget = new Widget();
        panel.children = [widget];
        Widget.attach(panel, document.body);
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
        let panel = new LogPanel();
        let message = new ResizeMessage(100, 100);
        Widget.attach(panel, document.body);
        sendMessage(panel, message);
        expect(panel.messages.indexOf('resize')).to.not.be(-1);
      });

      it('should handle an unknown size', () => {
        let panel = new LogPanel();
        Widget.attach(panel, document.body);
        sendMessage(panel, ResizeMessage.UnknownSize);
        expect(panel.messages.indexOf('resize')).to.not.be(-1);
      });

      it('should resize the children', () => {
        let panel = new BoxPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        panel.children = [child0, child1];
        Widget.attach(panel, document.body);
        panel.node.style.position = 'absolute';
        panel.node.style.top = '0px';
        panel.node.style.left = '0px';
        panel.node.style.width = '0px';
        panel.node.style.height = '0px';
        sendMessage(panel, Widget.MsgLayoutRequest);
        panel.node.style.width = '100px';
        panel.node.style.height = '100px';
        sendMessage(panel, new ResizeMessage(100, 100));
        expect(child0.node.offsetTop).to.be(0);
        expect(child0.node.offsetLeft).to.be(0);
        expect(child0.node.offsetWidth).to.be(100);
        expect(child0.node.offsetHeight).to.be(46);
        expect(child1.node.offsetTop).to.be(54);
        expect(child1.node.offsetLeft).to.be(0);
        expect(child1.node.offsetWidth).to.be(100);
        expect(child1.node.offsetHeight).to.be(46);
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked on an `update-request` message', () => {
        let panel = new LogPanel();
        panel.update(true);
        expect(panel.messages.indexOf('update-request')).to.not.be(-1);
      });

      it('should resize the children', () => {
        let panel = new BoxPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        panel.children = [child0, child1];
        Widget.attach(panel, document.body);
        panel.node.style.position = 'absolute';
        panel.node.style.top = '0px';
        panel.node.style.left = '0px';
        panel.node.style.width = '0px';
        panel.node.style.height = '0px';
        sendMessage(panel, Widget.MsgLayoutRequest);
        panel.node.style.width = '200px';
        panel.node.style.height = '200px';
        panel.update(true);
        expect(child0.node.offsetTop).to.be(0);
        expect(child0.node.offsetLeft).to.be(0);
        expect(child0.node.offsetWidth).to.be(200);
        expect(child0.node.offsetHeight).to.be(96);
        expect(child1.node.offsetTop).to.be(104);
        expect(child1.node.offsetLeft).to.be(0);
        expect(child1.node.offsetWidth).to.be(200);
        expect(child1.node.offsetHeight).to.be(96);
      });

    });

    describe('#onLayoutRequest()', () => {

      it('should be invoked on a `layout-request` message', () => {
        let panel = new LogPanel();
        sendMessage(panel, Widget.MsgLayoutRequest);
        expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
      });

      it('should send a `layout-request` to its parent', () => {
        let panel1 = new LogPanel();
        let panel2 = new LogPanel();
        panel2.parent = panel1;
        Widget.attach(panel1, document.body);
        clearMessageData(panel1);
        clearMessageData(panel2);
        expect(panel1.messages.indexOf('layout-request')).to.be(-1);
        sendMessage(panel2, Widget.MsgLayoutRequest);
        expect(panel1.messages.indexOf('layout-request')).to.not.be(-1);
      });

      it('should setup the geometry of the panel', () => {
        let panel = new BoxPanel();
        let child = new Widget();
        child.node.style.minWidth = '50px';
        child.node.style.minHeight = '50px';
        panel.children = [child];
        Widget.attach(panel, document.body);
        expect(panel.node.style.minWidth).to.be('');
        expect(panel.node.style.minHeight).to.be('');
        sendMessage(panel, Widget.MsgLayoutRequest);
        expect(panel.node.style.minWidth).to.be('50px');
        expect(panel.node.style.minHeight).to.be('50px');
      });

    });

    context('resize behavior', () => {

      it('should handle `left-to-right`', () => {
        let panel = new BoxPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        child2.hidden = true;
        panel.direction = Direction.LeftToRight;
        child0.node.style.minWidth = '30px';
        child1.node.style.minHeight = '50px';
        panel.children = [child0, child1, child2];
        Widget.attach(panel, document.body);
        panel.node.style.position = 'absolute';
        panel.node.style.top = '0px';
        panel.node.style.left = '0px';
        panel.node.style.width = '50px';
        panel.node.style.height = '100px';
        sendMessage(panel, Widget.MsgLayoutRequest);
        expect(child0.node.offsetTop).to.be(0);
        expect(child0.node.offsetLeft).to.be(0);
        expect(child0.node.offsetWidth).to.be(36);
        expect(child0.node.offsetHeight).to.be(100);
        expect(child1.node.offsetTop).to.be(0);
        expect(child1.node.offsetLeft).to.be(44);
        expect(child1.node.offsetWidth).to.be(6);
        expect(child1.node.offsetHeight).to.be(100);
        expect(panel.node.style.minWidth).to.be('38px');
        expect(panel.node.style.minHeight).to.be('50px');
      });

      it('should handle `right-to-left`', () => {
        let panel = new BoxPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        child2.hidden = true;
        panel.direction = Direction.RightToLeft;
        child0.node.style.minWidth = '30px';
        child1.node.style.minHeight = '50px';
        panel.children = [child0, child1, child2];
        Widget.attach(panel, document.body);
        panel.node.style.position = 'absolute';
        panel.node.style.top = '0px';
        panel.node.style.left = '0px';
        panel.node.style.width = '50px';
        panel.node.style.height = '100px';
        sendMessage(panel, Widget.MsgLayoutRequest);
        expect(child0.node.offsetTop).to.be(0);
        expect(child0.node.offsetLeft).to.be(14);
        expect(child0.node.offsetWidth).to.be(36);
        expect(child0.node.offsetHeight).to.be(100);
        expect(child1.node.offsetTop).to.be(0);
        expect(child1.node.offsetLeft).to.be(0);
        expect(child1.node.offsetWidth).to.be(6);
        expect(child1.node.offsetHeight).to.be(100);
        expect(panel.node.style.minWidth).to.be('38px');
        expect(panel.node.style.minHeight).to.be('50px');
      });

      it('should handle `top-to-bottom`', () => {
        let panel = new BoxPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        child2.hidden = true;
        panel.direction = Direction.TopToBottom;
        child0.node.style.minWidth = '30px';
        child1.node.style.minHeight = '50px';
        panel.children = [child0, child1, child2];
        Widget.attach(panel, document.body);
        panel.node.style.position = 'absolute';
        panel.node.style.top = '0px';
        panel.node.style.left = '0px';
        panel.node.style.width = '100px';
        panel.node.style.height = '70px';
        sendMessage(panel, Widget.MsgLayoutRequest);
        expect(child0.node.offsetTop).to.be(0);
        expect(child0.node.offsetLeft).to.be(0);
        expect(child0.node.offsetWidth).to.be(100);
        expect(child0.node.offsetHeight).to.be(6);
        expect(child1.node.offsetTop).to.be(14);
        expect(child1.node.offsetLeft).to.be(0);
        expect(child1.node.offsetWidth).to.be(100);
        expect(child1.node.offsetHeight).to.be(56);
        expect(panel.node.style.minWidth).to.be('30px');
        expect(panel.node.style.minHeight).to.be('58px');
      });

      it('should handle `bottom-to-top`', () => {
        let panel = new BoxPanel();
        let child0 = new Widget();
        let child1 = new Widget();
        let child2 = new Widget();
        child2.hidden = true;
        panel.direction = Direction.BottomToTop;
        child0.node.style.minWidth = '30px';
        child1.node.style.minHeight = '50px';
        panel.children = [child0, child1, child2];
        Widget.attach(panel, document.body);
        panel.node.style.position = 'absolute';
        panel.node.style.top = '0px';
        panel.node.style.left = '0px';
        panel.node.style.width = '100px';
        panel.node.style.height = '70px';
        sendMessage(panel, Widget.MsgLayoutRequest);
        expect(child0.node.offsetTop).to.be(64);
        expect(child0.node.offsetLeft).to.be(0);
        expect(child0.node.offsetWidth).to.be(100);
        expect(child0.node.offsetHeight).to.be(6);
        expect(child1.node.offsetTop).to.be(0);
        expect(child1.node.offsetLeft).to.be(0);
        expect(child1.node.offsetWidth).to.be(100);
        expect(child1.node.offsetHeight).to.be(56);
        expect(panel.node.style.minWidth).to.be('30px');
        expect(panel.node.style.minHeight).to.be('58px');
      });

    });

  });

});

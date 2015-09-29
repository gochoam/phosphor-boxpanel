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
  Message, postMessage, sendMessage
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  attachWidget, detachWidget, ResizeMessage, Widget
} from 'phosphor-widget';

import {
  BOX_PANEL_CLASS, LTR_CLASS, RTL_CLASS, TTB_CLASS, BTT_CLASS, BoxPanel,
  Direction
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


function triggerMouseEvent (node: HTMLElement, eventType: string, options: any={}) {
  options.bubbles = true;
  var clickEvent = new MouseEvent(eventType, options);
  node.dispatchEvent(clickEvent);
}


describe('phosphor-boxpanel', () => {


  describe('BOX_PANEL_CLASS', () => {

    it('should equal `p-BoxPanel`', () => {
      expect(BOX_PANEL_CLASS).to.be('p-BoxPanel');
    });

  });

  describe('LTR_CLASS', () => {

    it('should equal `p-mod-left-to-right`', () => {
      expect(LTR_CLASS).to.be('p-mod-left-to-right');
    });

  });

  describe('RTL_CLASS', () => {

    it('should equal `p-mod-right-to-left`', () => {
      expect(RTL_CLASS).to.be('p-mod-right-to-left');
    });

  });

  describe('TTB_CLASS', () => {

    it('should equal `p-mod-top-to-bottom`', () => {
      expect(TTB_CLASS).to.be('p-mod-top-to-bottom');
    });

  });

  describe('BTT_CLASS', () => {

    it('should equal `p-mod-bottom-to-top`', () => {
      expect(BTT_CLASS).to.be('p-mod-bottom-to-top');
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

      it('should post `layout-request`', (done) => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
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
        var spacing = BoxPanel.spacingProperty.get(panel);
        expect(spacing).to.be(8);
      });

      it('should post `layout-request`', (done) => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
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
        var panel = new BoxPanel();
        var spacing = BoxPanel.stretchProperty.get(panel);
        expect(spacing).to.be(0);
      });

      it('should post `layout-request` to the parent', (done) => {
        var panel = new LogPanel();
        var child0 = new Widget();
        var child1 = new Widget();
        attachWidget(panel, document.body);
        panel.children = [child0, child1];
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
        var panel = new BoxPanel();
        var spacing = BoxPanel.sizeBasisProperty.get(panel);
        expect(spacing).to.be(0);
      });

      it('should post `layout-request` to the parent', (done) => {
        var panel = new LogPanel();
        var child0 = new Widget();
        var child1 = new Widget();
        attachWidget(panel, document.body);
        panel.children = [child0, child1];
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

      it('should add `BOX_PANEL_CLASS` and `TTB_CLASS` ', () => {
        var panel = new BoxPanel();
        expect(panel.hasClass(BOX_PANEL_CLASS)).to.be(true);
        expect(panel.hasClass(TTB_CLASS)).to.be(true);
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

      it('should be invoked when a child is added', (done) => {
        var panel = new LogPanel();
        var widget = new LogWidget();
        attachWidget(panel, document.body);
        panel.children = [widget];
        expect(panel.messages.indexOf('child-added')).to.not.be(-1);
        expect(panel.messages.indexOf('after-attach')).to.not.be(-1);
        expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('#onChildRemoved()', () => {

      it('should be invoked when a child is removed', (done) => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.children = [widget];
        attachWidget(panel, document.body);
        panel.messages = [];
        panel.children = [];
        expect(panel.messages.indexOf('child-removed')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });
      
    });

    describe('#onChildMoved()', () => {

      it('should be invoked when a child is moved', (done) => {
        var panel = new LogPanel();
        var widget0 = new Widget();
        var widget1 = new Widget();
        panel.children = [widget0, widget1];
        attachWidget(panel, document.body);
        panel.messages = [];
        panel.moveChild(1, 0);
        expect(panel.messages.indexOf('child-moved')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });
      
    });

    describe('#onAfterShow()', () => {

      it('should be invoked when the panel is shown', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        panel.hidden = true;
        panel.hidden = false;
        expect(panel.messages.indexOf('after-show')).to.not.be(-1);
      });
      
    });

    describe('#onAfterAttach()', () => {

      it('should be invoked when the panel is attached', (done) => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        expect(panel.messages.indexOf('after-attach')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

      it('should handle `LeftToRight`', () => {
        var top = new Widget();
        var panel = new LogPanel();
        var widget0 = new Widget();
        var widget1 = new Widget();
        panel.direction = Direction.LeftToRight;
        widget1.hidden = true;
        panel.children = [widget0, widget1];
        top.children = [panel];
        attachWidget(top, document.body);
        expect(panel.messages.indexOf('after-attach')).to.not.be(-1);
      });

      it('should handle `RightToLeft`', () => {
        var top = new Widget();
        var panel = new LogPanel();
        var widget0 = new Widget();
        var widget1 = new Widget();
        panel.direction = Direction.RightToLeft;
        widget1.hidden = true;
        panel.children = [widget0, widget1];
        top.children = [panel];
        attachWidget(top, document.body);
        expect(panel.messages.indexOf('after-attach')).to.not.be(-1);
      });

      it('should handle `BottomToTop`', () => {
        var top = new Widget();
        var panel = new LogPanel();
        var widget0 = new Widget();
        var widget1 = new Widget();
        panel.direction = Direction.BottomToTop;
        widget1.hidden = true;
        panel.children = [widget0, widget1];
        top.children = [panel];
        attachWidget(top, document.body);
        expect(panel.messages.indexOf('after-attach')).to.not.be(-1);
      });

    });

    describe('#onBeforeDetach()', () => {

      it('should be invoked when the panel is detached', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        detachWidget(panel);
        expect(panel.messages.indexOf('before-detach')).to.not.be(-1);
      });
      
    });

    describe('#onChildShown()', () => {

      it('should be invoked when a child is shown', (done) => {
        var panel = new LogPanel();
        var widget = new Widget();
        widget.hidden = true;
        panel.children = [widget];
        attachWidget(panel, document.body);
        widget.hidden = false;
        expect(panel.messages.indexOf('child-shown')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });
      
    });

    describe('#onChildHidden()', () => {

      it('should be invoked when a child is hidden', (done) => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.children = [widget];
        attachWidget(panel, document.body);
        widget.hidden = true;
        expect(panel.messages.indexOf('child-hidden')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });
      
    });

    describe('#onResize()', () => {

      it('should be invoked on resize event', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.children = [widget];
        attachWidget(panel, document.body);
        var message = new ResizeMessage(100, 100);
        sendMessage(panel, message);
        expect(panel.messages.indexOf('resize')).to.not.be(-1);
      });
      
      it('should be handle an unknown size', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.children = [widget];
        attachWidget(panel, document.body);
        sendMessage(panel, ResizeMessage.UnknownSize);
        expect(panel.messages.indexOf('resize')).to.not.be(-1);
      });
    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked on update', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.children = [widget];
        attachWidget(panel, document.body);
        panel.update(true);
        expect(panel.messages.indexOf('update-request')).to.not.be(-1);
      });

    });

    describe('#onLayoutRequest()', () => {

      it('should be invoked when a panel is attached', (done) => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

  });

});

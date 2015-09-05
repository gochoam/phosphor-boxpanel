/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use-strict';

import {
  BoxPanel
} from '../lib/index';

import {
  Widget, attachWidget
} from 'phosphor-widget';

import './index.css';


function createContent(name: string): Widget {
  var widget = new Widget();
  widget.addClass('content');
  widget.addClass(name);
  return widget;
}


function main(): void {
  var red = createContent('red');
  var green = createContent('green');
  var blue = createContent('blue');
  var yellow = createContent('yellow');

  BoxPanel.setStretch(red, 1);
  BoxPanel.setStretch(green, 2);
  BoxPanel.setStretch(blue, 3);
  BoxPanel.setStretch(yellow, 1);

  var panel = new BoxPanel();
  panel.children = [red, green, blue, yellow];
  panel.id = 'main';

  var refresh = () => {
    if (document.documentElement.offsetWidth < 600) {
      panel.direction = BoxPanel.TopToBottom;
    } else {
      panel.direction = BoxPanel.LeftToRight;
    }
    panel.update();
  };

  attachWidget(panel, document.body);

  refresh();

  window.onresize = refresh;
}


window.onload = main;

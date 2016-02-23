phosphor-boxpanel
=================

[![Build Status](https://travis-ci.org/phosphorjs/phosphor-boxpanel.svg)](https://travis-ci.org/phosphorjs/phosphor-boxpanel?branch=master)
[![Coverage Status](https://coveralls.io/repos/phosphorjs/phosphor-boxpanel/badge.svg?branch=master&service=github)](https://coveralls.io/github/phosphorjs/phosphor-boxpanel?branch=master)

This module provides a phosphor layout panel which arranges its children into a
single row or column, making possible to change the layout direction, spacing
and length.


Package Install
---------------

**Prerequisites**
- [node](http://nodejs.org/)

```bash
npm install --save phosphor-boxpanel
```


Source Build
------------

**Prerequisites**
- [git](http://git-scm.com/)
- [node](http://nodejs.org/)

```bash
git clone https://github.com/phosphorjs/phosphor-boxpanel.git
cd phosphor-boxpanel
npm install
```

**Rebuild**
```bash
npm run clean
npm run build
```


Run Tests
---------

Follow the source build instructions first.

```bash
# run tests in Firefox
npm test

# run tests in Chrome
npm run test:chrome

# run tests in IE
npm run test:ie
```


Build Docs
----------

Follow the source build instructions first.

```bash
npm run docs
```

Navigate to `docs/index.html`.


Build Example
-------------

Follow the source build instructions first.

```bash
npm run build:example
```

Navigate to `example/index.html`.


Supported Runtimes
------------------

The runtime versions which are currently *known to work* are listed below.
Earlier versions may also work, but come with no guarantees.

- IE 11+
- Firefox 32+
- Chrome 38+


Bundle for the Browser
----------------------

Follow the package install instructions first.

Any bundler that understands how to `require()` files with `.js` and `.css`
extensions can be used with this package.


Usage Examples
--------------

**Note:** This module is fully compatible with Node/Babel/ES6/ES5. Simply
omit the type declarations when using a language other than TypeScript.

The following block of code imports the required modules, `phosphor-boxpanel`
and `phosphor-widget`, then creates three widgets `w1`, `w2` and `w3` as basic
content to be placed later inside the panel:

```typescript
import {
  BoxPanel
} from 'phosphor-boxpanel';

import {
  Widget
} from 'phosphor-widget';


let w1 = new Widget();
let w2 = new Widget();
let w3 = new Widget();
```

The size of the widgets inside a box panel can be set by means of the widget
stretch factors, using relative sizes for each widget inside the box
panel. The following code sets the stretch factors to 1, 2 and 3, making `w2`
twice as wide as `w1` and `w3`3 times wider. The actual size depends on the box
area these have to fill:


```typescript
// Set the widget stretch factors (optional).
BoxPanel.setStretch(w1, 1);
BoxPanel.setStretch(w2, 2);
BoxPanel.setStretch(w3, 3);
```

Another option is to set the size basis using `.setSizeBasis()` which takes as
arguments the widget and the corresponding size in pixels.

```typescript
// Set the widget size basis (optional).
BoxPanel.setSizeBasis(w1, 200);
BoxPanel.setSizeBasis(w2, 650);
BoxPanel.setSizeBasis(w3, 350);
```

A box panel arranges its children in a single row or column, but some
parameters can be changed to customize the layout. `.direction` changes the
direction, it is possible to select `BottomToTop`, `LeftToRight`, `RightToLeft`
and `TopToBottom`. The inter-element spacing is set by `.spacing`

```typescript
// Setup the box panel.
let panel = new BoxPanel();
panel.direction = BoxPanel.LeftToRight;
panel.spacing = 5;
panel.addChild(w1);
panel.addChild(w2);
panel.addChild(w3);
```

There are other methods to achieve a more dynamic layout like `.hide()` and
`.show()`. Message handlers for several events are also provided:
`onAfterAttach()`, `onBeforeAttach()`, `onAfterShow()`, `onBeforeShow()` and so
on.

Changing css-related properties is simple, `phosphor-boxpanel` has methods to
set the panel id and toggle CSS classes:

```typescript
panel.id = 'main';
panel.addClass('foo');
panel.addClass('bar');
panel.removeClass('foo');
panel.toggleClass('bar', false);
```

A BoxPanel can be attached to the DOM with the `.attach()` method, which
ensures that the proper attachment messages are dispatched. Likewise box panels
can be detached from the DOM with the `.detach()` method, though it is more
common to simply use `.dispose()`.

```typescript
panel.attach(document.body);

// sometime later...
panel.detach();

// or almost equivalently
panel.dispose();
```


API
---

For a comprehensive list of the methods included see the 
[API Docs](http://phosphorjs.github.io/phosphor-boxpanel/api/)

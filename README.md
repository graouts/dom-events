dom-events
==========

Implementation of W3C DOM Events as a JavaScript component.

# Usage

You can create an EventTarget instance and use it to register event listeners and dispatch events:

```javascript
var DOM = require("dom-events");
var eventTarget = new DOM.EvenTarget;

// Register an event listener that is a simple callback
eventTarget.addEventListener("foo", function(event) {
    // …
});

// … or call a method in the scope of some object
eventTarget.addEventListener("foo", methodName, someObject);

// … or let that object implement the handleEvent(event) method and pass the object as the listener
eventTarget.addEventListener("foo", someObject);

// Dispatch an event!
eventTarget.dispatchEvent(new DOM.Event("foo"));
```

You can also use a mixin style and have any class or object become an EventTarget:

```javascript
var DOM = require("dom-events");

function Custom() {
    DOM.EventTarget(this);
}

Custom.prototype = {
    constructor: Custom,
    __proto__: DOM.EventTarget.prototype
}
```

/*
 * Copyright (C) 2008, 2013 Apple Inc. All Rights Reserved.
 * Copyright (C) 2014 Antoine Quint. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

module.exports = {
    EventTarget: EventTarget,
    Event: Event
};

function EventTarget(object) {
    // Support a mixin style.
    if (object) {
        object.addEventListener = EventTarget.prototype.addEventListener;
        object.removeEventListener = EventTarget.prototype.removeEventListener;
        object.dispatchEvent = EventTarget.prototype.dispatchEvent;
        return object;
    }
}

EventTarget.prototype = {
    constructor: EventTarget,

    addEventListener: function(eventType, listener, thisObject)
    {
        thisObject = thisObject || null;

        console.assert(eventType, "Object.addEventListener: invalid event type ", eventType, "(listener: ", listener, "thisObject: ", thisObject, ")");
        if (!eventType)
            return;

        console.assert(listener, "Object.addEventListener: invalid listener ", listener, "(event type: ", eventType, "thisObject: ", thisObject, ")");
        if (!listener)
            return;

        if (!this._listeners)
            this._listeners = {};

        var listeners = this._listeners[eventType];
        if (!listeners)
            listeners = this._listeners[eventType] = [];

        // Prevent registering multiple times.
        for (var i = 0; i < listeners.length; ++i) {
            if (listeners[i].listener === listener && listeners[i].thisObject === thisObject)
                return;
        }

        listeners.push({thisObject: thisObject, listener: listener});
    },

    /**
     * @param {string} eventType
     * @param {function(WebInspector.Event)} listener
     * @param {Object=} thisObject
     */
    removeEventListener: function(eventType, listener, thisObject)
    {
        eventType = eventType || null;
        listener = listener || null;
        thisObject = thisObject || null;

        if (!this._listeners)
            return;

        if (!eventType) {
            for (eventType in this._listeners)
                this.removeEventListener(eventType, listener, thisObject);
            return;
        }

        var listeners = this._listeners[eventType];
        if (!listeners)
            return;

        for (var i = listeners.length - 1; i >= 0; --i) {
            if (listener && listeners[i].listener === listener && listeners[i].thisObject === thisObject)
                listeners.splice(i, 1);
            else if (!listener && thisObject && listeners[i].thisObject === thisObject)
                listeners.splice(i, 1);
        }

        if (!listeners.length)
            delete this._listeners[eventType];

        if (!Object.keys(this._listeners).length)
            delete this._listeners;
    },

    dispatchEvent: function(event)
    {
        event.target = this;

        if (!this._listeners || !this._listeners[event.type] || event._stoppedPropagation)
            return;

        // Make a copy with slice so mutations during the loop doesn't affect us.
        var listenersForThisEvent = this._listeners[event.type].slice(0);

        // Iterate over the listeners and call them. Stop if stopPropagation is called.
        for (var i = 0; i < listenersForThisEvent.length; ++i) {
            var thisObject = listenersForThisEvent[i].thisObject;
            var listener = listenersForThisEvent[i].listener;
            if (!thisObject && typeof listener !== "function" && typeof listener.handleEvent === "function")
                listener.handleEvent.call(listener, event);
            else
                listener.call(thisObject, event);
            if (event._stoppedPropagation)
                break;
        }

        return event.defaultPrevented;
    }
}

function Event(type)
{
    this.type = type;
    this.target = null;
    this.defaultPrevented = false;
    this._stoppedPropagation = false;
}

Event.prototype = {
    constructor: Event,

    stopPropagation: function()
    {
        this._stoppedPropagation = true;
    },

    preventDefault: function()
    {
        this.defaultPrevented = true;
    }
}

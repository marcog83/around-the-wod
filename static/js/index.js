'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _CustomElement() {
  return Reflect.construct(HTMLElement, [], this.__proto__.constructor);
}

;
Object.setPrototypeOf(_CustomElement.prototype, HTMLElement.prototype);
Object.setPrototypeOf(_CustomElement, HTMLElement);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var amdLoader = function amdLoader(id, resolve, reject) {
    require([id], resolve, reject);
  };

  var Loader = function Loader() {
    var loaderFunction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : amdLoader;

    return Object.freeze({
      load: function load(id) {
        return new Promise(function (resolve, reject) {
          return loaderFunction(id, resolve, reject);
        });
      }
    });
  };

  function EventDispatcher() {
    this._listeners = {};
  }
  EventDispatcher.prototype = {
    addEventListener: function addEventListener(type, listener, useCapture) {
      var listeners;
      if (useCapture) {
        listeners = this._captureListeners = this._captureListeners || {};
      } else {
        listeners = this._listeners = this._listeners || {};
      }
      var arr = listeners[type];
      if (arr) {
        this.removeEventListener(type, listener, useCapture);
      }
      arr = listeners[type]; // remove may have deleted the array
      if (!arr) {
        listeners[type] = [listener];
      } else {
        arr.push(listener);
      }
      return listener;
    },
    removeEventListener: function removeEventListener(type, listener, useCapture) {
      var listeners = useCapture ? this._captureListeners : this._listeners;
      if (!listeners) {
        return;
      }
      var arr = listeners[type];
      if (!arr) {
        return;
      }
      for (var i = 0, l = arr.length; i < l; i++) {
        if (arr[i] == listener) {
          if (l == 1) {
            delete listeners[type];
          } // allows for faster checks.
          else {
              arr.splice(i, 1);
            }
          break;
        }
      }
    },
    removeAllEventListeners: function removeAllEventListeners(type) {
      if (!type) {
        this._listeners = this._captureListeners = null;
      } else {
        if (this._listeners) {
          delete this._listeners[type];
        }
        if (this._captureListeners) {
          delete this._captureListeners[type];
        }
      }
    },
    dispatchEvent: function dispatchEvent(eventObj) {
      if (typeof eventObj == "string") {
        // won't bubble, so skip everything if there's no listeners:
        var listeners = this._listeners;
        if (!listeners || !listeners[eventObj]) {
          return false;
        }
        eventObj = new Event(eventObj);
      } else if (eventObj.target && eventObj.clone) {
        // redispatching an active event object, so clone it:
        eventObj = eventObj.clone();
      }
      try {
        eventObj.target = this;
      } catch (e) {} // try/catch allows redispatching of native events

      if (!eventObj.bubbles || !this.parent) {
        this._dispatchEvent(eventObj, 2);
      } else {
        var top = this,
            list = [top];
        while (top.parent) {
          list.push(top = top.parent);
        }
        var i,
            l = list.length;

        // capture & atTarget
        for (i = l - 1; i >= 0 && !eventObj.propagationStopped; i--) {
          list[i]._dispatchEvent(eventObj, 1 + (i == 0));
        }
        // bubbling
        for (i = 1; i < l && !eventObj.propagationStopped; i++) {
          list[i]._dispatchEvent(eventObj, 3);
        }
      }
      return eventObj.defaultPrevented;
    },
    hasEventListener: function hasEventListener(type) {
      var listeners = this._listeners,
          captureListeners = this._captureListeners;
      return !!(listeners && listeners[type] || captureListeners && captureListeners[type]);
    },
    _dispatchEvent: function _dispatchEvent(eventObj, eventPhase) {
      var l,
          listeners = eventPhase == 1 ? this._captureListeners : this._listeners;
      if (eventObj && listeners) {
        var arr = listeners[eventObj.type];
        if (!arr || !(l = arr.length)) {
          return;
        }
        try {
          eventObj.currentTarget = this;
        } catch (e) {}
        try {
          eventObj.eventPhase = eventPhase;
        } catch (e) {}
        eventObj.removed = false;
        arr = arr.slice(); // to avoid issues with items being removed or added during the dispatch
        for (var i = 0; i < l && !eventObj.immediatePropagationStopped; i++) {
          var o = arr[i];
          if (o.handleEvent) {
            o.handleEvent(eventObj);
          } else {
            o(eventObj);
          }
          if (eventObj.removed) {
            this.removeEventListener(eventObj.type, o, eventPhase == 1);
            eventObj.removed = false;
          }
        }
      }
    }
  };
  var makeDispatcher = function makeDispatcher() {
    return new EventDispatcher();
  };

  function Signal() {

    this.listenerBoxes = [];

    this._valueClasses = null;

    this.listenersNeedCloning = false;

    this.setValueClasses(arguments);
  }

  Signal.prototype = {
    getNumListeners: function getNumListeners() {
      return this.listenerBoxes.length;
    },
    getValueClasses: function getValueClasses() {
      return this._valueClasses;
    },
    /**
     <h3>connect</h3>
     <p>Connects the signal this to the incoming slot.</p>
     @param <code>Function</code> the slot function
     @param <code>Object</code> the scope of slot function execution
     */
    connect: function connect(slot, scope) {
      this.registerListener(slot, scope, false);
    },
    /**
     <h3>connectOnce</h3>
     <p></p>
     @param <code>Function</code> the slot function
     @param <code>Object</code> the scope of slot function execution
     */
    connectOnce: function connectOnce(slot, scope) {
      this.registerListener(slot, scope, true);
    },
    /**
     <h3>disconnect</h3>
     <p>the given slot are disconnected.</p>
     @param <code>Function</code> the slot function
     @param <code>Object</code> the scope of slot function execution
     */
    disconnect: function disconnect(slot, scope) {
      if (this.listenersNeedCloning) {
        this.listenerBoxes = this.listenerBoxes.slice();
        this.listenersNeedCloning = false;
      }

      for (var i = this.listenerBoxes.length; i--;) {
        if (this.listenerBoxes[i].listener == slot && this.listenerBoxes[i].scope == scope) {
          this.listenerBoxes.splice(i, 1);
          return;
        }
      }
    },
    /**
     <h3>disconnectAll</h3>
     <p>Disconnects all slots connected to the signal.</p>
      */
    disconnectAll: function disconnectAll() {

      for (var i = this.listenerBoxes.length; i--;) {
        this.disconnect(this.listenerBoxes[i].listener, this.listenerBoxes[i].scope);
      }
    },
    /**
     <h3>emit</h3>
     <p>Dispatches an event into the signal flow.</p>
      */
    emit: function emit() {
      var valueObject;
      for (var n = 0; n < this._valueClasses.length; n++) {
        if (this.primitiveMatchesValueClass(arguments[n], this._valueClasses[n])) continue;

        if ((valueObject = arguments[n]) == null || valueObject instanceof this._valueClasses[n]) continue;

        throw new Error('Value object <' + valueObject + '> is not an instance of <' + this._valueClasses[n] + '>.');
      }

      var listenerBoxes = this.listenerBoxes;
      var len = listenerBoxes.length;
      var listenerBox;

      this.listenersNeedCloning = true;
      for (var i = 0; i < len; i++) {
        listenerBox = listenerBoxes[i];
        if (listenerBox.once) this.disconnect(listenerBox.listener, listenerBox.scope);

        listenerBox.listener.apply(listenerBox.scope, arguments);
      }
      this.listenersNeedCloning = false;
    },
    primitiveMatchesValueClass: function primitiveMatchesValueClass(primitive, valueClass) {
      if (typeof primitive == "string" && valueClass == String || typeof primitive == "number" && valueClass == Number || typeof primitive == "boolean" && valueClass == Boolean) return true;

      return false;
    },
    setValueClasses: function setValueClasses(valueClasses) {
      this._valueClasses = valueClasses || [];

      for (var i = this._valueClasses.length; i--;) {
        if (!(this._valueClasses[i] instanceof Function)) throw new Error('Invalid valueClasses argument: item at index ' + i + ' should be a Class but was:<' + this._valueClasses[i] + '>.');
      }
    },
    registerListener: function registerListener(listener, scope, once) {
      for (var i = 0; i < this.listenerBoxes.length; i++) {
        if (this.listenerBoxes[i].listener == listener && this.listenerBoxes[i].scope == scope) {
          if (this.listenerBoxes[i].once && !once) {
            throw new Error('You cannot addOnce() then try to add() the same listener ' + 'without removing the relationship first.');
          } else if (once && !this.listenerBoxes[i].once) {
            throw new Error('You cannot add() then addOnce() the same listener ' + 'without removing the relationship first.');
          }
          return;
        }
      }
      if (this.listenersNeedCloning) {
        this.listenerBoxes = this.listenerBoxes.slice();
      }

      this.listenerBoxes.push({ listener: listener, scope: scope, once: once });
    }
  };

  /**
   * Created by mgobbi on 20/04/2017.
   */
  function _arity(n, fn) {
    /* eslint-disable no-unused-vars */
    switch (n) {
      case 0:
        return function () {
          return fn.apply(this, arguments);
        };
      case 1:
        return function (a0) {
          return fn.apply(this, arguments);
        };
      case 2:
        return function (a0, a1) {
          return fn.apply(this, arguments);
        };
      case 3:
        return function (a0, a1, a2) {
          return fn.apply(this, arguments);
        };
      case 4:
        return function (a0, a1, a2, a3) {
          return fn.apply(this, arguments);
        };
      case 5:
        return function (a0, a1, a2, a3, a4) {
          return fn.apply(this, arguments);
        };
      case 6:
        return function (a0, a1, a2, a3, a4, a5) {
          return fn.apply(this, arguments);
        };
      case 7:
        return function (a0, a1, a2, a3, a4, a5, a6) {
          return fn.apply(this, arguments);
        };
      case 8:
        return function (a0, a1, a2, a3, a4, a5, a6, a7) {
          return fn.apply(this, arguments);
        };
      case 9:
        return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
          return fn.apply(this, arguments);
        };
      case 10:
        return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return fn.apply(this, arguments);
        };
      default:
        throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
    }
  }

  /**
   * Created by mgobbi on 20/04/2017.
   */
  function _curryN(length, received, fn) {
    return function () {
      var combined = [];
      var argsIdx = 0;
      var left = length;
      var combinedIdx = 0;
      while (combinedIdx < received.length || argsIdx < arguments.length) {
        var result;
        if (combinedIdx < received.length) {
          result = received[combinedIdx];
        } else {
          result = arguments[argsIdx];
          argsIdx += 1;
        }
        combined[combinedIdx] = result;
        {
          left -= 1;
        }
        combinedIdx += 1;
      }
      return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
    };
  }

  /**
   * Created by mgobbi on 20/04/2017.
   */
  function _curry1(fn) {
    return function f1(a) {
      if (arguments.length === 0) {
        return f1;
      } else {
        return fn.apply(this, arguments);
      }
    };
  }

  /**
   * Created by mgobbi on 14/03/2017.
   */
  function curry(fn) {
    var length = fn.length;
    if (length === 1) {
      return _curry1(fn);
    }
    return _arity(length, _curryN(length, [], fn));
  }

  /**
   * Created by mgobbi on 20/04/2017.
   */
  var map = curry(function (fn, list) {
    //  return Array.from(list).map(fn);
    var idx = 0;
    var length = list.length;
    var result = [];
    for (idx; idx < length; idx++) {
      result[idx] = fn(list[idx]);
    }

    return result;
  });

  /**
   * Created by mgobbi on 20/04/2017.
   */
  var pluck = curry(function (p, list) {
    return map(function (obj) {
      return obj[p];
    }, list);
  });

  /**
   * Created by marcogobbi on 20/04/2017.
   */
  var reduce = curry(function (xf, acc, list) {
    var idx = 0;
    var len = list.length;
    while (idx < len) {
      acc = xf(acc, list[idx]);

      idx += 1;
    }
    return acc;

    /* var result=head.apply(ctx, args);
     var idx = 0;
     var len = tail.length;
     while (idx < len){
          result=tail[i].call(ctx, result);
         i--;
     }
     return result;*/
  });

  /**
   * Created by mgobbi on 17/03/2017.
   */
  // Performs left-to-right composition of one or more  functions.
  function _pipe(f, g) {
    return function () {
      return g.call(this, f.apply(this, arguments));
    };
  }
  function compose() {
    for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
      fns[_key] = arguments[_key];
    }

    fns.reverse();
    var head = fns[0];
    var tail = fns.slice(1);

    return _arity(head.length, reduce(_pipe, head, tail));
  }

  function _isString(x) {
    return Object.prototype.toString.call(x) === '[object String]';
  }
  function _isArrayLike(x) {
    if (Array.isArray(x)) {
      return true;
    }
    if (!x) {
      return false;
    }
    if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object') {
      return false;
    }
    if (_isString(x)) {
      return false;
    }
    if (x.nodeType === 1) {
      return !!x.length;
    }
    if (x.length === 0) {
      return true;
    }
    if (x.length > 0) {
      return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
    }
    return false;
  }

  /**
   * Created by mgobbi on 12/04/2017.
   */
  //  function flatten(arr) {
  //     return arr.reduce(function (flat, toFlatten) {
  //         return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  //     }, []);
  // }
  function flatten(list) {
    var value, jlen, j;
    var result = [];
    var idx = 0;
    var ilen = list.length;

    while (idx < ilen) {
      if (_isArrayLike(list[idx])) {
        value = flatten(list[idx]);
        j = 0;
        jlen = value.length;
        while (j < jlen) {
          result[result.length] = value[j];
          j += 1;
        }
      } else {
        result[result.length] = list[idx];
      }
      idx += 1;
    }
    return result;
  }

  /**
   * Created by mgobbi on 20/04/2017.
   */
  var filter = curry(function (fn, list) {
    var idx = 0;
    var len = list.length;
    var result = [];

    while (idx < len) {
      if (fn(list[idx])) {
        result[result.length] = list[idx];
      }
      idx += 1;
    }
    return result;
    //  return Array.from(list).filter(fn);
  });

  /**
   * Created by marcogobbi on 01/04/2017.
   */
  function makeChain(prop, getAllElements, emit) {
    return compose(function (nodes) {
      if (nodes.length > 0) {
        return emit(nodes);
      } else {
        return [];
      }
    }, filter(function (nodes) {
      return nodes.length > 0;
    }), map(getAllElements), filter(function (node) {
      return node.querySelectorAll;
    }), flatten, pluck(prop) //"addedNodes","removedNodes"
    );
  }

  var DomWatcher = function DomWatcher(root, getAllElements) {
    var onAdded = new Signal();
    var onRemoved = new Signal();

    var getAdded = makeChain("addedNodes", getAllElements, onAdded.emit.bind(onAdded));
    var getRemoved = makeChain("removedNodes", getAllElements, onRemoved.emit.bind(onRemoved));

    var handleMutations = function handleMutations(mutations) {

      getRemoved(mutations);
      getAdded(mutations);
    };
    var observer = new MutationObserver(handleMutations);
    /* <h3>Configuration of the observer.</h3>
     <p>Registers the MutationObserver instance to receive notifications of DOM mutations on the specified node.</p>
     */
    observer.observe(root, {
      attributes: false, //true
      childList: true,
      characterData: false,
      subtree: true
    });
    function dispose() {
      observer.disconnect();
      onAdded.disconnectAll();
      onRemoved.disconnectAll();
      observer = null;
      onAdded = null;
      onRemoved = null;
      getAdded = null;
      getRemoved = null;
    }

    return Object.freeze({ onAdded: onAdded, onRemoved: onRemoved, dispose: dispose });
  };

  /**
   * Created by mgobbi on 31/03/2017.
   */
  var REG_EXP = /[xy]/g;
  var STRING = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  var nextUid = function nextUid() {
    return STRING.replace(REG_EXP, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  };

  /**
   * Created by mgobbi on 31/03/2017.
   */
  var noop = function noop(_) {
    return _;
  };

  var create = curry(function (node, dispatcher, Mediator) {
    var mediatorId = nextUid();
    node.setAttribute('mediatorid', mediatorId);
    var dispose = Mediator(node, dispatcher) || noop;
    return {
      mediatorId: mediatorId,
      node: node,
      dispose: dispose
    };
  });

  /**
   * Created by mgobbi on 20/04/2017.
   */
  var find = curry(function (fn, list) {
    var idx = 0;
    var len = list.length;
    while (idx < len) {
      if (fn(list[idx])) {
        return list[idx];
      }
      idx += 1;
    }
  });

  /**
   * Created by mgobbi on 31/03/2017.
   */
  var inCache = function inCache(MEDIATORS_CACHE, node) {
    return !!find(function (disposable) {
      return disposable.node === node;
    }, MEDIATORS_CACHE);
  };

  /**
   * Created by marcogobbi on 01/04/2017.
   */
  //import map from "../../internal/_map"
  //function identity(x){return x;}
  function getAllElements(node) {
    //  var hrstart = process.hrtime();


    //  var nodes=map(identity,node.querySelectorAll("[data-mediator]"));
    var nodes = [].slice.call(node.querySelectorAll("[data-mediator]"), 0);
    if (!!node.getAttribute("data-mediator")) {
      nodes.unshift(node);
    }
    // var hrend = process.hrtime(hrstart);
    //  console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1]/1000000);
    return nodes;
  }

  /**
   * Created by marcogobbi on 02/04/2017.
   */
  var FindMediator = function FindMediator(getDefinition, create, updateCache) {
    return curry(function (dispatcher, load, node) {
      return load(getDefinition(node)).then(create(node, dispatcher)).then(updateCache);
    });
  };

  /**
   * Created by marco.gobbi on 21/01/2015.
   */

  var GetDefinition = curry(function (definitions, node) {
    return definitions[node.getAttribute("data-mediator")];
  });

  function MediatorHandler(params) {
    //crea un'istanza dell'EventDispatcher se non viene passata
    var _params$definitions = params.definitions,
        definitions = _params$definitions === undefined ? {} : _params$definitions,
        _params$dispatcher = params.dispatcher,
        dispatcher = _params$dispatcher === undefined ? makeDispatcher() : _params$dispatcher;
    //inizializza la cache dei mediatori registrati

    var MEDIATORS_CACHE = [];
    var getDefinition = GetDefinition(definitions);

    function destroy(node) {
      for (var i = 0; i < MEDIATORS_CACHE.length; i++) {
        var disposable = MEDIATORS_CACHE[i];
        if (disposable && disposable.node === node) {
          disposable.dispose();
          disposable.node = null;
          MEDIATORS_CACHE[i] = null;
          MEDIATORS_CACHE.splice(i, 1);
        }
      }

      return MEDIATORS_CACHE;
    }

    function dispose() {
      MEDIATORS_CACHE.forEach(function (disposable) {
        if (disposable) {
          disposable.dispose();
          disposable.node = null;
        }
      });
      MEDIATORS_CACHE = null;
      dispatcher.removeAllEventListeners();
      dispatcher = null;
      _findMediator = null;
      definitions = null;
      getDefinition = null;
    }

    function updateCache(disposable) {
      MEDIATORS_CACHE.push(disposable); //[mediatorId] = disposeFunction;
      return MEDIATORS_CACHE;
    }

    var _findMediator = FindMediator(getDefinition, create, updateCache);

    function hasMediator(node) {
      return !!getDefinition(node) && !inCache(MEDIATORS_CACHE, node);
    }

    return Object.freeze({
      dispose: dispose,
      destroy: destroy,
      findMediator: _findMediator(dispatcher),
      hasMediator: hasMediator,
      getAllElements: getAllElements

    });
  }

  /**
   * Created by marcogobbi on 01/04/2017.
   */
  function GetMediators(findMediator, hasMediator) {
    return compose(function (promises) {
      return Promise.all(promises);
    }, map(findMediator), filter(hasMediator), flatten);
  }

  /**
   * Created by mgobbi on 20/04/2017.
   */
  var forEach = curry(function (fn, list) {
    var len = list.length;
    var idx = 0;
    while (idx < len) {
      fn(list[idx]);
      idx += 1;
    }
    return list;
  });

  /**
   * Created by marcogobbi on 01/04/2017.
   */
  function HandleNodesRemoved(destroy) {
    return compose(forEach(destroy), flatten);
  }

  /**
   * Created by marcogobbi on 01/04/2017.
   */
  function Build(getMediators, getAllElements) {
    return compose(getMediators, map(getAllElements), function (root) {
      return [root];
    });
  }

  /**
   * Created by marco.gobbi on 21/01/2015.
   */

  var bootstrap = function bootstrap(options) {
    var definitions = options.definitions,
        _options$loader = options.loader,
        loader = _options$loader === undefined ? Loader() : _options$loader,
        _options$root = options.root,
        root = _options$root === undefined ? document.body : _options$root;


    var handler = options.handler || MediatorHandler({ definitions: definitions });
    var domWatcher = options.domWatcher || DomWatcher(root, handler.getAllElements);
    //


    var getMediators = GetMediators(handler.findMediator(loader.load), handler.hasMediator);

    domWatcher.onAdded.connect(getMediators);
    domWatcher.onRemoved.connect(HandleNodesRemoved(handler.destroy));

    var promise = Build(getMediators, handler.getAllElements)(root);

    return {
      promise: promise,
      dispose: function dispose() {
        domWatcher.dispose();
        handler.dispose();
        domWatcher = null;
        handler = null;
        getMediators = null;
        definitions = null;
        loader = null;
        root = null;
        promise = null;
      }
    };
  };

  /**
   * Created by marcogobbi on 07/05/2017.
   */
  var KE = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1 ", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
  var query = KE.map(function (e) {
    return ":not(" + e + ")";
  }).reduce(function (prev, curr) {
    return prev + curr;
  }, "*");

  function getAllElements$1(node) {
    return [node].concat([].slice.call(node.querySelectorAll(query), 0));
  }

  /**
   * Created by marcogobbi on 07/05/2017.
   */

  function getCreate(inCache, updateCache) {

    return function create(node, dispatcher) {
      return function (Mediator) {
        var tagName = "";
        if (!inCache(node.tagName.toLowerCase())) {
          tagName = node.tagName.toLowerCase();
          if (!tagName.match(/-/gim)) {
            throw new Error("The name of a custom element must contain a dash (-). So <x-tags>, <my-element>, and <my-awesome-app> are all valid names, while <tabs> and <foo_bar> are not.");
          }
          window.customElements.define(tagName, function (_Mediator) {
            _inherits(_class, _Mediator);

            function _class() {
              _classCallCheck(this, _class);

              return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, dispatcher));
            }

            return _class;
          }(Mediator));
          //  var proto = Object.assign(Object.create(HTMLElement.prototype), customProto);
          //   document.registerElement(tagName, {prototype: proto});
          updateCache(tagName);
        }
        return tagName;
      };
    };
  }

  /**
   * Created by marcogobbi on 07/05/2017.
   */
  var GetDefinition$1 = curry(function (definitions, node) {
    return definitions[node.tagName.toLowerCase()];
  });
  var noop$1 = function noop$1(_) {
    return _;
  };
  var CustomElementHandler = function CustomElementHandler(params) {
    //crea un'istanza dell'EventDispatcher se non viene passata
    var _params$definitions2 = params.definitions,
        definitions = _params$definitions2 === undefined ? {} : _params$definitions2,
        _params$dispatcher2 = params.dispatcher,
        dispatcher = _params$dispatcher2 === undefined ? makeDispatcher() : _params$dispatcher2;


    var REGISTERED_ELEMENTS = {};

    function updateCache(id) {
      REGISTERED_ELEMENTS[id] = true;
      return REGISTERED_ELEMENTS;
    }

    var inCache = curry(function (elements, id) {
      return !!elements[id];
    });

    var getDefinition = GetDefinition$1(definitions);
    var _findMediator = FindMediator(getDefinition, getCreate(inCache(REGISTERED_ELEMENTS), updateCache), noop$1);

    function hasMediator(node) {
      var id = node.tagName.toLowerCase();
      return !!getDefinition(node) && !inCache(REGISTERED_ELEMENTS, id);
    }

    return Object.freeze({
      dispose: noop$1,
      destroy: noop$1,
      findMediator: _findMediator(dispatcher),
      hasMediator: hasMediator,
      getAllElements: getAllElements$1

    });
  };

  var Menu = function (_CustomElement2) {
    _inherits(Menu, _CustomElement2);

    function Menu(dispatcher) {
      _classCallCheck(this, Menu);

      var _this2 = _possibleConstructorReturn(this, (Menu.__proto__ || Object.getPrototypeOf(Menu)).call(this));

      _this2.dispatcher = dispatcher;

      return _this2;
    }

    // A getter/setter for an open property.


    _createClass(Menu, [{
      key: 'attributeChangedCallback',


      // Only called for the disabled and open attributes due to observedAttributes
      value: function attributeChangedCallback(name, oldValue, newValue) {

        // TODO: also react to the open attribute changing.
      }
    }, {
      key: 'connectedCallback',
      value: function connectedCallback() {
        var _this3 = this;

        console.log("attached foo element", this);
        this.querySelector("#nav-trigger__button").addEventListener("click", function () {
          _this3.open = !_this3.open;
        });
      }
    }, {
      key: 'disconnectedCallback',
      value: function disconnectedCallback() {
        console.log("deattached foo element", this);
      }
    }, {
      key: 'open',
      get: function get() {
        return this.hasAttribute('open');
      },
      set: function set(val) {
        // Reflect the value of the open property as an HTML attribute.
        if (val) {
          this.setAttribute('open', '');
        } else {
          this.removeAttribute('open');
        }
      }
    }], [{
      key: 'observedAttributes',
      get: function get() {
        return ['open'];
      }
    }]);

    return Menu;
  }(_CustomElement);

  /*!
   * perfect-scrollbar v1.3.0
   * (c) 2017 Hyunje Jun
   * @license MIT
   */


  function get(element) {
    return getComputedStyle(element);
  }

  function set(element, obj) {
    for (var key in obj) {
      var val = obj[key];
      if (typeof val === 'number') {
        val = val + "px";
      }
      element.style[key] = val;
    }
    return element;
  }

  function div(className) {
    var div = document.createElement('div');
    div.className = className;
    return div;
  }

  var elMatches = typeof Element !== 'undefined' && (Element.prototype.matches || Element.prototype.webkitMatchesSelector || Element.prototype.msMatchesSelector);

  function matches(element, query) {
    if (!elMatches) {
      throw new Error('No element matching method supported');
    }

    return elMatches.call(element, query);
  }

  function remove(element) {
    if (element.remove) {
      element.remove();
    } else {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  }

  function queryChildren(element, selector) {
    return Array.prototype.filter.call(element.children, function (child) {
      return matches(child, selector);
    });
  }

  var cls = {
    main: 'ps',
    element: {
      thumb: function thumb(x) {
        return "ps__thumb-" + x;
      },
      rail: function rail(x) {
        return "ps__rail-" + x;
      },
      consuming: 'ps__child--consume'
    },
    state: {
      focus: 'ps--focus',
      active: function active(x) {
        return "ps--active-" + x;
      },
      scrolling: function scrolling(x) {
        return "ps--scrolling-" + x;
      }
    }
  };

  /*
   * Helper methods
   */
  var scrollingClassTimeout = { x: null, y: null };

  function addScrollingClass(i, x) {
    var classList = i.element.classList;
    var className = cls.state.scrolling(x);

    if (classList.contains(className)) {
      clearTimeout(scrollingClassTimeout[x]);
    } else {
      classList.add(className);
    }
  }

  function removeScrollingClass(i, x) {
    scrollingClassTimeout[x] = setTimeout(function () {
      return i.isAlive && i.element.classList.remove(cls.state.scrolling(x));
    }, i.settings.scrollingThreshold);
  }

  function setScrollingClassInstantly(i, x) {
    addScrollingClass(i, x);
    removeScrollingClass(i, x);
  }

  var EventElement = function EventElement(element) {
    this.element = element;
    this.handlers = {};
  };

  var prototypeAccessors = { isEmpty: { configurable: true } };

  EventElement.prototype.bind = function bind(eventName, handler) {
    if (typeof this.handlers[eventName] === 'undefined') {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler);
    this.element.addEventListener(eventName, handler, false);
  };

  EventElement.prototype.unbind = function unbind(eventName, target) {
    var this$1 = this;

    this.handlers[eventName] = this.handlers[eventName].filter(function (handler) {
      if (target && handler !== target) {
        return true;
      }
      this$1.element.removeEventListener(eventName, handler, false);
      return false;
    });
  };

  EventElement.prototype.unbindAll = function unbindAll() {
    var this$1 = this;

    for (var name in this$1.handlers) {
      this$1.unbind(name);
    }
  };

  prototypeAccessors.isEmpty.get = function () {
    var this$1 = this;

    return Object.keys(this.handlers).every(function (key) {
      return this$1.handlers[key].length === 0;
    });
  };

  Object.defineProperties(EventElement.prototype, prototypeAccessors);

  var EventManager = function EventManager() {
    this.eventElements = [];
  };

  EventManager.prototype.eventElement = function eventElement(element) {
    var ee = this.eventElements.filter(function (ee) {
      return ee.element === element;
    })[0];
    if (!ee) {
      ee = new EventElement(element);
      this.eventElements.push(ee);
    }
    return ee;
  };

  EventManager.prototype.bind = function bind(element, eventName, handler) {
    this.eventElement(element).bind(eventName, handler);
  };

  EventManager.prototype.unbind = function unbind(element, eventName, handler) {
    var ee = this.eventElement(element);
    ee.unbind(eventName, handler);

    if (ee.isEmpty) {
      // remove
      this.eventElements.splice(this.eventElements.indexOf(ee), 1);
    }
  };

  EventManager.prototype.unbindAll = function unbindAll() {
    this.eventElements.forEach(function (e) {
      return e.unbindAll();
    });
    this.eventElements = [];
  };

  EventManager.prototype.once = function once(element, eventName, handler) {
    var ee = this.eventElement(element);
    var onceHandler = function onceHandler(evt) {
      ee.unbind(eventName, onceHandler);
      handler(evt);
    };
    ee.bind(eventName, onceHandler);
  };

  function createEvent(name) {
    if (typeof window.CustomEvent === 'function') {
      return new CustomEvent(name);
    } else {
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(name, false, false, undefined);
      return evt;
    }
  }

  var processScrollDiff = function processScrollDiff(i, axis, diff, useScrollingClass, forceFireReachEvent) {
    if (useScrollingClass === void 0) useScrollingClass = true;
    if (forceFireReachEvent === void 0) forceFireReachEvent = false;

    var fields;
    if (axis === 'top') {
      fields = ['contentHeight', 'containerHeight', 'scrollTop', 'y', 'up', 'down'];
    } else if (axis === 'left') {
      fields = ['contentWidth', 'containerWidth', 'scrollLeft', 'x', 'left', 'right'];
    } else {
      throw new Error('A proper axis should be provided');
    }

    processScrollDiff$1(i, diff, fields, useScrollingClass, forceFireReachEvent);
  };

  function processScrollDiff$1(i, diff, ref, useScrollingClass, forceFireReachEvent) {
    var contentHeight = ref[0];
    var containerHeight = ref[1];
    var scrollTop = ref[2];
    var y = ref[3];
    var up = ref[4];
    var down = ref[5];
    if (useScrollingClass === void 0) useScrollingClass = true;
    if (forceFireReachEvent === void 0) forceFireReachEvent = false;

    var element = i.element;

    // reset reach
    i.reach[y] = null;

    // 1 for subpixel rounding
    if (element[scrollTop] < 1) {
      i.reach[y] = 'start';
    }

    // 1 for subpixel rounding
    if (element[scrollTop] > i[contentHeight] - i[containerHeight] - 1) {
      i.reach[y] = 'end';
    }

    if (diff) {
      element.dispatchEvent(createEvent("ps-scroll-" + y));

      if (diff < 0) {
        element.dispatchEvent(createEvent("ps-scroll-" + up));
      } else if (diff > 0) {
        element.dispatchEvent(createEvent("ps-scroll-" + down));
      }

      if (useScrollingClass) {
        setScrollingClassInstantly(i, y);
      }
    }

    if (i.reach[y] && (diff || forceFireReachEvent)) {
      element.dispatchEvent(createEvent("ps-" + y + "-reach-" + i.reach[y]));
    }
  }

  function toInt(x) {
    return parseInt(x, 10) || 0;
  }

  function isEditable(el) {
    return matches(el, 'input,[contenteditable]') || matches(el, 'select,[contenteditable]') || matches(el, 'textarea,[contenteditable]') || matches(el, 'button,[contenteditable]');
  }

  function outerWidth(element) {
    var styles = get(element);
    return toInt(styles.width) + toInt(styles.paddingLeft) + toInt(styles.paddingRight) + toInt(styles.borderLeftWidth) + toInt(styles.borderRightWidth);
  }

  var env = {
    isWebKit: typeof document !== 'undefined' && 'WebkitAppearance' in document.documentElement.style,
    supportsTouch: typeof window !== 'undefined' && ('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch),
    supportsIePointer: typeof navigator !== 'undefined' && navigator.msMaxTouchPoints,
    isChrome: typeof navigator !== 'undefined' && /Chrome/i.test(navigator && navigator.userAgent)
  };

  var updateGeometry = function updateGeometry(i) {
    var element = i.element;

    i.containerWidth = element.clientWidth;
    i.containerHeight = element.clientHeight;
    i.contentWidth = element.scrollWidth;
    i.contentHeight = element.scrollHeight;

    if (!element.contains(i.scrollbarXRail)) {
      // clean up and append
      queryChildren(element, cls.element.rail('x')).forEach(function (el) {
        return remove(el);
      });
      element.appendChild(i.scrollbarXRail);
    }
    if (!element.contains(i.scrollbarYRail)) {
      // clean up and append
      queryChildren(element, cls.element.rail('y')).forEach(function (el) {
        return remove(el);
      });
      element.appendChild(i.scrollbarYRail);
    }

    if (!i.settings.suppressScrollX && i.containerWidth + i.settings.scrollXMarginOffset < i.contentWidth) {
      i.scrollbarXActive = true;
      i.railXWidth = i.containerWidth - i.railXMarginWidth;
      i.railXRatio = i.containerWidth / i.railXWidth;
      i.scrollbarXWidth = getThumbSize(i, toInt(i.railXWidth * i.containerWidth / i.contentWidth));
      i.scrollbarXLeft = toInt((i.negativeScrollAdjustment + element.scrollLeft) * (i.railXWidth - i.scrollbarXWidth) / (i.contentWidth - i.containerWidth));
    } else {
      i.scrollbarXActive = false;
    }

    if (!i.settings.suppressScrollY && i.containerHeight + i.settings.scrollYMarginOffset < i.contentHeight) {
      i.scrollbarYActive = true;
      i.railYHeight = i.containerHeight - i.railYMarginHeight;
      i.railYRatio = i.containerHeight / i.railYHeight;
      i.scrollbarYHeight = getThumbSize(i, toInt(i.railYHeight * i.containerHeight / i.contentHeight));
      i.scrollbarYTop = toInt(element.scrollTop * (i.railYHeight - i.scrollbarYHeight) / (i.contentHeight - i.containerHeight));
    } else {
      i.scrollbarYActive = false;
    }

    if (i.scrollbarXLeft >= i.railXWidth - i.scrollbarXWidth) {
      i.scrollbarXLeft = i.railXWidth - i.scrollbarXWidth;
    }
    if (i.scrollbarYTop >= i.railYHeight - i.scrollbarYHeight) {
      i.scrollbarYTop = i.railYHeight - i.scrollbarYHeight;
    }

    updateCss(element, i);

    if (i.scrollbarXActive) {
      element.classList.add(cls.state.active('x'));
    } else {
      element.classList.remove(cls.state.active('x'));
      i.scrollbarXWidth = 0;
      i.scrollbarXLeft = 0;
      element.scrollLeft = 0;
    }
    if (i.scrollbarYActive) {
      element.classList.add(cls.state.active('y'));
    } else {
      element.classList.remove(cls.state.active('y'));
      i.scrollbarYHeight = 0;
      i.scrollbarYTop = 0;
      element.scrollTop = 0;
    }
  };

  function getThumbSize(i, thumbSize) {
    if (i.settings.minScrollbarLength) {
      thumbSize = Math.max(thumbSize, i.settings.minScrollbarLength);
    }
    if (i.settings.maxScrollbarLength) {
      thumbSize = Math.min(thumbSize, i.settings.maxScrollbarLength);
    }
    return thumbSize;
  }

  function updateCss(element, i) {
    var xRailOffset = { width: i.railXWidth };
    if (i.isRtl) {
      xRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth - i.contentWidth;
    } else {
      xRailOffset.left = element.scrollLeft;
    }
    if (i.isScrollbarXUsingBottom) {
      xRailOffset.bottom = i.scrollbarXBottom - element.scrollTop;
    } else {
      xRailOffset.top = i.scrollbarXTop + element.scrollTop;
    }
    set(i.scrollbarXRail, xRailOffset);

    var yRailOffset = { top: element.scrollTop, height: i.railYHeight };
    if (i.isScrollbarYUsingRight) {
      if (i.isRtl) {
        yRailOffset.right = i.contentWidth - (i.negativeScrollAdjustment + element.scrollLeft) - i.scrollbarYRight - i.scrollbarYOuterWidth;
      } else {
        yRailOffset.right = i.scrollbarYRight - element.scrollLeft;
      }
    } else {
      if (i.isRtl) {
        yRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth * 2 - i.contentWidth - i.scrollbarYLeft - i.scrollbarYOuterWidth;
      } else {
        yRailOffset.left = i.scrollbarYLeft + element.scrollLeft;
      }
    }
    set(i.scrollbarYRail, yRailOffset);

    set(i.scrollbarX, {
      left: i.scrollbarXLeft,
      width: i.scrollbarXWidth - i.railBorderXWidth
    });
    set(i.scrollbarY, {
      top: i.scrollbarYTop,
      height: i.scrollbarYHeight - i.railBorderYWidth
    });
  }

  var clickRail = function clickRail(i) {
    i.event.bind(i.scrollbarY, 'mousedown', function (e) {
      return e.stopPropagation();
    });
    i.event.bind(i.scrollbarYRail, 'mousedown', function (e) {
      var positionTop = e.pageY - window.pageYOffset - i.scrollbarYRail.getBoundingClientRect().top;
      var direction = positionTop > i.scrollbarYTop ? 1 : -1;

      i.element.scrollTop += direction * i.containerHeight;
      updateGeometry(i);

      e.stopPropagation();
    });

    i.event.bind(i.scrollbarX, 'mousedown', function (e) {
      return e.stopPropagation();
    });
    i.event.bind(i.scrollbarXRail, 'mousedown', function (e) {
      var positionLeft = e.pageX - window.pageXOffset - i.scrollbarXRail.getBoundingClientRect().left;
      var direction = positionLeft > i.scrollbarXLeft ? 1 : -1;

      i.element.scrollLeft += direction * i.containerWidth;
      updateGeometry(i);

      e.stopPropagation();
    });
  };

  var dragThumb = function dragThumb(i) {
    bindMouseScrollHandler(i, ['containerWidth', 'contentWidth', 'pageX', 'railXWidth', 'scrollbarX', 'scrollbarXWidth', 'scrollLeft', 'x']);
    bindMouseScrollHandler(i, ['containerHeight', 'contentHeight', 'pageY', 'railYHeight', 'scrollbarY', 'scrollbarYHeight', 'scrollTop', 'y']);
  };

  function bindMouseScrollHandler(i, ref) {
    var containerHeight = ref[0];
    var contentHeight = ref[1];
    var pageY = ref[2];
    var railYHeight = ref[3];
    var scrollbarY = ref[4];
    var scrollbarYHeight = ref[5];
    var scrollTop = ref[6];
    var y = ref[7];

    var element = i.element;

    var startingScrollTop = null;
    var startingMousePageY = null;
    var scrollBy = null;

    function mouseMoveHandler(e) {
      element[scrollTop] = startingScrollTop + scrollBy * (e[pageY] - startingMousePageY);
      addScrollingClass(i, y);
      updateGeometry(i);

      e.stopPropagation();
      e.preventDefault();
    }

    function mouseUpHandler() {
      removeScrollingClass(i, y);
      i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
    }

    i.event.bind(i[scrollbarY], 'mousedown', function (e) {
      startingScrollTop = element[scrollTop];
      startingMousePageY = e[pageY];
      scrollBy = (i[contentHeight] - i[containerHeight]) / (i[railYHeight] - i[scrollbarYHeight]);

      i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
      i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);

      e.stopPropagation();
      e.preventDefault();
    });
  }

  var keyboard = function keyboard(i) {
    var element = i.element;

    var elementHovered = function elementHovered() {
      return matches(element, ':hover');
    };
    var scrollbarFocused = function scrollbarFocused() {
      return matches(i.scrollbarX, ':focus') || matches(i.scrollbarY, ':focus');
    };

    function shouldPreventDefault(deltaX, deltaY) {
      var scrollTop = element.scrollTop;
      if (deltaX === 0) {
        if (!i.scrollbarYActive) {
          return false;
        }
        if (scrollTop === 0 && deltaY > 0 || scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0) {
          return !i.settings.wheelPropagation;
        }
      }

      var scrollLeft = element.scrollLeft;
      if (deltaY === 0) {
        if (!i.scrollbarXActive) {
          return false;
        }
        if (scrollLeft === 0 && deltaX < 0 || scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0) {
          return !i.settings.wheelPropagation;
        }
      }
      return true;
    }

    i.event.bind(i.ownerDocument, 'keydown', function (e) {
      if (e.isDefaultPrevented && e.isDefaultPrevented() || e.defaultPrevented) {
        return;
      }

      if (!elementHovered() && !scrollbarFocused()) {
        return;
      }

      var activeElement = document.activeElement ? document.activeElement : i.ownerDocument.activeElement;
      if (activeElement) {
        if (activeElement.tagName === 'IFRAME') {
          activeElement = activeElement.contentDocument.activeElement;
        } else {
          // go deeper if element is a webcomponent
          while (activeElement.shadowRoot) {
            activeElement = activeElement.shadowRoot.activeElement;
          }
        }
        if (isEditable(activeElement)) {
          return;
        }
      }

      var deltaX = 0;
      var deltaY = 0;

      switch (e.which) {
        case 37:
          // left
          if (e.metaKey) {
            deltaX = -i.contentWidth;
          } else if (e.altKey) {
            deltaX = -i.containerWidth;
          } else {
            deltaX = -30;
          }
          break;
        case 38:
          // up
          if (e.metaKey) {
            deltaY = i.contentHeight;
          } else if (e.altKey) {
            deltaY = i.containerHeight;
          } else {
            deltaY = 30;
          }
          break;
        case 39:
          // right
          if (e.metaKey) {
            deltaX = i.contentWidth;
          } else if (e.altKey) {
            deltaX = i.containerWidth;
          } else {
            deltaX = 30;
          }
          break;
        case 40:
          // down
          if (e.metaKey) {
            deltaY = -i.contentHeight;
          } else if (e.altKey) {
            deltaY = -i.containerHeight;
          } else {
            deltaY = -30;
          }
          break;
        case 32:
          // space bar
          if (e.shiftKey) {
            deltaY = i.containerHeight;
          } else {
            deltaY = -i.containerHeight;
          }
          break;
        case 33:
          // page up
          deltaY = i.containerHeight;
          break;
        case 34:
          // page down
          deltaY = -i.containerHeight;
          break;
        case 36:
          // home
          deltaY = i.contentHeight;
          break;
        case 35:
          // end
          deltaY = -i.contentHeight;
          break;
        default:
          return;
      }

      if (i.settings.suppressScrollX && deltaX !== 0) {
        return;
      }
      if (i.settings.suppressScrollY && deltaY !== 0) {
        return;
      }

      element.scrollTop -= deltaY;
      element.scrollLeft += deltaX;
      updateGeometry(i);

      if (shouldPreventDefault(deltaX, deltaY)) {
        e.preventDefault();
      }
    });
  };

  var wheel = function wheel(i) {
    var element = i.element;

    function shouldPreventDefault(deltaX, deltaY) {
      var isTop = element.scrollTop === 0;
      var isBottom = element.scrollTop + element.offsetHeight === element.scrollHeight;
      var isLeft = element.scrollLeft === 0;
      var isRight = element.scrollLeft + element.offsetWidth === element.offsetWidth;

      var hitsBound;

      // pick axis with primary direction
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        hitsBound = isTop || isBottom;
      } else {
        hitsBound = isLeft || isRight;
      }

      return hitsBound ? !i.settings.wheelPropagation : true;
    }

    function getDeltaFromEvent(e) {
      var deltaX = e.deltaX;
      var deltaY = -1 * e.deltaY;

      if (typeof deltaX === 'undefined' || typeof deltaY === 'undefined') {
        // OS X Safari
        deltaX = -1 * e.wheelDeltaX / 6;
        deltaY = e.wheelDeltaY / 6;
      }

      if (e.deltaMode && e.deltaMode === 1) {
        // Firefox in deltaMode 1: Line scrolling
        deltaX *= 10;
        deltaY *= 10;
      }

      if (deltaX !== deltaX && deltaY !== deltaY /* NaN checks */) {
          // IE in some mouse drivers
          deltaX = 0;
          deltaY = e.wheelDelta;
        }

      if (e.shiftKey) {
        // reverse axis with shift key
        return [-deltaY, -deltaX];
      }
      return [deltaX, deltaY];
    }

    function shouldBeConsumedByChild(target, deltaX, deltaY) {
      // FIXME: this is a workaround for <select> issue in FF and IE #571
      if (!env.isWebKit && element.querySelector('select:focus')) {
        return true;
      }

      if (!element.contains(target)) {
        return false;
      }

      var cursor = target;

      while (cursor && cursor !== element) {
        if (cursor.classList.contains(cls.element.consuming)) {
          return true;
        }

        var style = get(cursor);
        var overflow = [style.overflow, style.overflowX, style.overflowY].join('');

        // if scrollable
        if (overflow.match(/(scroll|auto)/)) {
          var maxScrollTop = cursor.scrollHeight - cursor.clientHeight;
          if (maxScrollTop > 0) {
            if (!(cursor.scrollTop === 0 && deltaY > 0) && !(cursor.scrollTop === maxScrollTop && deltaY < 0)) {
              return true;
            }
          }
          var maxScrollLeft = cursor.scrollLeft - cursor.clientWidth;
          if (maxScrollLeft > 0) {
            if (!(cursor.scrollLeft === 0 && deltaX < 0) && !(cursor.scrollLeft === maxScrollLeft && deltaX > 0)) {
              return true;
            }
          }
        }

        cursor = cursor.parentNode;
      }

      return false;
    }

    function mousewheelHandler(e) {
      var ref = getDeltaFromEvent(e);
      var deltaX = ref[0];
      var deltaY = ref[1];

      if (shouldBeConsumedByChild(e.target, deltaX, deltaY)) {
        return;
      }

      var shouldPrevent = false;
      if (!i.settings.useBothWheelAxes) {
        // deltaX will only be used for horizontal scrolling and deltaY will
        // only be used for vertical scrolling - this is the default
        element.scrollTop -= deltaY * i.settings.wheelSpeed;
        element.scrollLeft += deltaX * i.settings.wheelSpeed;
      } else if (i.scrollbarYActive && !i.scrollbarXActive) {
        // only vertical scrollbar is active and useBothWheelAxes option is
        // active, so let's scroll vertical bar using both mouse wheel axes
        if (deltaY) {
          element.scrollTop -= deltaY * i.settings.wheelSpeed;
        } else {
          element.scrollTop += deltaX * i.settings.wheelSpeed;
        }
        shouldPrevent = true;
      } else if (i.scrollbarXActive && !i.scrollbarYActive) {
        // useBothWheelAxes and only horizontal bar is active, so use both
        // wheel axes for horizontal bar
        if (deltaX) {
          element.scrollLeft += deltaX * i.settings.wheelSpeed;
        } else {
          element.scrollLeft -= deltaY * i.settings.wheelSpeed;
        }
        shouldPrevent = true;
      }

      updateGeometry(i);

      shouldPrevent = shouldPrevent || shouldPreventDefault(deltaX, deltaY);
      if (shouldPrevent && !e.ctrlKey) {
        e.stopPropagation();
        e.preventDefault();
      }
    }

    if (typeof window.onwheel !== 'undefined') {
      i.event.bind(element, 'wheel', mousewheelHandler);
    } else if (typeof window.onmousewheel !== 'undefined') {
      i.event.bind(element, 'mousewheel', mousewheelHandler);
    }
  };

  var touch = function touch(i) {
    if (!env.supportsTouch && !env.supportsIePointer) {
      return;
    }

    var element = i.element;

    function shouldPrevent(deltaX, deltaY) {
      var scrollTop = element.scrollTop;
      var scrollLeft = element.scrollLeft;
      var magnitudeX = Math.abs(deltaX);
      var magnitudeY = Math.abs(deltaY);

      if (magnitudeY > magnitudeX) {
        // user is perhaps trying to swipe up/down the page

        if (deltaY < 0 && scrollTop === i.contentHeight - i.containerHeight || deltaY > 0 && scrollTop === 0) {
          // set prevent for mobile Chrome refresh
          return window.scrollY === 0 && deltaY > 0 && env.isChrome;
        }
      } else if (magnitudeX > magnitudeY) {
        // user is perhaps trying to swipe left/right across the page

        if (deltaX < 0 && scrollLeft === i.contentWidth - i.containerWidth || deltaX > 0 && scrollLeft === 0) {
          return true;
        }
      }

      return true;
    }

    function applyTouchMove(differenceX, differenceY) {
      element.scrollTop -= differenceY;
      element.scrollLeft -= differenceX;

      updateGeometry(i);
    }

    var startOffset = {};
    var startTime = 0;
    var speed = {};
    var easingLoop = null;

    function getTouch(e) {
      if (e.targetTouches) {
        return e.targetTouches[0];
      } else {
        // Maybe IE pointer
        return e;
      }
    }

    function shouldHandle(e) {
      if (e.pointerType && e.pointerType === 'pen' && e.buttons === 0) {
        return false;
      }
      if (e.targetTouches && e.targetTouches.length === 1) {
        return true;
      }
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
        return true;
      }
      return false;
    }

    function touchStart(e) {
      if (!shouldHandle(e)) {
        return;
      }

      var touch = getTouch(e);

      startOffset.pageX = touch.pageX;
      startOffset.pageY = touch.pageY;

      startTime = new Date().getTime();

      if (easingLoop !== null) {
        clearInterval(easingLoop);
      }
    }

    function shouldBeConsumedByChild(target, deltaX, deltaY) {
      if (!element.contains(target)) {
        return false;
      }

      var cursor = target;

      while (cursor && cursor !== element) {
        if (cursor.classList.contains(cls.element.consuming)) {
          return true;
        }

        var style = get(cursor);
        var overflow = [style.overflow, style.overflowX, style.overflowY].join('');

        // if scrollable
        if (overflow.match(/(scroll|auto)/)) {
          var maxScrollTop = cursor.scrollHeight - cursor.clientHeight;
          if (maxScrollTop > 0) {
            if (!(cursor.scrollTop === 0 && deltaY > 0) && !(cursor.scrollTop === maxScrollTop && deltaY < 0)) {
              return true;
            }
          }
          var maxScrollLeft = cursor.scrollLeft - cursor.clientWidth;
          if (maxScrollLeft > 0) {
            if (!(cursor.scrollLeft === 0 && deltaX < 0) && !(cursor.scrollLeft === maxScrollLeft && deltaX > 0)) {
              return true;
            }
          }
        }

        cursor = cursor.parentNode;
      }

      return false;
    }

    function touchMove(e) {
      if (shouldHandle(e)) {
        var touch = getTouch(e);

        var currentOffset = { pageX: touch.pageX, pageY: touch.pageY };

        var differenceX = currentOffset.pageX - startOffset.pageX;
        var differenceY = currentOffset.pageY - startOffset.pageY;

        if (shouldBeConsumedByChild(e.target, differenceX, differenceY)) {
          return;
        }

        applyTouchMove(differenceX, differenceY);
        startOffset = currentOffset;

        var currentTime = new Date().getTime();

        var timeGap = currentTime - startTime;
        if (timeGap > 0) {
          speed.x = differenceX / timeGap;
          speed.y = differenceY / timeGap;
          startTime = currentTime;
        }

        if (shouldPrevent(differenceX, differenceY)) {
          e.preventDefault();
        }
      }
    }
    function touchEnd() {
      if (i.settings.swipeEasing) {
        clearInterval(easingLoop);
        easingLoop = setInterval(function () {
          if (i.isInitialized) {
            clearInterval(easingLoop);
            return;
          }

          if (!speed.x && !speed.y) {
            clearInterval(easingLoop);
            return;
          }

          if (Math.abs(speed.x) < 0.01 && Math.abs(speed.y) < 0.01) {
            clearInterval(easingLoop);
            return;
          }

          applyTouchMove(speed.x * 30, speed.y * 30);

          speed.x *= 0.8;
          speed.y *= 0.8;
        }, 10);
      }
    }

    if (env.supportsTouch) {
      i.event.bind(element, 'touchstart', touchStart);
      i.event.bind(element, 'touchmove', touchMove);
      i.event.bind(element, 'touchend', touchEnd);
    } else if (env.supportsIePointer) {
      if (window.PointerEvent) {
        i.event.bind(element, 'pointerdown', touchStart);
        i.event.bind(element, 'pointermove', touchMove);
        i.event.bind(element, 'pointerup', touchEnd);
      } else if (window.MSPointerEvent) {
        i.event.bind(element, 'MSPointerDown', touchStart);
        i.event.bind(element, 'MSPointerMove', touchMove);
        i.event.bind(element, 'MSPointerUp', touchEnd);
      }
    }
  };

  var defaultSettings = function defaultSettings() {
    return {
      handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
      maxScrollbarLength: null,
      minScrollbarLength: null,
      scrollingThreshold: 1000,
      scrollXMarginOffset: 0,
      scrollYMarginOffset: 0,
      suppressScrollX: false,
      suppressScrollY: false,
      swipeEasing: true,
      useBothWheelAxes: false,
      wheelPropagation: false,
      wheelSpeed: 1
    };
  };

  var handlers = {
    'click-rail': clickRail,
    'drag-thumb': dragThumb,
    keyboard: keyboard,
    wheel: wheel,
    touch: touch
  };

  var PerfectScrollbar = function PerfectScrollbar(element, userSettings) {
    var this$1 = this;
    if (userSettings === void 0) userSettings = {};

    if (typeof element === 'string') {
      element = document.querySelector(element);
    }

    if (!element || !element.nodeName) {
      throw new Error('no element is specified to initialize PerfectScrollbar');
    }

    this.element = element;

    element.classList.add(cls.main);

    this.settings = defaultSettings();
    for (var key in userSettings) {
      this$1.settings[key] = userSettings[key];
    }

    this.containerWidth = null;
    this.containerHeight = null;
    this.contentWidth = null;
    this.contentHeight = null;

    var focus = function focus() {
      return element.classList.add(cls.state.focus);
    };
    var blur = function blur() {
      return element.classList.remove(cls.state.focus);
    };

    this.isRtl = get(element).direction === 'rtl';
    this.isNegativeScroll = function () {
      var originalScrollLeft = element.scrollLeft;
      var result = null;
      element.scrollLeft = -1;
      result = element.scrollLeft < 0;
      element.scrollLeft = originalScrollLeft;
      return result;
    }();
    this.negativeScrollAdjustment = this.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;
    this.event = new EventManager();
    this.ownerDocument = element.ownerDocument || document;

    this.scrollbarXRail = div(cls.element.rail('x'));
    element.appendChild(this.scrollbarXRail);
    this.scrollbarX = div(cls.element.thumb('x'));
    this.scrollbarXRail.appendChild(this.scrollbarX);
    this.scrollbarX.setAttribute('tabindex', 0);
    this.event.bind(this.scrollbarX, 'focus', focus);
    this.event.bind(this.scrollbarX, 'blur', blur);
    this.scrollbarXActive = null;
    this.scrollbarXWidth = null;
    this.scrollbarXLeft = null;
    var railXStyle = get(this.scrollbarXRail);
    this.scrollbarXBottom = parseInt(railXStyle.bottom, 10);
    if (isNaN(this.scrollbarXBottom)) {
      this.isScrollbarXUsingBottom = false;
      this.scrollbarXTop = toInt(railXStyle.top);
    } else {
      this.isScrollbarXUsingBottom = true;
    }
    this.railBorderXWidth = toInt(railXStyle.borderLeftWidth) + toInt(railXStyle.borderRightWidth);
    // Set rail to display:block to calculate margins
    set(this.scrollbarXRail, { display: 'block' });
    this.railXMarginWidth = toInt(railXStyle.marginLeft) + toInt(railXStyle.marginRight);
    set(this.scrollbarXRail, { display: '' });
    this.railXWidth = null;
    this.railXRatio = null;

    this.scrollbarYRail = div(cls.element.rail('y'));
    element.appendChild(this.scrollbarYRail);
    this.scrollbarY = div(cls.element.thumb('y'));
    this.scrollbarYRail.appendChild(this.scrollbarY);
    this.scrollbarY.setAttribute('tabindex', 0);
    this.event.bind(this.scrollbarY, 'focus', focus);
    this.event.bind(this.scrollbarY, 'blur', blur);
    this.scrollbarYActive = null;
    this.scrollbarYHeight = null;
    this.scrollbarYTop = null;
    var railYStyle = get(this.scrollbarYRail);
    this.scrollbarYRight = parseInt(railYStyle.right, 10);
    if (isNaN(this.scrollbarYRight)) {
      this.isScrollbarYUsingRight = false;
      this.scrollbarYLeft = toInt(railYStyle.left);
    } else {
      this.isScrollbarYUsingRight = true;
    }
    this.scrollbarYOuterWidth = this.isRtl ? outerWidth(this.scrollbarY) : null;
    this.railBorderYWidth = toInt(railYStyle.borderTopWidth) + toInt(railYStyle.borderBottomWidth);
    set(this.scrollbarYRail, { display: 'block' });
    this.railYMarginHeight = toInt(railYStyle.marginTop) + toInt(railYStyle.marginBottom);
    set(this.scrollbarYRail, { display: '' });
    this.railYHeight = null;
    this.railYRatio = null;

    this.reach = {
      x: element.scrollLeft <= 0 ? 'start' : element.scrollLeft >= this.contentWidth - this.containerWidth ? 'end' : null,
      y: element.scrollTop <= 0 ? 'start' : element.scrollTop >= this.contentHeight - this.containerHeight ? 'end' : null
    };

    this.isAlive = true;

    this.settings.handlers.forEach(function (handlerName) {
      return handlers[handlerName](this$1);
    });

    this.lastScrollTop = element.scrollTop; // for onScroll only
    this.lastScrollLeft = element.scrollLeft; // for onScroll only
    this.event.bind(this.element, 'scroll', function (e) {
      return this$1.onScroll(e);
    });
    updateGeometry(this);
  };

  PerfectScrollbar.prototype.update = function update() {
    if (!this.isAlive) {
      return;
    }

    // Recalcuate negative scrollLeft adjustment
    this.negativeScrollAdjustment = this.isNegativeScroll ? this.element.scrollWidth - this.element.clientWidth : 0;

    // Recalculate rail margins
    set(this.scrollbarXRail, { display: 'block' });
    set(this.scrollbarYRail, { display: 'block' });
    this.railXMarginWidth = toInt(get(this.scrollbarXRail).marginLeft) + toInt(get(this.scrollbarXRail).marginRight);
    this.railYMarginHeight = toInt(get(this.scrollbarYRail).marginTop) + toInt(get(this.scrollbarYRail).marginBottom);

    // Hide scrollbars not to affect scrollWidth and scrollHeight
    set(this.scrollbarXRail, { display: 'none' });
    set(this.scrollbarYRail, { display: 'none' });

    updateGeometry(this);

    processScrollDiff(this, 'top', 0, false, true);
    processScrollDiff(this, 'left', 0, false, true);

    set(this.scrollbarXRail, { display: '' });
    set(this.scrollbarYRail, { display: '' });
  };

  PerfectScrollbar.prototype.onScroll = function onScroll(e) {
    if (!this.isAlive) {
      return;
    }

    updateGeometry(this);
    processScrollDiff(this, 'top', this.element.scrollTop - this.lastScrollTop);
    processScrollDiff(this, 'left', this.element.scrollLeft - this.lastScrollLeft);

    this.lastScrollTop = this.element.scrollTop;
    this.lastScrollLeft = this.element.scrollLeft;
  };

  PerfectScrollbar.prototype.destroy = function destroy() {
    if (!this.isAlive) {
      return;
    }

    this.event.unbindAll();
    remove(this.scrollbarX);
    remove(this.scrollbarY);
    remove(this.scrollbarXRail);
    remove(this.scrollbarYRail);
    this.removePsClasses();

    // unset elements
    this.element = null;
    this.scrollbarX = null;
    this.scrollbarY = null;
    this.scrollbarXRail = null;
    this.scrollbarYRail = null;

    this.isAlive = false;
  };

  PerfectScrollbar.prototype.removePsClasses = function removePsClasses() {
    this.element.className = this.element.className.split(' ').filter(function (name) {
      return !name.match(/^ps([-_].+|)$/);
    }).join(' ');
  };

  var MenuBoxes = function (_CustomElement3) {
    _inherits(MenuBoxes, _CustomElement3);

    function MenuBoxes() {
      _classCallCheck(this, MenuBoxes);

      return _possibleConstructorReturn(this, (MenuBoxes.__proto__ || Object.getPrototypeOf(MenuBoxes)).call(this));
    }

    _createClass(MenuBoxes, [{
      key: 'connectedCallback',
      value: function connectedCallback() {
        console.log("si", this.toLocaleString());
        var ps = new PerfectScrollbar(this, {
          wheelSpeed: 20,
          suppressScrollY: true
        });
      }
    }, {
      key: 'disconnectedCallback',
      value: function disconnectedCallback() {
        console.log("disconnect");
      }
    }]);

    return MenuBoxes;
  }(_CustomElement);

  /**
   * Dom7 2.0.1
   * Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API
   * http://framework7.io/docs/dom.html
   *
   * Copyright 2017, Vladimir Kharlampidi
   * The iDangero.us
   * http://www.idangero.us/
   *
   * Licensed under MIT
   *
   * Released on: October 2, 2017
   */


  var Dom7 = function Dom7(arr) {
    _classCallCheck(this, Dom7);

    var self = this;
    // Create array-like object
    for (var i = 0; i < arr.length; i += 1) {
      self[i] = arr[i];
    }
    self.length = arr.length;
    // Return collection with methods
    return this;
  };

  function $(selector, context) {
    var arr = [];
    var i = 0;
    if (selector && !context) {
      if (selector instanceof Dom7) {
        return selector;
      }
    }
    if (selector) {
      // String
      if (typeof selector === 'string') {
        var els = void 0;
        var tempParent = void 0;
        var _html = selector.trim();
        if (_html.indexOf('<') >= 0 && _html.indexOf('>') >= 0) {
          var toCreate = 'div';
          if (_html.indexOf('<li') === 0) toCreate = 'ul';
          if (_html.indexOf('<tr') === 0) toCreate = 'tbody';
          if (_html.indexOf('<td') === 0 || _html.indexOf('<th') === 0) toCreate = 'tr';
          if (_html.indexOf('<tbody') === 0) toCreate = 'table';
          if (_html.indexOf('<option') === 0) toCreate = 'select';
          tempParent = document.createElement(toCreate);
          tempParent.innerHTML = _html;
          for (i = 0; i < tempParent.childNodes.length; i += 1) {
            arr.push(tempParent.childNodes[i]);
          }
        } else {
          if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
            // Pure ID selector
            els = [document.getElementById(selector.trim().split('#')[1])];
          } else {
            // Other selectors
            els = (context || document).querySelectorAll(selector.trim());
          }
          for (i = 0; i < els.length; i += 1) {
            if (els[i]) arr.push(els[i]);
          }
        }
      } else if (selector.nodeType || selector === window || selector === document) {
        // Node/element
        arr.push(selector);
      } else if (selector.length > 0 && selector[0].nodeType) {
        // Array of elements or instance of Dom
        for (i = 0; i < selector.length; i += 1) {
          arr.push(selector[i]);
        }
      }
    }
    return new Dom7(arr);
  }

  $.fn = Dom7.prototype;
  $.Class = Dom7;
  $.Dom7 = Dom7;

  function unique(arr) {
    var uniqueArray = [];
    for (var i = 0; i < arr.length; i += 1) {
      if (uniqueArray.indexOf(arr[i]) === -1) uniqueArray.push(arr[i]);
    }
    return uniqueArray;
  }
  // Classes and attributes
  function addClass(className) {
    if (typeof className === 'undefined') {
      return this;
    }
    var classes = className.split(' ');
    for (var i = 0; i < classes.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        if (typeof this[j].classList !== 'undefined') this[j].classList.add(classes[i]);
      }
    }
    return this;
  }
  function removeClass(className) {
    var classes = className.split(' ');
    for (var i = 0; i < classes.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        if (typeof this[j].classList !== 'undefined') this[j].classList.remove(classes[i]);
      }
    }
    return this;
  }
  function hasClass(className) {
    if (!this[0]) return false;
    return this[0].classList.contains(className);
  }
  function toggleClass(className) {
    var classes = className.split(' ');
    for (var i = 0; i < classes.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        if (typeof this[j].classList !== 'undefined') this[j].classList.toggle(classes[i]);
      }
    }
    return this;
  }
  function attr(attrs, value) {
    if (arguments.length === 1 && typeof attrs === 'string') {
      // Get attr
      if (this[0]) return this[0].getAttribute(attrs);
      return undefined;
    }

    // Set attrs
    for (var i = 0; i < this.length; i += 1) {
      if (arguments.length === 2) {
        // String
        this[i].setAttribute(attrs, value);
      } else {
        // Object
        // eslint-disable-next-line
        for (var attrName in attrs) {
          this[i][attrName] = attrs[attrName];
          this[i].setAttribute(attrName, attrs[attrName]);
        }
      }
    }
    return this;
  }
  // eslint-disable-next-line
  function removeAttr(attr) {
    for (var i = 0; i < this.length; i += 1) {
      this[i].removeAttribute(attr);
    }
    return this;
  }
  function data(key, value) {
    var el = void 0;
    if (typeof value === 'undefined') {
      el = this[0];
      // Get value
      if (el) {
        if (el.dom7ElementDataStorage && key in el.dom7ElementDataStorage) {
          return el.dom7ElementDataStorage[key];
        }

        var dataKey = el.getAttribute('data-' + key);
        if (dataKey) {
          return dataKey;
        }
        return undefined;
      }
      return undefined;
    }

    // Set value
    for (var i = 0; i < this.length; i += 1) {
      el = this[i];
      if (!el.dom7ElementDataStorage) el.dom7ElementDataStorage = {};
      el.dom7ElementDataStorage[key] = value;
    }
    return this;
  }
  // Transforms
  // eslint-disable-next-line
  function transform(transform) {
    for (var i = 0; i < this.length; i += 1) {
      var elStyle = this[i].style;
      elStyle.webkitTransform = transform;
      elStyle.transform = transform;
    }
    return this;
  }
  function transition(duration) {
    if (typeof duration !== 'string') {
      duration = duration + 'ms'; // eslint-disable-line
    }
    for (var i = 0; i < this.length; i += 1) {
      var elStyle = this[i].style;
      elStyle.webkitTransitionDuration = duration;
      elStyle.transitionDuration = duration;
    }
    return this;
  }
  // Events
  function on() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var eventType = args[0],
        targetSelector = args[1],
        listener = args[2],
        capture = args[3];

    if (typeof args[1] === 'function') {
      eventType = args[0];
      listener = args[1];
      capture = args[2];

      targetSelector = undefined;
    }
    if (!capture) capture = false;

    function handleLiveEvent(e) {
      var target = e.target;
      if (!target) return;
      var eventData = e.target.dom7EventData || [];
      eventData.unshift(e);
      if ($(target).is(targetSelector)) listener.apply(target, eventData);else {
        var _parents = $(target).parents(); // eslint-disable-line
        for (var k = 0; k < _parents.length; k += 1) {
          if ($(_parents[k]).is(targetSelector)) listener.apply(_parents[k], eventData);
        }
      }
    }
    function handleEvent(e) {
      var eventData = e && e.target ? e.target.dom7EventData || [] : [];
      eventData.unshift(e);
      listener.apply(this, eventData);
    }
    var events = eventType.split(' ');
    var j = void 0;
    for (var i = 0; i < this.length; i += 1) {
      var el = this[i];
      if (!targetSelector) {
        for (j = 0; j < events.length; j += 1) {
          if (!el.dom7Listeners) el.dom7Listeners = [];
          el.dom7Listeners.push({
            type: eventType,
            listener: listener,
            proxyListener: handleEvent
          });
          el.addEventListener(events[j], handleEvent, capture);
        }
      } else {
        // Live events
        for (j = 0; j < events.length; j += 1) {
          if (!el.dom7LiveListeners) el.dom7LiveListeners = [];
          el.dom7LiveListeners.push({
            type: eventType,
            listener: listener,
            proxyListener: handleLiveEvent
          });
          el.addEventListener(events[j], handleLiveEvent, capture);
        }
      }
    }
    return this;
  }
  function off() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var eventType = args[0],
        targetSelector = args[1],
        listener = args[2],
        capture = args[3];

    if (typeof args[1] === 'function') {
      eventType = args[0];
      listener = args[1];
      capture = args[2];

      targetSelector = undefined;
    }
    if (!capture) capture = false;

    var events = eventType.split(' ');
    for (var i = 0; i < events.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        var el = this[j];
        if (!targetSelector) {
          if (el.dom7Listeners) {
            for (var k = 0; k < el.dom7Listeners.length; k += 1) {
              if (listener) {
                if (el.dom7Listeners[k].listener === listener) {
                  el.removeEventListener(events[i], el.dom7Listeners[k].proxyListener, capture);
                }
              } else if (el.dom7Listeners[k].type === events[i]) {
                el.removeEventListener(events[i], el.dom7Listeners[k].proxyListener, capture);
              }
            }
          }
        } else if (el.dom7LiveListeners) {
          for (var _k = 0; _k < el.dom7LiveListeners.length; _k += 1) {
            if (listener) {
              if (el.dom7LiveListeners[_k].listener === listener) {
                el.removeEventListener(events[i], el.dom7LiveListeners[_k].proxyListener, capture);
              }
            } else if (el.dom7LiveListeners[_k].type === events[i]) {
              el.removeEventListener(events[i], el.dom7LiveListeners[_k].proxyListener, capture);
            }
          }
        }
      }
    }
    return this;
  }
  function trigger() {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    var events = args[0].split(' ');
    var eventData = args[1];
    for (var i = 0; i < events.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        var evt = void 0;
        try {
          evt = new window.CustomEvent(events[i], {
            detail: eventData,
            bubbles: true,
            cancelable: true
          });
        } catch (e) {
          evt = document.createEvent('Event');
          evt.initEvent(events[i], true, true);
          evt.detail = eventData;
        }
        // eslint-disable-next-line
        this[j].dom7EventData = args.filter(function (data, dataIndex) {
          return dataIndex > 0;
        });
        this[j].dispatchEvent(evt);
        this[j].dom7EventData = [];
        delete this[j].dom7EventData;
      }
    }
    return this;
  }
  function transitionEnd(callback) {
    var events = ['webkitTransitionEnd', 'transitionend'];
    var dom = this;
    var i = void 0;
    function fireCallBack(e) {
      /* jshint validthis:true */
      if (e.target !== this) return;
      callback.call(this, e);
      for (i = 0; i < events.length; i += 1) {
        dom.off(events[i], fireCallBack);
      }
    }
    if (callback) {
      for (i = 0; i < events.length; i += 1) {
        dom.on(events[i], fireCallBack);
      }
    }
    return this;
  }
  function outerWidth$1(includeMargins) {
    if (this.length > 0) {
      if (includeMargins) {
        // eslint-disable-next-line
        var _styles = this.styles();
        return this[0].offsetWidth + parseFloat(_styles.getPropertyValue('margin-right')) + parseFloat(_styles.getPropertyValue('margin-left'));
      }
      return this[0].offsetWidth;
    }
    return null;
  }
  function outerHeight(includeMargins) {
    if (this.length > 0) {
      if (includeMargins) {
        // eslint-disable-next-line
        var _styles2 = this.styles();
        return this[0].offsetHeight + parseFloat(_styles2.getPropertyValue('margin-top')) + parseFloat(_styles2.getPropertyValue('margin-bottom'));
      }
      return this[0].offsetHeight;
    }
    return null;
  }
  function offset() {
    if (this.length > 0) {
      var el = this[0];
      var box = el.getBoundingClientRect();
      var body = document.body;
      var clientTop = el.clientTop || body.clientTop || 0;
      var clientLeft = el.clientLeft || body.clientLeft || 0;
      var scrollTop = el === window ? window.scrollY : el.scrollTop;
      var scrollLeft = el === window ? window.scrollX : el.scrollLeft;
      return {
        top: box.top + scrollTop - clientTop,
        left: box.left + scrollLeft - clientLeft
      };
    }

    return null;
  }
  function styles() {
    if (this[0]) return window.getComputedStyle(this[0], null);
    return {};
  }
  function css(props, value) {
    var i = void 0;
    if (arguments.length === 1) {
      if (typeof props === 'string') {
        if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
      } else {
        for (i = 0; i < this.length; i += 1) {
          // eslint-disable-next-line
          for (var prop in props) {
            this[i].style[prop] = props[prop];
          }
        }
        return this;
      }
    }
    if (arguments.length === 2 && typeof props === 'string') {
      for (i = 0; i < this.length; i += 1) {
        this[i].style[props] = value;
      }
      return this;
    }
    return this;
  }

  // Iterate over the collection passing elements to `callback`
  function each(callback) {
    // Don't bother continuing without a callback
    if (!callback) return this;
    // Iterate over the current collection
    for (var i = 0; i < this.length; i += 1) {
      // If the callback returns false
      if (callback.call(this[i], i, this[i]) === false) {
        // End the loop early
        return this;
      }
    }
    // Return `this` to allow chained DOM operations
    return this;
  }
  // eslint-disable-next-line
  function html(html) {
    if (typeof html === 'undefined') {
      return this[0] ? this[0].innerHTML : undefined;
    }

    for (var i = 0; i < this.length; i += 1) {
      this[i].innerHTML = html;
    }
    return this;
  }
  // eslint-disable-next-line
  function text(text) {
    if (typeof text === 'undefined') {
      if (this[0]) {
        return this[0].textContent.trim();
      }
      return null;
    }

    for (var i = 0; i < this.length; i += 1) {
      this[i].textContent = text;
    }
    return this;
  }
  function is(selector) {
    var el = this[0];
    var compareWith = void 0;
    var i = void 0;
    if (!el || typeof selector === 'undefined') return false;
    if (typeof selector === 'string') {
      if (el.matches) return el.matches(selector);else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);else if (el.msMatchesSelector) return el.msMatchesSelector(selector);

      compareWith = $(selector);
      for (i = 0; i < compareWith.length; i += 1) {
        if (compareWith[i] === el) return true;
      }
      return false;
    } else if (selector === document) return el === document;else if (selector === window) return el === window;

    if (selector.nodeType || selector instanceof Dom7) {
      compareWith = selector.nodeType ? [selector] : selector;
      for (i = 0; i < compareWith.length; i += 1) {
        if (compareWith[i] === el) return true;
      }
      return false;
    }
    return false;
  }
  function index() {
    var child = this[0];
    var i = void 0;
    if (child) {
      i = 0;
      // eslint-disable-next-line
      while ((child = child.previousSibling) !== null) {
        if (child.nodeType === 1) i += 1;
      }
      return i;
    }
    return undefined;
  }
  // eslint-disable-next-line
  function eq(index) {
    if (typeof index === 'undefined') return this;
    var length = this.length;
    var returnIndex = void 0;
    if (index > length - 1) {
      return new Dom7([]);
    }
    if (index < 0) {
      returnIndex = length + index;
      if (returnIndex < 0) return new Dom7([]);
      return new Dom7([this[returnIndex]]);
    }
    return new Dom7([this[index]]);
  }
  function append() {
    var newChild = void 0;

    for (var k = 0; k < arguments.length; k += 1) {
      newChild = arguments.length <= k ? undefined : arguments[k];
      for (var i = 0; i < this.length; i += 1) {
        if (typeof newChild === 'string') {
          var tempDiv = document.createElement('div');
          tempDiv.innerHTML = newChild;
          while (tempDiv.firstChild) {
            this[i].appendChild(tempDiv.firstChild);
          }
        } else if (newChild instanceof Dom7) {
          for (var j = 0; j < newChild.length; j += 1) {
            this[i].appendChild(newChild[j]);
          }
        } else {
          this[i].appendChild(newChild);
        }
      }
    }

    return this;
  }
  function prepend(newChild) {
    var i = void 0;
    var j = void 0;
    for (i = 0; i < this.length; i += 1) {
      if (typeof newChild === 'string') {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = newChild;
        for (j = tempDiv.childNodes.length - 1; j >= 0; j -= 1) {
          this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
        }
      } else if (newChild instanceof Dom7) {
        for (j = 0; j < newChild.length; j += 1) {
          this[i].insertBefore(newChild[j], this[i].childNodes[0]);
        }
      } else {
        this[i].insertBefore(newChild, this[i].childNodes[0]);
      }
    }
    return this;
  }
  function next(selector) {
    if (this.length > 0) {
      if (selector) {
        if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) {
          return new Dom7([this[0].nextElementSibling]);
        }
        return new Dom7([]);
      }

      if (this[0].nextElementSibling) return new Dom7([this[0].nextElementSibling]);
      return new Dom7([]);
    }
    return new Dom7([]);
  }
  function nextAll(selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) return new Dom7([]);
    while (el.nextElementSibling) {
      var _next = el.nextElementSibling; // eslint-disable-line
      if (selector) {
        if ($(_next).is(selector)) nextEls.push(_next);
      } else nextEls.push(_next);
      el = _next;
    }
    return new Dom7(nextEls);
  }
  function prev(selector) {
    if (this.length > 0) {
      var el = this[0];
      if (selector) {
        if (el.previousElementSibling && $(el.previousElementSibling).is(selector)) {
          return new Dom7([el.previousElementSibling]);
        }
        return new Dom7([]);
      }

      if (el.previousElementSibling) return new Dom7([el.previousElementSibling]);
      return new Dom7([]);
    }
    return new Dom7([]);
  }
  function prevAll(selector) {
    var prevEls = [];
    var el = this[0];
    if (!el) return new Dom7([]);
    while (el.previousElementSibling) {
      var _prev = el.previousElementSibling; // eslint-disable-line
      if (selector) {
        if ($(_prev).is(selector)) prevEls.push(_prev);
      } else prevEls.push(_prev);
      el = _prev;
    }
    return new Dom7(prevEls);
  }
  function parent(selector) {
    var parents = []; // eslint-disable-line
    for (var i = 0; i < this.length; i += 1) {
      if (this[i].parentNode !== null) {
        if (selector) {
          if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
        } else {
          parents.push(this[i].parentNode);
        }
      }
    }
    return $(unique(parents));
  }
  function parents(selector) {
    var parents = []; // eslint-disable-line
    for (var i = 0; i < this.length; i += 1) {
      var _parent = this[i].parentNode; // eslint-disable-line
      while (_parent) {
        if (selector) {
          if ($(_parent).is(selector)) parents.push(_parent);
        } else {
          parents.push(_parent);
        }
        _parent = _parent.parentNode;
      }
    }
    return $(unique(parents));
  }
  function closest(selector) {
    var closest = this; // eslint-disable-line
    if (typeof selector === 'undefined') {
      return new Dom7([]);
    }
    if (!closest.is(selector)) {
      closest = closest.parents(selector).eq(0);
    }
    return closest;
  }
  function find$1(selector) {
    var foundElements = [];
    for (var i = 0; i < this.length; i += 1) {
      var found = this[i].querySelectorAll(selector);
      for (var j = 0; j < found.length; j += 1) {
        foundElements.push(found[j]);
      }
    }
    return new Dom7(foundElements);
  }
  function children(selector) {
    var children = []; // eslint-disable-line
    for (var i = 0; i < this.length; i += 1) {
      var childNodes = this[i].childNodes;

      for (var j = 0; j < childNodes.length; j += 1) {
        if (!selector) {
          if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
        } else if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) {
          children.push(childNodes[j]);
        }
      }
    }
    return new Dom7(unique(children));
  }
  function remove$1() {
    for (var i = 0; i < this.length; i += 1) {
      if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
    }
    return this;
  }
  function add() {
    var dom = this;
    var i = void 0;
    var j = void 0;

    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    for (i = 0; i < args.length; i += 1) {
      var toAdd = $(args[i]);
      for (j = 0; j < toAdd.length; j += 1) {
        dom[dom.length] = toAdd[j];
        dom.length += 1;
      }
    }
    return dom;
  }
  var noTrigger = 'resize scroll'.split(' ');

  /**
   * Swiper 4.0.7
   * Most modern mobile touch slider and framework with hardware accelerated transitions
   * http://www.idangero.us/swiper/
   *
   * Copyright 2014-2017 Vladimir Kharlampidi
   *
   * Released under the MIT License
   *
   * Released on: November 28, 2017
   */

  var w = void 0;
  if (typeof window === 'undefined') {
    w = {
      navigator: {
        userAgent: ''
      },
      location: {},
      history: {},
      addEventListener: function addEventListener() {},
      removeEventListener: function removeEventListener() {},
      getComputedStyle: function getComputedStyle() {
        return {};
      },
      Image: function Image() {},
      Date: function Date() {},

      screen: {}
    };
  } else {
    w = window;
  }

  var win = w;

  var Methods = {
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,
    toggleClass: toggleClass,
    attr: attr,
    removeAttr: removeAttr,
    data: data,
    transform: transform,
    transition: transition,
    on: on,
    off: off,
    trigger: trigger,
    transitionEnd: transitionEnd,
    outerWidth: outerWidth$1,
    outerHeight: outerHeight,
    offset: offset,
    css: css,
    each: each,
    html: html,
    text: text,
    is: is,
    index: index,
    eq: eq,
    append: append,
    prepend: prepend,
    next: next,
    nextAll: nextAll,
    prev: prev,
    prevAll: prevAll,
    parent: parent,
    parents: parents,
    closest: closest,
    find: find$1,
    children: children,
    remove: remove$1,
    add: add,
    styles: styles
  };

  Object.keys(Methods).forEach(function (methodName) {
    $.fn[methodName] = Methods[methodName];
  });

  var Utils = {
    deleteProps: function deleteProps(obj) {
      var object = obj;
      Object.keys(object).forEach(function (key) {
        try {
          object[key] = null;
        } catch (e) {
          // no getter for object
        }
        try {
          delete object[key];
        } catch (e) {
          // something got wrong
        }
      });
    },
    nextTick: function nextTick(callback) {
      var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      return setTimeout(callback, delay);
    },
    now: function now() {
      return Date.now();
    },
    getTranslate: function getTranslate(el) {
      var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'x';

      var matrix = void 0;
      var curTransform = void 0;
      var transformMatrix = void 0;

      var curStyle = win.getComputedStyle(el, null);

      if (win.WebKitCSSMatrix) {
        curTransform = curStyle.transform || curStyle.webkitTransform;
        if (curTransform.split(',').length > 6) {
          curTransform = curTransform.split(', ').map(function (a) {
            return a.replace(',', '.');
          }).join(', ');
        }
        // Some old versions of Webkit choke when 'none' is passed; pass
        // empty string instead in this case
        transformMatrix = new win.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
      } else {
        transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
        matrix = transformMatrix.toString().split(',');
      }

      if (axis === 'x') {
        // Latest Chrome and webkits Fix
        if (win.WebKitCSSMatrix) curTransform = transformMatrix.m41;
        // Crazy IE10 Matrix
        else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
          // Normal Browsers
          else curTransform = parseFloat(matrix[4]);
      }
      if (axis === 'y') {
        // Latest Chrome and webkits Fix
        if (win.WebKitCSSMatrix) curTransform = transformMatrix.m42;
        // Crazy IE10 Matrix
        else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
          // Normal Browsers
          else curTransform = parseFloat(matrix[5]);
      }
      return curTransform || 0;
    },
    parseUrlQuery: function parseUrlQuery(url) {
      var query = {};
      var urlToParse = url || win.location.href;
      var i = void 0;
      var params = void 0;
      var param = void 0;
      var length = void 0;
      if (typeof urlToParse === 'string' && urlToParse.length) {
        urlToParse = urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : '';
        params = urlToParse.split('&').filter(function (paramsPart) {
          return paramsPart !== '';
        });
        length = params.length;

        for (i = 0; i < length; i += 1) {
          param = params[i].replace(/#\S+/g, '').split('=');
          query[decodeURIComponent(param[0])] = typeof param[1] === 'undefined' ? undefined : decodeURIComponent(param[1]) || '';
        }
      }
      return query;
    },
    isObject: function isObject(o) {
      return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && o !== null && o.constructor && o.constructor === Object;
    },
    extend: function extend() {
      var to = Object(arguments.length <= 0 ? undefined : arguments[0]);
      for (var i = 1; i < arguments.length; i += 1) {
        var nextSource = arguments.length <= i ? undefined : arguments[i];
        if (nextSource !== undefined && nextSource !== null) {
          var keysArray = Object.keys(Object(nextSource));
          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              if (Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
                Utils.extend(to[nextKey], nextSource[nextKey]);
              } else if (!Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
                to[nextKey] = {};
                Utils.extend(to[nextKey], nextSource[nextKey]);
              } else {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
      }
      return to;
    }
  };

  var d = void 0;
  if (typeof document === 'undefined') {
    d = {
      addEventListener: function addEventListener() {},
      removeEventListener: function removeEventListener() {},

      activeElement: {
        blur: function blur() {},

        nodeName: ''
      },
      querySelector: function querySelector() {
        return {};
      },
      querySelectorAll: function querySelectorAll() {
        return [];
      },
      createElement: function createElement() {
        return {
          style: {},
          setAttribute: function setAttribute() {},
          getElementsByTagName: function getElementsByTagName() {
            return [];
          }
        };
      },

      location: { hash: '' }
    };
  } else {
    d = document;
  }

  var doc = d;

  var Support = function Support() {
    return {
      touch: win.Modernizr && win.Modernizr.touch === true || function checkTouch() {
        return !!('ontouchstart' in win || win.DocumentTouch && doc instanceof win.DocumentTouch);
      }(),

      transforms3d: win.Modernizr && win.Modernizr.csstransforms3d === true || function checkTransforms3d() {
        var div = doc.createElement('div').style;
        return 'webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div;
      }(),

      flexbox: function checkFlexbox() {
        var div = doc.createElement('div').style;
        var styles$$1 = 'alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient'.split(' ');
        for (var i = 0; i < styles$$1.length; i += 1) {
          if (styles$$1[i] in div) return true;
        }
        return false;
      }(),

      observer: function checkObserver() {
        return 'MutationObserver' in win || 'WebkitMutationObserver' in win;
      }(),

      passiveListener: function checkPassiveListener() {
        var supportsPassive = false;
        try {
          var opts = Object.defineProperty({}, 'passive', {
            get: function get() {
              supportsPassive = true;
            }
          });
          win.addEventListener('testPassiveListener', null, opts);
        } catch (e) {
          // No support
        }
        return supportsPassive;
      }(),

      gestures: function checkGestures() {
        return 'ongesturestart' in win;
      }()
    };
  }();

  var SwiperClass = function () {
    function SwiperClass() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, SwiperClass);

      var self = this;
      self.params = params;

      // Events
      self.eventsListeners = {};

      if (self.params && self.params.on) {
        Object.keys(self.params.on).forEach(function (eventName) {
          self.on(eventName, self.params.on[eventName]);
        });
      }
    }

    _createClass(SwiperClass, [{
      key: 'on',
      value: function on(events, handler) {
        var self = this;
        if (typeof handler !== 'function') return self;
        events.split(' ').forEach(function (event) {
          if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
          self.eventsListeners[event].push(handler);
        });
        return self;
      }
    }, {
      key: 'once',
      value: function once(events, handler) {
        var self = this;
        if (typeof handler !== 'function') return self;
        function onceHandler() {
          for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
          }

          handler.apply(self, args);
          self.off(events, onceHandler);
        }
        return self.on(events, onceHandler);
      }
    }, {
      key: 'off',
      value: function off(events, handler) {
        var self = this;
        events.split(' ').forEach(function (event) {
          if (typeof handler === 'undefined') {
            self.eventsListeners[event] = [];
          } else {
            self.eventsListeners[event].forEach(function (eventHandler, index$$1) {
              if (eventHandler === handler) {
                self.eventsListeners[event].splice(index$$1, 1);
              }
            });
          }
        });
        return self;
      }
    }, {
      key: 'emit',
      value: function emit() {
        var self = this;
        if (!self.eventsListeners) return self;
        var events = void 0;
        var data$$1 = void 0;
        var context = void 0;

        for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
          args[_key7] = arguments[_key7];
        }

        if (typeof args[0] === 'string' || Array.isArray(args[0])) {
          events = args[0];
          data$$1 = args.slice(1, args.length);
          context = self;
        } else {
          events = args[0].events;
          data$$1 = args[0].data;
          context = args[0].context || self;
        }
        var eventsArray = Array.isArray(events) ? events : events.split(' ');
        eventsArray.forEach(function (event) {
          if (self.eventsListeners[event]) {
            var _handlers = [];
            self.eventsListeners[event].forEach(function (eventHandler) {
              _handlers.push(eventHandler);
            });
            _handlers.forEach(function (eventHandler) {
              eventHandler.apply(context, data$$1);
            });
          }
        });
        return self;
      }
    }, {
      key: 'useModulesParams',
      value: function useModulesParams(instanceParams) {
        var instance = this;
        if (!instance.modules) return;
        Object.keys(instance.modules).forEach(function (moduleName) {
          var module = instance.modules[moduleName];
          // Extend params
          if (module.params) {
            Utils.extend(instanceParams, module.params);
          }
        });
      }
    }, {
      key: 'useModules',
      value: function useModules() {
        var modulesParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var instance = this;
        if (!instance.modules) return;
        Object.keys(instance.modules).forEach(function (moduleName) {
          var module = instance.modules[moduleName];
          var moduleParams = modulesParams[moduleName] || {};
          // Extend instance methods and props
          if (module.instance) {
            Object.keys(module.instance).forEach(function (modulePropName) {
              var moduleProp = module.instance[modulePropName];
              if (typeof moduleProp === 'function') {
                instance[modulePropName] = moduleProp.bind(instance);
              } else {
                instance[modulePropName] = moduleProp;
              }
            });
          }
          // Add event listeners
          if (module.on && instance.on) {
            Object.keys(module.on).forEach(function (moduleEventName) {
              instance.on(moduleEventName, module.on[moduleEventName]);
            });
          }

          // Module create callback
          if (module.create) {
            module.create.bind(instance)(moduleParams);
          }
        });
      }
    }], [{
      key: 'installModule',
      value: function installModule(module) {
        var Class = this;
        if (!Class.prototype.modules) Class.prototype.modules = {};
        var name = module.name || Object.keys(Class.prototype.modules).length + '_' + Utils.now();
        Class.prototype.modules[name] = module;
        // Prototype
        if (module.proto) {
          Object.keys(module.proto).forEach(function (key) {
            Class.prototype[key] = module.proto[key];
          });
        }
        // Class
        if (module.static) {
          Object.keys(module.static).forEach(function (key) {
            Class[key] = module.static[key];
          });
        }
        // Callback
        if (module.install) {
          for (var _len8 = arguments.length, params = Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
            params[_key8 - 1] = arguments[_key8];
          }

          module.install.apply(Class, params);
        }
        return Class;
      }
    }, {
      key: 'use',
      value: function use(module) {
        var Class = this;
        if (Array.isArray(module)) {
          module.forEach(function (m) {
            return Class.installModule(m);
          });
          return Class;
        }

        for (var _len9 = arguments.length, params = Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
          params[_key9 - 1] = arguments[_key9];
        }

        return Class.installModule.apply(Class, [module].concat(params));
      }
    }, {
      key: 'components',
      set: function set(components) {
        var Class = this;
        if (!Class.use) return;
        Class.use(components);
      }
    }]);

    return SwiperClass;
  }();

  var updateSize = function updateSize() {
    var swiper = this;
    var width$$1 = void 0;
    var height$$1 = void 0;
    var $el = swiper.$el;
    if (typeof swiper.params.width !== 'undefined') {
      width$$1 = swiper.params.width;
    } else {
      width$$1 = $el[0].clientWidth;
    }
    if (typeof swiper.params.height !== 'undefined') {
      height$$1 = swiper.params.height;
    } else {
      height$$1 = $el[0].clientHeight;
    }
    if (width$$1 === 0 && swiper.isHorizontal() || height$$1 === 0 && swiper.isVertical()) {
      return;
    }

    // Subtract paddings
    width$$1 = width$$1 - parseInt($el.css('padding-left'), 10) - parseInt($el.css('padding-right'), 10);
    height$$1 = height$$1 - parseInt($el.css('padding-top'), 10) - parseInt($el.css('padding-bottom'), 10);

    Utils.extend(swiper, {
      width: width$$1,
      height: height$$1,
      size: swiper.isHorizontal() ? width$$1 : height$$1
    });
  };

  var updateSlides = function updateSlides() {
    var swiper = this;
    var params = swiper.params;

    var $wrapperEl = swiper.$wrapperEl,
        swiperSize = swiper.size,
        rtl = swiper.rtl,
        wrongRTL = swiper.wrongRTL;

    var slides = $wrapperEl.children('.' + swiper.params.slideClass);
    var isVirtual = swiper.virtual && params.virtual.enabled;
    var slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
    var snapGrid = [];
    var slidesGrid = [];
    var slidesSizesGrid = [];

    var offsetBefore = params.slidesOffsetBefore;
    if (typeof offsetBefore === 'function') {
      offsetBefore = params.slidesOffsetBefore.call(swiper);
    }

    var offsetAfter = params.slidesOffsetAfter;
    if (typeof offsetAfter === 'function') {
      offsetAfter = params.slidesOffsetAfter.call(swiper);
    }

    var previousSlidesLength = slidesLength;
    var previousSnapGridLength = swiper.snapGrid.length;
    var previousSlidesGridLength = swiper.snapGrid.length;

    var spaceBetween = params.spaceBetween;
    var slidePosition = -offsetBefore;
    var prevSlideSize = 0;
    var index$$1 = 0;
    if (typeof swiperSize === 'undefined') {
      return;
    }
    if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
      spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiperSize;
    }

    swiper.virtualSize = -spaceBetween;

    // reset margins
    if (rtl) slides.css({ marginLeft: '', marginTop: '' });else slides.css({ marginRight: '', marginBottom: '' });

    var slidesNumberEvenToRows = void 0;
    if (params.slidesPerColumn > 1) {
      if (Math.floor(slidesLength / params.slidesPerColumn) === slidesLength / swiper.params.slidesPerColumn) {
        slidesNumberEvenToRows = slidesLength;
      } else {
        slidesNumberEvenToRows = Math.ceil(slidesLength / params.slidesPerColumn) * params.slidesPerColumn;
      }
      if (params.slidesPerView !== 'auto' && params.slidesPerColumnFill === 'row') {
        slidesNumberEvenToRows = Math.max(slidesNumberEvenToRows, params.slidesPerView * params.slidesPerColumn);
      }
    }

    // Calc slides
    var slideSize = void 0;
    var slidesPerColumn = params.slidesPerColumn;
    var slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
    var numFullColumns = slidesPerRow - (params.slidesPerColumn * slidesPerRow - slidesLength);
    for (var i = 0; i < slidesLength; i += 1) {
      slideSize = 0;
      var _slide = slides.eq(i);
      if (params.slidesPerColumn > 1) {
        // Set slides order
        var newSlideOrderIndex = void 0;
        var column = void 0;
        var row = void 0;
        if (params.slidesPerColumnFill === 'column') {
          column = Math.floor(i / slidesPerColumn);
          row = i - column * slidesPerColumn;
          if (column > numFullColumns || column === numFullColumns && row === slidesPerColumn - 1) {
            row += 1;
            if (row >= slidesPerColumn) {
              row = 0;
              column += 1;
            }
          }
          newSlideOrderIndex = column + row * slidesNumberEvenToRows / slidesPerColumn;
          _slide.css({
            '-webkit-box-ordinal-group': newSlideOrderIndex,
            '-moz-box-ordinal-group': newSlideOrderIndex,
            '-ms-flex-order': newSlideOrderIndex,
            '-webkit-order': newSlideOrderIndex,
            order: newSlideOrderIndex
          });
        } else {
          row = Math.floor(i / slidesPerRow);
          column = i - row * slidesPerRow;
        }
        _slide.css('margin-' + (swiper.isHorizontal() ? 'top' : 'left'), row !== 0 && params.spaceBetween && params.spaceBetween + 'px').attr('data-swiper-column', column).attr('data-swiper-row', row);
      }
      if (_slide.css('display') === 'none') continue; // eslint-disable-line
      if (params.slidesPerView === 'auto') {
        slideSize = swiper.isHorizontal() ? _slide.outerWidth(true) : _slide.outerHeight(true);
        if (params.roundLengths) slideSize = Math.floor(slideSize);
      } else {
        slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
        if (params.roundLengths) slideSize = Math.floor(slideSize);

        if (slides[i]) {
          if (swiper.isHorizontal()) {
            slides[i].style.width = slideSize + 'px';
          } else {
            slides[i].style.height = slideSize + 'px';
          }
        }
      }
      if (slides[i]) {
        slides[i].swiperSlideSize = slideSize;
      }
      slidesSizesGrid.push(slideSize);

      if (params.centeredSlides) {
        slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
        if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
        if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
        if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
        if (index$$1 % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
        slidesGrid.push(slidePosition);
      } else {
        if (index$$1 % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
        slidesGrid.push(slidePosition);
        slidePosition = slidePosition + slideSize + spaceBetween;
      }

      swiper.virtualSize += slideSize + spaceBetween;

      prevSlideSize = slideSize;

      index$$1 += 1;
    }
    swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
    var newSlidesGrid = void 0;

    if (rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
      $wrapperEl.css({ width: swiper.virtualSize + params.spaceBetween + 'px' });
    }
    if (!Support.flexbox || params.setWrapperSize) {
      if (swiper.isHorizontal()) $wrapperEl.css({ width: swiper.virtualSize + params.spaceBetween + 'px' });else $wrapperEl.css({ height: swiper.virtualSize + params.spaceBetween + 'px' });
    }

    if (params.slidesPerColumn > 1) {
      swiper.virtualSize = (slideSize + params.spaceBetween) * slidesNumberEvenToRows;
      swiper.virtualSize = Math.ceil(swiper.virtualSize / params.slidesPerColumn) - params.spaceBetween;
      if (swiper.isHorizontal()) $wrapperEl.css({ width: swiper.virtualSize + params.spaceBetween + 'px' });else $wrapperEl.css({ height: swiper.virtualSize + params.spaceBetween + 'px' });
      if (params.centeredSlides) {
        newSlidesGrid = [];
        for (var _i = 0; _i < snapGrid.length; _i += 1) {
          if (snapGrid[_i] < swiper.virtualSize + snapGrid[0]) newSlidesGrid.push(snapGrid[_i]);
        }
        snapGrid = newSlidesGrid;
      }
    }

    // Remove last grid elements depending on width
    if (!params.centeredSlides) {
      newSlidesGrid = [];
      for (var _i2 = 0; _i2 < snapGrid.length; _i2 += 1) {
        if (snapGrid[_i2] <= swiper.virtualSize - swiperSize) {
          newSlidesGrid.push(snapGrid[_i2]);
        }
      }
      snapGrid = newSlidesGrid;
      if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
        snapGrid.push(swiper.virtualSize - swiperSize);
      }
    }
    if (snapGrid.length === 0) snapGrid = [0];

    if (params.spaceBetween !== 0) {
      if (swiper.isHorizontal()) {
        if (rtl) slides.css({ marginLeft: spaceBetween + 'px' });else slides.css({ marginRight: spaceBetween + 'px' });
      } else slides.css({ marginBottom: spaceBetween + 'px' });
    }

    Utils.extend(swiper, {
      slides: slides,
      snapGrid: snapGrid,
      slidesGrid: slidesGrid,
      slidesSizesGrid: slidesSizesGrid
    });

    if (slidesLength !== previousSlidesLength) {
      swiper.emit('slidesLengthChange');
    }
    if (snapGrid.length !== previousSnapGridLength) {
      swiper.emit('snapGridLengthChange');
    }
    if (slidesGrid.length !== previousSlidesGridLength) {
      swiper.emit('slidesGridLengthChange');
    }

    if (params.watchSlidesProgress || params.watchSlidesVisibility) {
      swiper.updateSlidesOffset();
    }
  };

  var updateAutoHeight = function updateAutoHeight() {
    var swiper = this;
    var activeSlides = [];
    var newHeight = 0;
    var i = void 0;

    // Find slides currently in view
    if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
      for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
        var index$$1 = swiper.activeIndex + i;
        if (index$$1 > swiper.slides.length) break;
        activeSlides.push(swiper.slides.eq(index$$1)[0]);
      }
    } else {
      activeSlides.push(swiper.slides.eq(swiper.activeIndex)[0]);
    }

    // Find new height from highest slide in view
    for (i = 0; i < activeSlides.length; i += 1) {
      if (typeof activeSlides[i] !== 'undefined') {
        var height$$1 = activeSlides[i].offsetHeight;
        newHeight = height$$1 > newHeight ? height$$1 : newHeight;
      }
    }

    // Update Height
    if (newHeight) swiper.$wrapperEl.css('height', newHeight + 'px');
  };

  var updateSlidesOffset = function updateSlidesOffset() {
    var swiper = this;
    var slides = swiper.slides;
    for (var i = 0; i < slides.length; i += 1) {
      slides[i].swiperSlideOffset = swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop;
    }
  };

  var updateSlidesProgress = function updateSlidesProgress() {
    var translate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.translate || 0;

    var swiper = this;
    var params = swiper.params;

    var slides = swiper.slides,
        rtl = swiper.rtl;


    if (slides.length === 0) return;
    if (typeof slides[0].swiperSlideOffset === 'undefined') swiper.updateSlidesOffset();

    var offsetCenter = -translate;
    if (rtl) offsetCenter = translate;

    // Visible Slides
    slides.removeClass(params.slideVisibleClass);

    for (var i = 0; i < slides.length; i += 1) {
      var _slide2 = slides[i];
      var slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - _slide2.swiperSlideOffset) / (_slide2.swiperSlideSize + params.spaceBetween);
      if (params.watchSlidesVisibility) {
        var slideBefore = -(offsetCenter - _slide2.swiperSlideOffset);
        var slideAfter = slideBefore + swiper.slidesSizesGrid[i];
        var isVisible = slideBefore >= 0 && slideBefore < swiper.size || slideAfter > 0 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
        if (isVisible) {
          slides.eq(i).addClass(params.slideVisibleClass);
        }
      }
      _slide2.progress = rtl ? -slideProgress : slideProgress;
    }
  };

  var updateProgress = function updateProgress() {
    var translate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.translate || 0;

    var swiper = this;
    var params = swiper.params;

    var translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
    var progress = swiper.progress,
        isBeginning = swiper.isBeginning,
        isEnd = swiper.isEnd;

    var wasBeginning = isBeginning;
    var wasEnd = isEnd;
    if (translatesDiff === 0) {
      progress = 0;
      isBeginning = true;
      isEnd = true;
    } else {
      progress = (translate - swiper.minTranslate()) / translatesDiff;
      isBeginning = progress <= 0;
      isEnd = progress >= 1;
    }
    Utils.extend(swiper, {
      progress: progress,
      isBeginning: isBeginning,
      isEnd: isEnd
    });

    if (params.watchSlidesProgress || params.watchSlidesVisibility) swiper.updateSlidesProgress(translate);

    if (isBeginning && !wasBeginning) {
      swiper.emit('reachBeginning toEdge');
    }
    if (isEnd && !wasEnd) {
      swiper.emit('reachEnd toEdge');
    }
    if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
      swiper.emit('fromEdge');
    }

    swiper.emit('progress', progress);
  };

  var updateSlidesClasses = function updateSlidesClasses() {
    var swiper = this;

    var slides = swiper.slides,
        params = swiper.params,
        $wrapperEl = swiper.$wrapperEl,
        activeIndex = swiper.activeIndex,
        realIndex = swiper.realIndex;

    var isVirtual = swiper.virtual && params.virtual.enabled;

    slides.removeClass(params.slideActiveClass + ' ' + params.slideNextClass + ' ' + params.slidePrevClass + ' ' + params.slideDuplicateActiveClass + ' ' + params.slideDuplicateNextClass + ' ' + params.slideDuplicatePrevClass);

    var activeSlide = void 0;
    if (isVirtual) {
      activeSlide = swiper.$wrapperEl.find('.' + params.slideClass + '[data-swiper-slide-index="' + activeIndex + '"]');
    } else {
      activeSlide = slides.eq(activeIndex);
    }

    // Active classes
    activeSlide.addClass(params.slideActiveClass);

    if (params.loop) {
      // Duplicate to all looped slides
      if (activeSlide.hasClass(params.slideDuplicateClass)) {
        $wrapperEl.children('.' + params.slideClass + ':not(.' + params.slideDuplicateClass + ')[data-swiper-slide-index="' + realIndex + '"]').addClass(params.slideDuplicateActiveClass);
      } else {
        $wrapperEl.children('.' + params.slideClass + '.' + params.slideDuplicateClass + '[data-swiper-slide-index="' + realIndex + '"]').addClass(params.slideDuplicateActiveClass);
      }
    }
    // Next Slide
    var nextSlide = activeSlide.nextAll('.' + params.slideClass).eq(0).addClass(params.slideNextClass);
    if (params.loop && nextSlide.length === 0) {
      nextSlide = slides.eq(0);
      nextSlide.addClass(params.slideNextClass);
    }
    // Prev Slide
    var prevSlide = activeSlide.prevAll('.' + params.slideClass).eq(0).addClass(params.slidePrevClass);
    if (params.loop && prevSlide.length === 0) {
      prevSlide = slides.eq(-1);
      prevSlide.addClass(params.slidePrevClass);
    }
    if (params.loop) {
      // Duplicate to all looped slides
      if (nextSlide.hasClass(params.slideDuplicateClass)) {
        $wrapperEl.children('.' + params.slideClass + ':not(.' + params.slideDuplicateClass + ')[data-swiper-slide-index="' + nextSlide.attr('data-swiper-slide-index') + '"]').addClass(params.slideDuplicateNextClass);
      } else {
        $wrapperEl.children('.' + params.slideClass + '.' + params.slideDuplicateClass + '[data-swiper-slide-index="' + nextSlide.attr('data-swiper-slide-index') + '"]').addClass(params.slideDuplicateNextClass);
      }
      if (prevSlide.hasClass(params.slideDuplicateClass)) {
        $wrapperEl.children('.' + params.slideClass + ':not(.' + params.slideDuplicateClass + ')[data-swiper-slide-index="' + prevSlide.attr('data-swiper-slide-index') + '"]').addClass(params.slideDuplicatePrevClass);
      } else {
        $wrapperEl.children('.' + params.slideClass + '.' + params.slideDuplicateClass + '[data-swiper-slide-index="' + prevSlide.attr('data-swiper-slide-index') + '"]').addClass(params.slideDuplicatePrevClass);
      }
    }
  };

  var updateActiveIndex = function updateActiveIndex(newActiveIndex) {
    var swiper = this;
    var translate = swiper.rtl ? swiper.translate : -swiper.translate;
    var slidesGrid = swiper.slidesGrid,
        snapGrid = swiper.snapGrid,
        params = swiper.params,
        previousIndex = swiper.activeIndex,
        previousRealIndex = swiper.realIndex,
        previousSnapIndex = swiper.snapIndex;

    var activeIndex = newActiveIndex;
    var snapIndex = void 0;
    if (typeof activeIndex === 'undefined') {
      for (var i = 0; i < slidesGrid.length; i += 1) {
        if (typeof slidesGrid[i + 1] !== 'undefined') {
          if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
            activeIndex = i;
          } else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
            activeIndex = i + 1;
          }
        } else if (translate >= slidesGrid[i]) {
          activeIndex = i;
        }
      }
      // Normalize slideIndex
      if (params.normalizeSlideIndex) {
        if (activeIndex < 0 || typeof activeIndex === 'undefined') activeIndex = 0;
      }
    }
    if (snapGrid.indexOf(translate) >= 0) {
      snapIndex = snapGrid.indexOf(translate);
    } else {
      snapIndex = Math.floor(activeIndex / params.slidesPerGroup);
    }
    if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
    if (activeIndex === previousIndex) {
      if (snapIndex !== previousSnapIndex) {
        swiper.snapIndex = snapIndex;
        swiper.emit('snapIndexChange');
      }
      return;
    }

    // Get real index
    var realIndex = parseInt(swiper.slides.eq(activeIndex).attr('data-swiper-slide-index') || activeIndex, 10);

    Utils.extend(swiper, {
      snapIndex: snapIndex,
      realIndex: realIndex,
      previousIndex: previousIndex,
      activeIndex: activeIndex
    });
    swiper.emit('activeIndexChange');
    swiper.emit('snapIndexChange');
    if (previousRealIndex !== realIndex) {
      swiper.emit('realIndexChange');
    }
    swiper.emit('slideChange');
  };

  var updateClickedSlide = function updateClickedSlide(e) {
    var swiper = this;
    var params = swiper.params;
    var slide = $(e.target).closest('.' + params.slideClass)[0];
    var slideFound = false;
    if (slide) {
      for (var i = 0; i < swiper.slides.length; i += 1) {
        if (swiper.slides[i] === slide) slideFound = true;
      }
    }

    if (slide && slideFound) {
      swiper.clickedSlide = slide;
      if (swiper.virtual && swiper.params.virtual.enabled) {
        swiper.clickedIndex = parseInt($(slide).attr('data-swiper-slide-index'), 10);
      } else {
        swiper.clickedIndex = $(slide).index();
      }
    } else {
      swiper.clickedSlide = undefined;
      swiper.clickedIndex = undefined;
      return;
    }
    if (params.slideToClickedSlide && swiper.clickedIndex !== undefined && swiper.clickedIndex !== swiper.activeIndex) {
      swiper.slideToClickedSlide();
    }
  };

  var update = {
    updateSize: updateSize,
    updateSlides: updateSlides,
    updateAutoHeight: updateAutoHeight,
    updateSlidesOffset: updateSlidesOffset,
    updateSlidesProgress: updateSlidesProgress,
    updateProgress: updateProgress,
    updateSlidesClasses: updateSlidesClasses,
    updateActiveIndex: updateActiveIndex,
    updateClickedSlide: updateClickedSlide
  };

  var getTranslate = function getTranslate() {
    var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.isHorizontal() ? 'x' : 'y';

    var swiper = this;

    var params = swiper.params,
        rtl = swiper.rtl,
        translate = swiper.translate,
        $wrapperEl = swiper.$wrapperEl;


    if (params.virtualTranslate) {
      return rtl ? -translate : translate;
    }

    var currentTranslate = Utils.getTranslate($wrapperEl[0], axis);
    if (rtl) currentTranslate = -currentTranslate;

    return currentTranslate || 0;
  };

  var setTranslate = function setTranslate(translate, byController) {
    var swiper = this;
    var rtl = swiper.rtl,
        params = swiper.params,
        $wrapperEl = swiper.$wrapperEl,
        progress = swiper.progress;

    var x = 0;
    var y = 0;
    var z = 0;

    if (swiper.isHorizontal()) {
      x = rtl ? -translate : translate;
    } else {
      y = translate;
    }

    if (params.roundLengths) {
      x = Math.floor(x);
      y = Math.floor(y);
    }

    if (!params.virtualTranslate) {
      if (Support.transforms3d) $wrapperEl.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');else $wrapperEl.transform('translate(' + x + 'px, ' + y + 'px)');
    }

    swiper.translate = swiper.isHorizontal() ? x : y;

    // Check if we need to update progress
    var newProgress = void 0;
    var translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
    if (translatesDiff === 0) {
      newProgress = 0;
    } else {
      newProgress = (translate - swiper.minTranslate()) / translatesDiff;
    }
    if (newProgress !== progress) {
      swiper.updateProgress(translate);
    }

    swiper.emit('setTranslate', swiper.translate, byController);
  };

  var minTranslate = function minTranslate() {
    return -this.snapGrid[0];
  };

  var maxTranslate = function maxTranslate() {
    return -this.snapGrid[this.snapGrid.length - 1];
  };

  var translate = {
    getTranslate: getTranslate,
    setTranslate: setTranslate,
    minTranslate: minTranslate,
    maxTranslate: maxTranslate
  };

  var setTransition = function setTransition(duration, byController) {
    var swiper = this;

    swiper.$wrapperEl.transition(duration);

    swiper.emit('setTransition', duration, byController);
  };

  var transitionStart = function transitionStart() {
    var runCallbacks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    var swiper = this;
    var activeIndex = swiper.activeIndex,
        params = swiper.params,
        previousIndex = swiper.previousIndex;

    if (params.autoHeight) {
      swiper.updateAutoHeight();
    }
    swiper.emit('transitionStart');

    if (!runCallbacks) return;
    if (activeIndex !== previousIndex) {
      swiper.emit('slideChangeTransitionStart');
      if (activeIndex > previousIndex) {
        swiper.emit('slideNextTransitionStart');
      } else {
        swiper.emit('slidePrevTransitionStart');
      }
    }
  };

  var transitionEnd$1 = function transitionEnd$1() {
    var runCallbacks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    var swiper = this;
    var activeIndex = swiper.activeIndex,
        previousIndex = swiper.previousIndex;

    swiper.animating = false;
    swiper.setTransition(0);

    swiper.emit('transitionEnd');
    if (runCallbacks) {
      if (activeIndex !== previousIndex) {
        swiper.emit('slideChangeTransitionEnd');
        if (activeIndex > previousIndex) {
          swiper.emit('slideNextTransitionEnd');
        } else {
          swiper.emit('slidePrevTransitionEnd');
        }
      }
    }
  };

  var transition$1 = {
    setTransition: setTransition,
    transitionStart: transitionStart,
    transitionEnd: transitionEnd$1
  };

  var Browser = function Browser() {
    function isIE9() {
      // create temporary DIV
      var div = doc.createElement('div');
      // add content to tmp DIV which is wrapped into the IE HTML conditional statement
      div.innerHTML = '<!--[if lte IE 9]><i></i><![endif]-->';
      // return true / false value based on what will browser render
      return div.getElementsByTagName('i').length === 1;
    }
    function isSafari() {
      var ua = win.navigator.userAgent.toLowerCase();
      return ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0;
    }
    return {
      isSafari: isSafari(),
      isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(win.navigator.userAgent),
      ie: win.navigator.pointerEnabled || win.navigator.msPointerEnabled,
      ieTouch: win.navigator.msPointerEnabled && win.navigator.msMaxTouchPoints > 1 || win.navigator.pointerEnabled && win.navigator.maxTouchPoints > 1,
      lteIE9: isIE9()
    };
  }();

  var slideTo = function slideTo() {
    var index$$1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var speed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.params.speed;
    var runCallbacks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var internal = arguments[3];

    var swiper = this;
    var slideIndex = index$$1;
    if (slideIndex < 0) slideIndex = 0;

    var params = swiper.params,
        snapGrid = swiper.snapGrid,
        slidesGrid = swiper.slidesGrid,
        previousIndex = swiper.previousIndex,
        activeIndex = swiper.activeIndex,
        rtl = swiper.rtl,
        $wrapperEl = swiper.$wrapperEl;


    var snapIndex = Math.floor(slideIndex / params.slidesPerGroup);
    if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;

    if ((activeIndex || params.initialSlide || 0) === (previousIndex || 0) && runCallbacks) {
      swiper.emit('beforeSlideChangeStart');
    }

    var translate = -snapGrid[snapIndex];

    // Update progress
    swiper.updateProgress(translate);

    // Normalize slideIndex
    if (params.normalizeSlideIndex) {
      for (var i = 0; i < slidesGrid.length; i += 1) {
        if (-Math.floor(translate * 100) >= Math.floor(slidesGrid[i] * 100)) {
          slideIndex = i;
        }
      }
    }

    // Directions locks
    if (!swiper.allowSlideNext && translate < swiper.translate && translate < swiper.minTranslate()) {
      return false;
    }
    if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
      if ((activeIndex || 0) !== slideIndex) return false;
    }

    // Update Index
    if (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate) {
      swiper.updateActiveIndex(slideIndex);
      // Update Height
      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }
      swiper.updateSlidesClasses();
      if (params.effect !== 'slide') {
        swiper.setTranslate(translate);
      }
      return false;
    }

    if (speed === 0 || Browser.lteIE9) {
      swiper.setTransition(0);
      swiper.setTranslate(translate);
      swiper.updateActiveIndex(slideIndex);
      swiper.updateSlidesClasses();
      swiper.emit('beforeTransitionStart', speed, internal);
      swiper.transitionStart(runCallbacks);
      swiper.transitionEnd(runCallbacks);
    } else {
      swiper.setTransition(speed);
      swiper.setTranslate(translate);
      swiper.updateActiveIndex(slideIndex);
      swiper.updateSlidesClasses();
      swiper.emit('beforeTransitionStart', speed, internal);
      swiper.transitionStart(runCallbacks);
      if (!swiper.animating) {
        swiper.animating = true;
        $wrapperEl.transitionEnd(function () {
          if (!swiper || swiper.destroyed) return;
          swiper.transitionEnd(runCallbacks);
        });
      }
    }

    return true;
  };

  /* eslint no-unused-vars: "off" */
  var slideNext = function slideNext() {
    var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.params.speed;
    var runCallbacks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var internal = arguments[2];

    var swiper = this;
    var params = swiper.params,
        animating = swiper.animating;

    if (params.loop) {
      if (animating) return false;
      swiper.loopFix();
      // eslint-disable-next-line
      swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
      return swiper.slideTo(swiper.activeIndex + params.slidesPerGroup, speed, runCallbacks, internal);
    }
    return swiper.slideTo(swiper.activeIndex + params.slidesPerGroup, speed, runCallbacks, internal);
  };

  /* eslint no-unused-vars: "off" */
  var slidePrev = function slidePrev() {
    var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.params.speed;
    var runCallbacks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var internal = arguments[2];

    var swiper = this;
    var params = swiper.params,
        animating = swiper.animating;


    if (params.loop) {
      if (animating) return false;
      swiper.loopFix();
      // eslint-disable-next-line
      swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
      return swiper.slideTo(swiper.activeIndex - 1, speed, runCallbacks, internal);
    }
    return swiper.slideTo(swiper.activeIndex - 1, speed, runCallbacks, internal);
  };

  /* eslint no-unused-vars: "off" */
  var slideReset = function slideReset() {
    var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.params.speed;
    var runCallbacks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var internal = arguments[2];

    var swiper = this;
    return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
  };

  var slideToClickedSlide = function slideToClickedSlide() {
    var swiper = this;
    var params = swiper.params,
        $wrapperEl = swiper.$wrapperEl;


    var slidesPerView = params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : params.slidesPerView;
    var slideToIndex = swiper.clickedIndex;
    var realIndex = void 0;
    if (params.loop) {
      if (swiper.animating) return;
      realIndex = parseInt($(swiper.clickedSlide).attr('data-swiper-slide-index'), 10);
      if (params.centeredSlides) {
        if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
          swiper.loopFix();
          slideToIndex = $wrapperEl.children('.' + params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]:not(.' + params.slideDuplicateClass + ')').eq(0).index();

          Utils.nextTick(function () {
            swiper.slideTo(slideToIndex);
          });
        } else {
          swiper.slideTo(slideToIndex);
        }
      } else if (slideToIndex > swiper.slides.length - slidesPerView) {
        swiper.loopFix();
        slideToIndex = $wrapperEl.children('.' + params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]:not(.' + params.slideDuplicateClass + ')').eq(0).index();

        Utils.nextTick(function () {
          swiper.slideTo(slideToIndex);
        });
      } else {
        swiper.slideTo(slideToIndex);
      }
    } else {
      swiper.slideTo(slideToIndex);
    }
  };

  var slide = {
    slideTo: slideTo,
    slideNext: slideNext,
    slidePrev: slidePrev,
    slideReset: slideReset,
    slideToClickedSlide: slideToClickedSlide
  };

  var loopCreate = function loopCreate() {
    var swiper = this;
    var params = swiper.params,
        $wrapperEl = swiper.$wrapperEl;
    // Remove duplicated slides

    $wrapperEl.children('.' + params.slideClass + '.' + params.slideDuplicateClass).remove();

    var slides = $wrapperEl.children('.' + params.slideClass);

    if (params.loopFillGroupWithBlank) {
      var blankSlidesNum = params.slidesPerGroup - slides.length % params.slidesPerGroup;
      if (blankSlidesNum !== params.slidesPerGroup) {
        for (var i = 0; i < blankSlidesNum; i += 1) {
          var blankNode = $(doc.createElement('div')).addClass(params.slideClass + ' ' + params.slideBlankClass);
          $wrapperEl.append(blankNode);
        }
        slides = $wrapperEl.children('.' + params.slideClass);
      }
    }

    if (params.slidesPerView === 'auto' && !params.loopedSlides) params.loopedSlides = slides.length;

    swiper.loopedSlides = parseInt(params.loopedSlides || params.slidesPerView, 10);
    swiper.loopedSlides += params.loopAdditionalSlides;
    if (swiper.loopedSlides > slides.length) {
      swiper.loopedSlides = slides.length;
    }

    var prependSlides = [];
    var appendSlides = [];
    slides.each(function (index$$1, el) {
      var slide = $(el);
      if (index$$1 < swiper.loopedSlides) appendSlides.push(el);
      if (index$$1 < slides.length && index$$1 >= slides.length - swiper.loopedSlides) prependSlides.push(el);
      slide.attr('data-swiper-slide-index', index$$1);
    });
    for (var _i3 = 0; _i3 < appendSlides.length; _i3 += 1) {
      $wrapperEl.append($(appendSlides[_i3].cloneNode(true)).addClass(params.slideDuplicateClass));
    }
    for (var _i4 = prependSlides.length - 1; _i4 >= 0; _i4 -= 1) {
      $wrapperEl.prepend($(prependSlides[_i4].cloneNode(true)).addClass(params.slideDuplicateClass));
    }
  };

  var loopFix = function loopFix() {
    var swiper = this;
    var params = swiper.params,
        activeIndex = swiper.activeIndex,
        slides = swiper.slides,
        loopedSlides = swiper.loopedSlides,
        allowSlidePrev = swiper.allowSlidePrev,
        allowSlideNext = swiper.allowSlideNext;

    var newIndex = void 0;
    swiper.allowSlidePrev = true;
    swiper.allowSlideNext = true;
    // Fix For Negative Oversliding
    if (activeIndex < loopedSlides) {
      newIndex = slides.length - loopedSlides * 3 + activeIndex;
      newIndex += loopedSlides;
      swiper.slideTo(newIndex, 0, false, true);
    } else if (params.slidesPerView === 'auto' && activeIndex >= loopedSlides * 2 || activeIndex > slides.length - params.slidesPerView * 2) {
      // Fix For Positive Oversliding
      newIndex = -slides.length + activeIndex + loopedSlides;
      newIndex += loopedSlides;
      swiper.slideTo(newIndex, 0, false, true);
    }
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
  };

  var loopDestroy = function loopDestroy() {
    var swiper = this;
    var $wrapperEl = swiper.$wrapperEl,
        params = swiper.params,
        slides = swiper.slides;

    $wrapperEl.children('.' + params.slideClass + '.' + params.slideDuplicateClass).remove();
    slides.removeAttr('data-swiper-slide-index');
  };

  var loop = {
    loopCreate: loopCreate,
    loopFix: loopFix,
    loopDestroy: loopDestroy
  };

  var setGrabCursor = function setGrabCursor(moving) {
    var swiper = this;
    if (Support.touch || !swiper.params.simulateTouch) return;
    var el = swiper.el;
    el.style.cursor = 'move';
    el.style.cursor = moving ? '-webkit-grabbing' : '-webkit-grab';
    el.style.cursor = moving ? '-moz-grabbin' : '-moz-grab';
    el.style.cursor = moving ? 'grabbing' : 'grab';
  };

  var unsetGrabCursor = function unsetGrabCursor() {
    var swiper = this;
    if (Support.touch) return;
    swiper.el.style.cursor = '';
  };

  var grabCursor = {
    setGrabCursor: setGrabCursor,
    unsetGrabCursor: unsetGrabCursor
  };

  var appendSlide = function appendSlide(slides) {
    var swiper = this;
    var $wrapperEl = swiper.$wrapperEl,
        params = swiper.params;

    if (params.loop) {
      swiper.loopDestroy();
    }
    if ((typeof slides === 'undefined' ? 'undefined' : _typeof(slides)) === 'object' && 'length' in slides) {
      for (var i = 0; i < slides.length; i += 1) {
        if (slides[i]) $wrapperEl.append(slides[i]);
      }
    } else {
      $wrapperEl.append(slides);
    }
    if (params.loop) {
      swiper.loopCreate();
    }
    if (!(params.observer && Support.observer)) {
      swiper.update();
    }
  };

  var prependSlide = function prependSlide(slides) {
    var swiper = this;
    var params = swiper.params,
        $wrapperEl = swiper.$wrapperEl,
        activeIndex = swiper.activeIndex;


    if (params.loop) {
      swiper.loopDestroy();
    }
    var newActiveIndex = activeIndex + 1;
    if ((typeof slides === 'undefined' ? 'undefined' : _typeof(slides)) === 'object' && 'length' in slides) {
      for (var i = 0; i < slides.length; i += 1) {
        if (slides[i]) $wrapperEl.prepend(slides[i]);
      }
      newActiveIndex = activeIndex + slides.length;
    } else {
      $wrapperEl.prepend(slides);
    }
    if (params.loop) {
      swiper.loopCreate();
    }
    if (!(params.observer && Support.observer)) {
      swiper.update();
    }
    swiper.slideTo(newActiveIndex, 0, false);
  };

  var removeSlide = function removeSlide(slidesIndexes) {
    var swiper = this;
    var params = swiper.params,
        $wrapperEl = swiper.$wrapperEl,
        activeIndex = swiper.activeIndex;


    if (params.loop) {
      swiper.loopDestroy();
      swiper.slides = $wrapperEl.children('.' + params.slideClass);
    }
    var newActiveIndex = activeIndex;
    var indexToRemove = void 0;

    if ((typeof slidesIndexes === 'undefined' ? 'undefined' : _typeof(slidesIndexes)) === 'object' && 'length' in slidesIndexes) {
      for (var i = 0; i < slidesIndexes.length; i += 1) {
        indexToRemove = slidesIndexes[i];
        if (swiper.slides[indexToRemove]) swiper.slides.eq(indexToRemove).remove();
        if (indexToRemove < newActiveIndex) newActiveIndex -= 1;
      }
      newActiveIndex = Math.max(newActiveIndex, 0);
    } else {
      indexToRemove = slidesIndexes;
      if (swiper.slides[indexToRemove]) swiper.slides.eq(indexToRemove).remove();
      if (indexToRemove < newActiveIndex) newActiveIndex -= 1;
      newActiveIndex = Math.max(newActiveIndex, 0);
    }

    if (params.loop) {
      swiper.loopCreate();
    }

    if (!(params.observer && Support.observer)) {
      swiper.update();
    }
    if (params.loop) {
      swiper.slideTo(newActiveIndex + swiper.loopedSlides, 0, false);
    } else {
      swiper.slideTo(newActiveIndex, 0, false);
    }
  };

  var removeAllSlides = function removeAllSlides() {
    var swiper = this;

    var slidesIndexes = [];
    for (var i = 0; i < swiper.slides.length; i += 1) {
      slidesIndexes.push(i);
    }
    swiper.removeSlide(slidesIndexes);
  };

  var manipulation = {
    appendSlide: appendSlide,
    prependSlide: prependSlide,
    removeSlide: removeSlide,
    removeAllSlides: removeAllSlides
  };

  var Device = function Device() {
    var ua = win.navigator.userAgent;

    var device = {
      ios: false,
      android: false,
      androidChrome: false,
      desktop: false,
      windows: false,
      iphone: false,
      ipod: false,
      ipad: false,
      cordova: win.cordova || win.phonegap,
      phonegap: win.cordova || win.phonegap
    };

    var windows = ua.match(/(Windows Phone);?[\s\/]+([\d.]+)?/); // eslint-disable-line
    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
    var iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);

    // Windows
    if (windows) {
      device.os = 'windows';
      device.osVersion = windows[2];
      device.windows = true;
    }
    // Android
    if (android && !windows) {
      device.os = 'android';
      device.osVersion = android[2];
      device.android = true;
      device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
    }
    if (ipad || iphone || ipod) {
      device.os = 'ios';
      device.ios = true;
    }
    // iOS
    if (iphone && !ipod) {
      device.osVersion = iphone[2].replace(/_/g, '.');
      device.iphone = true;
    }
    if (ipad) {
      device.osVersion = ipad[2].replace(/_/g, '.');
      device.ipad = true;
    }
    if (ipod) {
      device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
      device.iphone = true;
    }
    // iOS 8+ changed UA
    if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
      if (device.osVersion.split('.')[0] === '10') {
        device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
      }
    }

    // Desktop
    device.desktop = !(device.os || device.android || device.webView);

    // Webview
    device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

    // Minimal UI
    if (device.os && device.os === 'ios') {
      var osVersionArr = device.osVersion.split('.');
      var metaViewport = doc.querySelector('meta[name="viewport"]');
      device.minimalUi = !device.webView && (ipod || iphone) && (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) && metaViewport && metaViewport.getAttribute('content').indexOf('minimal-ui') >= 0;
    }

    // Pixel Ratio
    device.pixelRatio = win.devicePixelRatio || 1;

    // Export object
    return device;
  }();

  var onTouchStart = function onTouchStart(event) {
    var swiper = this;
    var data$$1 = swiper.touchEventsData;
    var params = swiper.params,
        touches = swiper.touches;

    var e = event;
    if (e.originalEvent) e = e.originalEvent;
    data$$1.isTouchEvent = e.type === 'touchstart';
    if (!data$$1.isTouchEvent && 'which' in e && e.which === 3) return;
    if (data$$1.isTouched && data$$1.isMoved) return;
    if (params.noSwiping && $(e.target).closest('.' + params.noSwipingClass)[0]) {
      swiper.allowClick = true;
      return;
    }
    if (params.swipeHandler) {
      if (!$(e).closest(params.swipeHandler)[0]) return;
    }

    touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
    touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
    var startX = touches.currentX;
    var startY = touches.currentY;

    // Do NOT start if iOS edge swipe is detected. Otherwise iOS app (UIWebView) cannot swipe-to-go-back anymore

    if (Device.ios && !Device.cordova && params.iOSEdgeSwipeDetection && startX <= params.iOSEdgeSwipeThreshold && startX >= window.screen.width - params.iOSEdgeSwipeThreshold) {
      return;
    }

    Utils.extend(data$$1, {
      isTouched: true,
      isMoved: false,
      allowTouchCallbacks: true,
      isScrolling: undefined,
      startMoving: undefined
    });

    touches.startX = startX;
    touches.startY = startY;
    data$$1.touchStartTime = Utils.now();
    swiper.allowClick = true;
    swiper.updateSize();
    swiper.swipeDirection = undefined;
    if (params.threshold > 0) data$$1.allowThresholdMove = false;
    if (e.type !== 'touchstart') {
      var preventDefault = true;
      if ($(e.target).is(data$$1.formElements)) preventDefault = false;
      if (doc.activeElement && $(doc.activeElement).is(data$$1.formElements)) {
        doc.activeElement.blur();
      }
      if (preventDefault && swiper.allowTouchMove) {
        e.preventDefault();
      }
    }
    swiper.emit('touchStart', e);
  };

  var onTouchMove = function onTouchMove(event) {
    var swiper = this;
    var data$$1 = swiper.touchEventsData;
    var params = swiper.params,
        touches = swiper.touches,
        rtl = swiper.rtl;

    var e = event;
    if (e.originalEvent) e = e.originalEvent;
    if (data$$1.isTouchEvent && e.type === 'mousemove') return;
    var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
    var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
    if (e.preventedByNestedSwiper) {
      touches.startX = pageX;
      touches.startY = pageY;
      return;
    }
    if (!swiper.allowTouchMove) {
      // isMoved = true;
      swiper.allowClick = false;
      if (data$$1.isTouched) {
        Utils.extend(touches, {
          startX: pageX,
          startY: pageY,
          currentX: pageX,
          currentY: pageY
        });
        data$$1.touchStartTime = Utils.now();
      }
      return;
    }
    if (data$$1.isTouchEvent && params.touchReleaseOnEdges && !params.loop) {
      if (swiper.isVertical()) {
        // Vertical
        if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
          data$$1.isTouched = false;
          data$$1.isMoved = false;
          return;
        }
      } else if (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate()) {
        return;
      }
    }
    if (data$$1.isTouchEvent && doc.activeElement) {
      if (e.target === doc.activeElement && $(e.target).is(data$$1.formElements)) {
        data$$1.isMoved = true;
        swiper.allowClick = false;
        return;
      }
    }
    if (data$$1.allowTouchCallbacks) {
      swiper.emit('touchMove', e);
    }
    if (e.targetTouches && e.targetTouches.length > 1) return;

    touches.currentX = pageX;
    touches.currentY = pageY;

    var diffX = touches.currentX - touches.startX;
    var diffY = touches.currentY - touches.startY;

    if (typeof data$$1.isScrolling === 'undefined') {
      var touchAngle = void 0;
      if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
        data$$1.isScrolling = false;
      } else {
        // eslint-disable-next-line
        if (diffX * diffX + diffY * diffY >= 25) {
          touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
          data$$1.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
        }
      }
    }
    if (data$$1.isScrolling) {
      swiper.emit('touchMoveOpposite', e);
    }
    if (typeof startMoving === 'undefined') {
      if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
        data$$1.startMoving = true;
      }
    }
    if (!data$$1.isTouched) return;
    if (data$$1.isScrolling) {
      data$$1.isTouched = false;
      return;
    }
    if (!data$$1.startMoving) {
      return;
    }
    swiper.allowClick = false;
    e.preventDefault();
    if (params.touchMoveStopPropagation && !params.nested) {
      e.stopPropagation();
    }

    if (!data$$1.isMoved) {
      if (params.loop) {
        swiper.loopFix();
      }
      data$$1.startTranslate = swiper.getTranslate();
      swiper.setTransition(0);
      if (swiper.animating) {
        swiper.$wrapperEl.trigger('webkitTransitionEnd transitionend');
      }
      data$$1.allowMomentumBounce = false;
      // Grab Cursor
      if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
        swiper.setGrabCursor(true);
      }
      swiper.emit('sliderFirstMove', e);
    }
    swiper.emit('sliderMove', e);
    data$$1.isMoved = true;

    var diff = swiper.isHorizontal() ? diffX : diffY;
    touches.diff = diff;

    diff *= params.touchRatio;
    if (rtl) diff = -diff;

    swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
    data$$1.currentTranslate = diff + data$$1.startTranslate;

    var disableParentSwiper = true;
    var resistanceRatio = params.resistanceRatio;
    if (params.touchReleaseOnEdges) {
      resistanceRatio = 0;
    }
    if (diff > 0 && data$$1.currentTranslate > swiper.minTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) data$$1.currentTranslate = swiper.minTranslate() - 1 + Math.pow(-swiper.minTranslate() + data$$1.startTranslate + diff, resistanceRatio);
    } else if (diff < 0 && data$$1.currentTranslate < swiper.maxTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) data$$1.currentTranslate = swiper.maxTranslate() + 1 - Math.pow(swiper.maxTranslate() - data$$1.startTranslate - diff, resistanceRatio);
    }

    if (disableParentSwiper) {
      e.preventedByNestedSwiper = true;
    }

    // Directions locks
    if (!swiper.allowSlideNext && swiper.swipeDirection === 'next' && data$$1.currentTranslate < data$$1.startTranslate) {
      data$$1.currentTranslate = data$$1.startTranslate;
    }
    if (!swiper.allowSlidePrev && swiper.swipeDirection === 'prev' && data$$1.currentTranslate > data$$1.startTranslate) {
      data$$1.currentTranslate = data$$1.startTranslate;
    }

    // Threshold
    if (params.threshold > 0) {
      if (Math.abs(diff) > params.threshold || data$$1.allowThresholdMove) {
        if (!data$$1.allowThresholdMove) {
          data$$1.allowThresholdMove = true;
          touches.startX = touches.currentX;
          touches.startY = touches.currentY;
          data$$1.currentTranslate = data$$1.startTranslate;
          touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
          return;
        }
      } else {
        data$$1.currentTranslate = data$$1.startTranslate;
        return;
      }
    }

    if (!params.followFinger) return;

    // Update active index in free mode
    if (params.freeMode || params.watchSlidesProgress || params.watchSlidesVisibility) {
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
    if (params.freeMode) {
      // Velocity
      if (data$$1.velocities.length === 0) {
        data$$1.velocities.push({
          position: touches[swiper.isHorizontal() ? 'startX' : 'startY'],
          time: data$$1.touchStartTime
        });
      }
      data$$1.velocities.push({
        position: touches[swiper.isHorizontal() ? 'currentX' : 'currentY'],
        time: Utils.now()
      });
    }
    // Update progress
    swiper.updateProgress(data$$1.currentTranslate);
    // Update translate
    swiper.setTranslate(data$$1.currentTranslate);
  };

  var onTouchEnd = function onTouchEnd(event) {
    var swiper = this;
    var data$$1 = swiper.touchEventsData;

    var params = swiper.params,
        touches = swiper.touches,
        rtl = swiper.rtl,
        $wrapperEl = swiper.$wrapperEl,
        slidesGrid = swiper.slidesGrid,
        snapGrid = swiper.snapGrid;

    var e = event;
    if (e.originalEvent) e = e.originalEvent;
    if (data$$1.allowTouchCallbacks) {
      swiper.emit('touchEnd', e);
    }
    data$$1.allowTouchCallbacks = false;
    if (!data$$1.isTouched) return;
    // Return Grab Cursor
    if (params.grabCursor && data$$1.isMoved && data$$1.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
      swiper.setGrabCursor(false);
    }

    // Time diff
    var touchEndTime = Utils.now();
    var timeDiff = touchEndTime - data$$1.touchStartTime;

    // Tap, doubleTap, Click
    if (swiper.allowClick) {
      swiper.updateClickedSlide(e);
      swiper.emit('tap', e);
      if (timeDiff < 300 && touchEndTime - data$$1.lastClickTime > 300) {
        if (data$$1.clickTimeout) clearTimeout(data$$1.clickTimeout);
        data$$1.clickTimeout = Utils.nextTick(function () {
          if (!swiper || swiper.destroyed) return;
          swiper.emit('click', e);
        }, 300);
      }
      if (timeDiff < 300 && touchEndTime - data$$1.lastClickTime < 300) {
        if (data$$1.clickTimeout) clearTimeout(data$$1.clickTimeout);
        swiper.emit('doubleTap', e);
      }
    }

    data$$1.lastClickTime = Utils.now();
    Utils.nextTick(function () {
      if (!swiper.destroyed) swiper.allowClick = true;
    });

    if (!data$$1.isTouched || !data$$1.isMoved || !swiper.swipeDirection || touches.diff === 0 || data$$1.currentTranslate === data$$1.startTranslate) {
      data$$1.isTouched = false;
      data$$1.isMoved = false;
      return;
    }
    data$$1.isTouched = false;
    data$$1.isMoved = false;

    var currentPos = void 0;
    if (params.followFinger) {
      currentPos = rtl ? swiper.translate : -swiper.translate;
    } else {
      currentPos = -data$$1.currentTranslate;
    }
    if (params.freeMode) {
      if (currentPos < -swiper.minTranslate()) {
        swiper.slideTo(swiper.activeIndex);
        return;
      } else if (currentPos > -swiper.maxTranslate()) {
        if (swiper.slides.length < snapGrid.length) {
          swiper.slideTo(snapGrid.length - 1);
        } else {
          swiper.slideTo(swiper.slides.length - 1);
        }
        return;
      }

      if (params.freeModeMomentum) {
        if (data$$1.velocities.length > 1) {
          var lastMoveEvent = data$$1.velocities.pop();
          var velocityEvent = data$$1.velocities.pop();

          var distance = lastMoveEvent.position - velocityEvent.position;
          var time = lastMoveEvent.time - velocityEvent.time;
          swiper.velocity = distance / time;
          swiper.velocity /= 2;
          if (Math.abs(swiper.velocity) < params.freeModeMinimumVelocity) {
            swiper.velocity = 0;
          }
          // this implies that the user stopped moving a finger then released.
          // There would be no events with distance zero, so the last event is stale.
          if (time > 150 || Utils.now() - lastMoveEvent.time > 300) {
            swiper.velocity = 0;
          }
        } else {
          swiper.velocity = 0;
        }
        swiper.velocity *= params.freeModeMomentumVelocityRatio;

        data$$1.velocities.length = 0;
        var momentumDuration = 1000 * params.freeModeMomentumRatio;
        var momentumDistance = swiper.velocity * momentumDuration;

        var newPosition = swiper.translate + momentumDistance;
        if (rtl) newPosition = -newPosition;
        var doBounce = false;
        var afterBouncePosition = void 0;
        var bounceAmount = Math.abs(swiper.velocity) * 20 * params.freeModeMomentumBounceRatio;
        if (newPosition < swiper.maxTranslate()) {
          if (params.freeModeMomentumBounce) {
            if (newPosition + swiper.maxTranslate() < -bounceAmount) {
              newPosition = swiper.maxTranslate() - bounceAmount;
            }
            afterBouncePosition = swiper.maxTranslate();
            doBounce = true;
            data$$1.allowMomentumBounce = true;
          } else {
            newPosition = swiper.maxTranslate();
          }
        } else if (newPosition > swiper.minTranslate()) {
          if (params.freeModeMomentumBounce) {
            if (newPosition - swiper.minTranslate() > bounceAmount) {
              newPosition = swiper.minTranslate() + bounceAmount;
            }
            afterBouncePosition = swiper.minTranslate();
            doBounce = true;
            data$$1.allowMomentumBounce = true;
          } else {
            newPosition = swiper.minTranslate();
          }
        } else if (params.freeModeSticky) {
          var nextSlide = void 0;
          for (var j = 0; j < snapGrid.length; j += 1) {
            if (snapGrid[j] > -newPosition) {
              nextSlide = j;
              break;
            }
          }
          if (Math.abs(snapGrid[nextSlide] - newPosition) < Math.abs(snapGrid[nextSlide - 1] - newPosition) || swiper.swipeDirection === 'next') {
            newPosition = snapGrid[nextSlide];
          } else {
            newPosition = snapGrid[nextSlide - 1];
          }
          newPosition = -newPosition;
        }
        // Fix duration
        if (swiper.velocity !== 0) {
          if (rtl) {
            momentumDuration = Math.abs((-newPosition - swiper.translate) / swiper.velocity);
          } else {
            momentumDuration = Math.abs((newPosition - swiper.translate) / swiper.velocity);
          }
        } else if (params.freeModeSticky) {
          swiper.slideReset();
          return;
        }

        if (params.freeModeMomentumBounce && doBounce) {
          swiper.updateProgress(afterBouncePosition);
          swiper.setTransition(momentumDuration);
          swiper.setTranslate(newPosition);
          swiper.transitionStart();
          swiper.animating = true;
          $wrapperEl.transitionEnd(function () {
            if (!swiper || swiper.destroyed || !data$$1.allowMomentumBounce) return;
            swiper.emit('momentumBounce');

            swiper.setTransition(params.speed);
            swiper.setTranslate(afterBouncePosition);
            $wrapperEl.transitionEnd(function () {
              if (!swiper || swiper.destroyed) return;
              swiper.transitionEnd();
            });
          });
        } else if (swiper.velocity) {
          swiper.updateProgress(newPosition);
          swiper.setTransition(momentumDuration);
          swiper.setTranslate(newPosition);
          swiper.transitionStart();
          if (!swiper.animating) {
            swiper.animating = true;
            $wrapperEl.transitionEnd(function () {
              if (!swiper || swiper.destroyed) return;
              swiper.transitionEnd();
            });
          }
        } else {
          swiper.updateProgress(newPosition);
        }

        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }
      if (!params.freeModeMomentum || timeDiff >= params.longSwipesMs) {
        swiper.updateProgress();
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }
      return;
    }

    // Find current slide
    var stopIndex = 0;
    var groupSize = swiper.slidesSizesGrid[0];
    for (var i = 0; i < slidesGrid.length; i += params.slidesPerGroup) {
      if (typeof slidesGrid[i + params.slidesPerGroup] !== 'undefined') {
        if (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + params.slidesPerGroup]) {
          stopIndex = i;
          groupSize = slidesGrid[i + params.slidesPerGroup] - slidesGrid[i];
        }
      } else if (currentPos >= slidesGrid[i]) {
        stopIndex = i;
        groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
      }
    }

    // Find current slide size
    var ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;

    if (timeDiff > params.longSwipesMs) {
      // Long touches
      if (!params.longSwipes) {
        swiper.slideTo(swiper.activeIndex);
        return;
      }
      if (swiper.swipeDirection === 'next') {
        if (ratio >= params.longSwipesRatio) swiper.slideTo(stopIndex + params.slidesPerGroup);else swiper.slideTo(stopIndex);
      }
      if (swiper.swipeDirection === 'prev') {
        if (ratio > 1 - params.longSwipesRatio) swiper.slideTo(stopIndex + params.slidesPerGroup);else swiper.slideTo(stopIndex);
      }
    } else {
      // Short swipes
      if (!params.shortSwipes) {
        swiper.slideTo(swiper.activeIndex);
        return;
      }
      if (swiper.swipeDirection === 'next') {
        swiper.slideTo(stopIndex + params.slidesPerGroup);
      }
      if (swiper.swipeDirection === 'prev') {
        swiper.slideTo(stopIndex);
      }
    }
  };

  var onResize = function onResize() {
    var swiper = this;

    var params = swiper.params,
        el = swiper.el;


    if (el && el.offsetWidth === 0) return;

    // Breakpoints
    if (params.breakpoints) {
      swiper.setBreakpoint();
    }

    // Save locks
    var allowSlideNext = swiper.allowSlideNext,
        allowSlidePrev = swiper.allowSlidePrev;

    // Disable locks on resize

    swiper.allowSlideNext = true;
    swiper.allowSlidePrev = true;

    swiper.updateSize();
    swiper.updateSlides();

    if (params.freeMode) {
      var newTranslate = Math.min(Math.max(swiper.translate, swiper.maxTranslate()), swiper.minTranslate());
      swiper.setTranslate(newTranslate);
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();

      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }
    } else {
      swiper.updateSlidesClasses();
      if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
        swiper.slideTo(swiper.slides.length - 1, 0, false, true);
      } else {
        swiper.slideTo(swiper.activeIndex, 0, false, true);
      }
    }
    // Return locks after resize
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
  };

  var onClick = function onClick(e) {
    var swiper = this;
    if (!swiper.allowClick) {
      if (swiper.params.preventClicks) e.preventDefault();
      if (swiper.params.preventClicksPropagation && swiper.animating) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
  };

  function attachEvents() {
    var swiper = this;

    var params = swiper.params,
        touchEvents = swiper.touchEvents,
        el = swiper.el,
        wrapperEl = swiper.wrapperEl;


    {
      swiper.onTouchStart = onTouchStart.bind(swiper);
      swiper.onTouchMove = onTouchMove.bind(swiper);
      swiper.onTouchEnd = onTouchEnd.bind(swiper);
    }

    swiper.onClick = onClick.bind(swiper);

    var target = params.touchEventsTarget === 'container' ? el : wrapperEl;
    var capture = !!params.nested;

    // Touch Events
    {
      if (Browser.ie) {
        target.addEventListener(touchEvents.start, swiper.onTouchStart, false);
        (Support.touch ? target : doc).addEventListener(touchEvents.move, swiper.onTouchMove, capture);
        (Support.touch ? target : doc).addEventListener(touchEvents.end, swiper.onTouchEnd, false);
      } else {
        if (Support.touch) {
          var passiveListener = touchEvents.start === 'touchstart' && Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
          target.addEventListener(touchEvents.start, swiper.onTouchStart, passiveListener);
          target.addEventListener(touchEvents.move, swiper.onTouchMove, Support.passiveListener ? { passive: false, capture: capture } : capture);
          target.addEventListener(touchEvents.end, swiper.onTouchEnd, passiveListener);
        }
        if (params.simulateTouch && !Device.ios && !Device.android || params.simulateTouch && !Support.touch && Device.ios) {
          target.addEventListener('mousedown', swiper.onTouchStart, false);
          doc.addEventListener('mousemove', swiper.onTouchMove, capture);
          doc.addEventListener('mouseup', swiper.onTouchEnd, false);
        }
      }
      // Prevent Links Clicks
      if (params.preventClicks || params.preventClicksPropagation) {
        target.addEventListener('click', swiper.onClick, true);
      }
    }

    // Resize handler
    swiper.on('resize observerUpdate', onResize);
  }

  function detachEvents() {
    var swiper = this;

    var params = swiper.params,
        touchEvents = swiper.touchEvents,
        el = swiper.el,
        wrapperEl = swiper.wrapperEl;


    var target = params.touchEventsTarget === 'container' ? el : wrapperEl;
    var capture = !!params.nested;

    // Touch Events
    {
      if (Browser.ie) {
        target.removeEventListener(touchEvents.start, swiper.onTouchStart, false);
        (Support.touch ? target : doc).removeEventListener(touchEvents.move, swiper.onTouchMove, capture);
        (Support.touch ? target : doc).removeEventListener(touchEvents.end, swiper.onTouchEnd, false);
      } else {
        if (Support.touch) {
          var passiveListener = touchEvents.start === 'onTouchStart' && Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
          target.removeEventListener(touchEvents.start, swiper.onTouchStart, passiveListener);
          target.removeEventListener(touchEvents.move, swiper.onTouchMove, capture);
          target.removeEventListener(touchEvents.end, swiper.onTouchEnd, passiveListener);
        }
        if (params.simulateTouch && !Device.ios && !Device.android || params.simulateTouch && !Support.touch && Device.ios) {
          target.removeEventListener('mousedown', swiper.onTouchStart, false);
          doc.removeEventListener('mousemove', swiper.onTouchMove, capture);
          doc.removeEventListener('mouseup', swiper.onTouchEnd, false);
        }
      }
      // Prevent Links Clicks
      if (params.preventClicks || params.preventClicksPropagation) {
        target.removeEventListener('click', swiper.onClick, true);
      }
    }

    // Resize handler
    swiper.off('resize observerUpdate', onResize);
  }

  var events = {
    attachEvents: attachEvents,
    detachEvents: detachEvents
  };

  var setBreakpoint = function setBreakpoint() {
    var swiper = this;
    var activeIndex = swiper.activeIndex,
        _swiper$loopedSlides = swiper.loopedSlides,
        loopedSlides = _swiper$loopedSlides === undefined ? 0 : _swiper$loopedSlides,
        params = swiper.params;

    var breakpoints = params.breakpoints;
    if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return;
    // Set breakpoint for window width and update parameters
    var breakpoint = swiper.getBreakpoint(breakpoints);
    if (breakpoint && swiper.currentBreakpoint !== breakpoint) {
      var breakPointsParams = breakpoint in breakpoints ? breakpoints[breakpoint] : swiper.originalParams;
      var needsReLoop = params.loop && breakPointsParams.slidesPerView !== params.slidesPerView;

      Utils.extend(swiper.params, breakPointsParams);

      Utils.extend(swiper, {
        allowTouchMove: swiper.params.allowTouchMove,
        allowSlideNext: swiper.params.allowSlideNext,
        allowSlidePrev: swiper.params.allowSlidePrev
      });

      swiper.currentBreakpoint = breakpoint;

      if (needsReLoop) {
        swiper.loopDestroy();
        swiper.loopCreate();
        swiper.updateSlides();
        swiper.slideTo(activeIndex - loopedSlides + swiper.loopedSlides, 0, false);
      }
      swiper.emit('breakpoint', breakPointsParams);
    }
  };

  var getBreakpoint = function getBreakpoint(breakpoints) {
    // Get breakpoint for window width
    if (!breakpoints) return undefined;
    var breakpoint = false;
    var points = [];
    Object.keys(breakpoints).forEach(function (point) {
      points.push(point);
    });
    points.sort(function (a, b) {
      return parseInt(a, 10) - parseInt(b, 10);
    });
    for (var i = 0; i < points.length; i += 1) {
      var point = points[i];
      if (point >= win.innerWidth && !breakpoint) {
        breakpoint = point;
      }
    }
    return breakpoint || 'max';
  };

  var breakpoints = { setBreakpoint: setBreakpoint, getBreakpoint: getBreakpoint };

  var addClasses = function addClasses() {
    var swiper = this;
    var classNames = swiper.classNames,
        params = swiper.params,
        rtl = swiper.rtl,
        $el = swiper.$el;

    var suffixes = [];

    suffixes.push(params.direction);

    if (params.freeMode) {
      suffixes.push('free-mode');
    }
    if (!Support.flexbox) {
      suffixes.push('no-flexbox');
    }
    if (params.autoHeight) {
      suffixes.push('autoheight');
    }
    if (rtl) {
      suffixes.push('rtl');
    }
    if (params.slidesPerColumn > 1) {
      suffixes.push('multirow');
    }
    if (Device.android) {
      suffixes.push('android');
    }
    if (Device.ios) {
      suffixes.push('ios');
    }
    // WP8 Touch Events Fix
    if (win.navigator.pointerEnabled || win.navigator.msPointerEnabled) {
      suffixes.push('wp8-' + params.direction);
    }

    suffixes.forEach(function (suffix) {
      classNames.push(params.containerModifierClass + suffix);
    });

    $el.addClass(classNames.join(' '));
  };

  var removeClasses = function removeClasses() {
    var swiper = this;
    var $el = swiper.$el,
        classNames = swiper.classNames;


    $el.removeClass(classNames.join(' '));
  };

  var classes = { addClasses: addClasses, removeClasses: removeClasses };

  var loadImage = function loadImage(imageEl, src, srcset, sizes, checkForComplete, callback) {
    var image = void 0;
    function onReady() {
      if (callback) callback();
    }
    if (!imageEl.complete || !checkForComplete) {
      if (src) {
        image = new win.Image();
        image.onload = onReady;
        image.onerror = onReady;
        if (sizes) {
          image.sizes = sizes;
        }
        if (srcset) {
          image.srcset = srcset;
        }
        if (src) {
          image.src = src;
        }
      } else {
        onReady();
      }
    } else {
      // image already loaded...
      onReady();
    }
  };

  var preloadImages = function preloadImages() {
    var swiper = this;
    swiper.imagesToLoad = swiper.$el.find('img');
    function onReady() {
      if (typeof swiper === 'undefined' || swiper === null || !swiper || swiper.destroyed) return;
      if (swiper.imagesLoaded !== undefined) swiper.imagesLoaded += 1;
      if (swiper.imagesLoaded === swiper.imagesToLoad.length) {
        if (swiper.params.updateOnImagesReady) swiper.update();
        swiper.emit('imagesReady');
      }
    }
    for (var i = 0; i < swiper.imagesToLoad.length; i += 1) {
      var imageEl = swiper.imagesToLoad[i];
      swiper.loadImage(imageEl, imageEl.currentSrc || imageEl.getAttribute('src'), imageEl.srcset || imageEl.getAttribute('srcset'), imageEl.sizes || imageEl.getAttribute('sizes'), true, onReady);
    }
  };

  var images = {
    loadImage: loadImage,
    preloadImages: preloadImages
  };

  var defaults = {
    init: true,
    direction: 'horizontal',
    touchEventsTarget: 'container',
    initialSlide: 0,
    speed: 300,

    // To support iOS's swipe-to-go-back gesture (when being used in-app, with UIWebView).
    iOSEdgeSwipeDetection: false,
    iOSEdgeSwipeThreshold: 20,

    // Free mode
    freeMode: false,
    freeModeMomentum: true,
    freeModeMomentumRatio: 1,
    freeModeMomentumBounce: true,
    freeModeMomentumBounceRatio: 1,
    freeModeMomentumVelocityRatio: 1,
    freeModeSticky: false,
    freeModeMinimumVelocity: 0.02,

    // Autoheight
    autoHeight: false,

    // Set wrapper width
    setWrapperSize: false,

    // Virtual Translate
    virtualTranslate: false,

    // Effects
    effect: 'slide', // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'

    // Breakpoints
    breakpoints: undefined,

    // Slides grid
    spaceBetween: 0,
    slidesPerView: 1,
    slidesPerColumn: 1,
    slidesPerColumnFill: 'column',
    slidesPerGroup: 1,
    centeredSlides: false,
    slidesOffsetBefore: 0, // in px
    slidesOffsetAfter: 0, // in px
    normalizeSlideIndex: true,

    // Round length
    roundLengths: false,

    // Touches
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: true,
    shortSwipes: true,
    longSwipes: true,
    longSwipesRatio: 0.5,
    longSwipesMs: 300,
    followFinger: true,
    allowTouchMove: true,
    threshold: 0,
    touchMoveStopPropagation: true,
    touchReleaseOnEdges: false,

    // Unique Navigation Elements
    uniqueNavElements: true,

    // Resistance
    resistance: true,
    resistanceRatio: 0.85,

    // Progress
    watchSlidesProgress: false,
    watchSlidesVisibility: false,

    // Cursor
    grabCursor: false,

    // Clicks
    preventClicks: true,
    preventClicksPropagation: true,
    slideToClickedSlide: false,

    // Images
    preloadImages: true,
    updateOnImagesReady: true,

    // loop
    loop: false,
    loopAdditionalSlides: 0,
    loopedSlides: null,
    loopFillGroupWithBlank: false,

    // Swiping/no swiping
    allowSlidePrev: true,
    allowSlideNext: true,
    swipeHandler: null, // '.swipe-handler',
    noSwiping: true,
    noSwipingClass: 'swiper-no-swiping',

    // Passive Listeners
    passiveListeners: true,

    // NS
    containerModifierClass: 'swiper-container-', // NEW
    slideClass: 'swiper-slide',
    slideBlankClass: 'swiper-slide-invisible-blank',
    slideActiveClass: 'swiper-slide-active',
    slideDuplicateActiveClass: 'swiper-slide-duplicate-active',
    slideVisibleClass: 'swiper-slide-visible',
    slideDuplicateClass: 'swiper-slide-duplicate',
    slideNextClass: 'swiper-slide-next',
    slideDuplicateNextClass: 'swiper-slide-duplicate-next',
    slidePrevClass: 'swiper-slide-prev',
    slideDuplicatePrevClass: 'swiper-slide-duplicate-prev',
    wrapperClass: 'swiper-wrapper',

    // Callbacks
    runCallbacksOnInit: true
  };

  var prototypes = {
    update: update,
    translate: translate,
    transition: transition$1,
    slide: slide,
    loop: loop,
    grabCursor: grabCursor,
    manipulation: manipulation,
    events: events,
    breakpoints: breakpoints,
    classes: classes,
    images: images
  };

  var extendedDefaults = {};

  var Swiper = function (_SwiperClass) {
    _inherits(Swiper, _SwiperClass);

    function Swiper() {
      var _ret3;

      _classCallCheck(this, Swiper);

      var el = void 0;
      var params = void 0;

      for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }

      if (args.length === 1 && args[0].constructor && args[0].constructor === Object) {
        params = args[0];
      } else {
        el = args[0];
        params = args[1];
      }
      if (!params) params = {};

      params = Utils.extend({}, params);
      if (el && !params.el) params.el = el;

      var _this5 = _possibleConstructorReturn(this, (Swiper.__proto__ || Object.getPrototypeOf(Swiper)).call(this, params));

      Object.keys(prototypes).forEach(function (prototypeGroup) {
        Object.keys(prototypes[prototypeGroup]).forEach(function (protoMethod) {
          if (!Swiper.prototype[protoMethod]) {
            Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
          }
        });
      });

      // Swiper Instance
      var swiper = _this5;
      if (typeof swiper.modules === 'undefined') {
        swiper.modules = {};
      }
      Object.keys(swiper.modules).forEach(function (moduleName) {
        var module = swiper.modules[moduleName];
        if (module.params) {
          var moduleParamName = Object.keys(module.params)[0];
          var moduleParams = module.params[moduleParamName];
          if ((typeof moduleParams === 'undefined' ? 'undefined' : _typeof(moduleParams)) !== 'object') return;
          if (!(moduleParamName in params && 'enabled' in moduleParams)) return;
          if (params[moduleParamName] === true) {
            params[moduleParamName] = { enabled: true };
          }
          if (_typeof(params[moduleParamName]) === 'object' && !('enabled' in params[moduleParamName])) {
            params[moduleParamName].enabled = true;
          }
          if (!params[moduleParamName]) params[moduleParamName] = { enabled: false };
        }
      });

      // Extend defaults with modules params
      var swiperParams = Utils.extend({}, defaults);
      swiper.useModulesParams(swiperParams);

      // Extend defaults with passed params
      swiper.params = Utils.extend({}, swiperParams, extendedDefaults, params);
      swiper.originalParams = Utils.extend({}, swiper.params);
      swiper.passedParams = Utils.extend({}, params);

      // Find el
      var $el = $(swiper.params.el);
      el = $el[0];

      if (!el) {
        var _ret;

        return _ret = undefined, _possibleConstructorReturn(_this5, _ret);
      }

      if ($el.length > 1) {
        var _ret2;

        var swipers = [];
        $el.each(function (index$$1, containerEl) {
          var newParams = Utils.extend({}, params, { el: containerEl });
          swipers.push(new Swiper(newParams));
        });
        return _ret2 = swipers, _possibleConstructorReturn(_this5, _ret2);
      }

      el.swiper = swiper;
      $el.data('swiper', swiper);

      // Find Wrapper
      var $wrapperEl = $el.children('.' + swiper.params.wrapperClass);

      // Extend Swiper
      Utils.extend(swiper, {
        $el: $el,
        el: el,
        $wrapperEl: $wrapperEl,
        wrapperEl: $wrapperEl[0],

        // Classes
        classNames: [],

        // Slides
        slides: $(),
        slidesGrid: [],
        snapGrid: [],
        slidesSizesGrid: [],

        // isDirection
        isHorizontal: function isHorizontal() {
          return swiper.params.direction === 'horizontal';
        },
        isVertical: function isVertical() {
          return swiper.params.direction === 'vertical';
        },

        // RTL
        rtl: swiper.params.direction === 'horizontal' && (el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl'),
        wrongRTL: $wrapperEl.css('display') === '-webkit-box',

        // Indexes
        activeIndex: 0,
        realIndex: 0,

        //
        isBeginning: true,
        isEnd: false,

        // Props
        translate: 0,
        progress: 0,
        velocity: 0,
        animating: false,

        // Locks
        allowSlideNext: swiper.params.allowSlideNext,
        allowSlidePrev: swiper.params.allowSlidePrev,

        // Touch Events
        touchEvents: function touchEvents() {
          var touch = ['touchstart', 'touchmove', 'touchend'];
          var desktop = ['mousedown', 'mousemove', 'mouseup'];
          if (win.navigator.pointerEnabled) {
            desktop = ['pointerdown', 'pointermove', 'pointerup'];
          } else if (win.navigator.msPointerEnabled) {
            desktop = ['MSPointerDown', 'MsPointerMove', 'MsPointerUp'];
          }

          return {
            start: Support.touch || !swiper.params.simulateTouch ? touch[0] : desktop[0],
            move: Support.touch || !swiper.params.simulateTouch ? touch[1] : desktop[1],
            end: Support.touch || !swiper.params.simulateTouch ? touch[2] : desktop[2]
          };
        }(),
        touchEventsData: {
          isTouched: undefined,
          isMoved: undefined,
          allowTouchCallbacks: undefined,
          touchStartTime: undefined,
          isScrolling: undefined,
          currentTranslate: undefined,
          startTranslate: undefined,
          allowThresholdMove: undefined,
          // Form elements to match
          formElements: 'input, select, option, textarea, button, video',
          // Last click time
          lastClickTime: Utils.now(),
          clickTimeout: undefined,
          // Velocities
          velocities: [],
          allowMomentumBounce: undefined,
          isTouchEvent: undefined,
          startMoving: undefined
        },

        // Clicks
        allowClick: true,

        // Touches
        allowTouchMove: swiper.params.allowTouchMove,

        touches: {
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          diff: 0
        },

        // Images
        imagesToLoad: [],
        imagesLoaded: 0

      });

      // Install Modules
      swiper.useModules();

      // Init
      if (swiper.params.init) {
        swiper.init();
      }

      // Return app instance
      return _ret3 = swiper, _possibleConstructorReturn(_this5, _ret3);
    }

    _createClass(Swiper, [{
      key: 'slidesPerViewDynamic',
      value: function slidesPerViewDynamic() {
        var swiper = this;
        var params = swiper.params,
            slides = swiper.slides,
            slidesGrid = swiper.slidesGrid,
            swiperSize = swiper.size,
            activeIndex = swiper.activeIndex;

        var spv = 1;
        if (params.centeredSlides) {
          var slideSize = slides[activeIndex].swiperSlideSize;
          var breakLoop = void 0;
          for (var i = activeIndex + 1; i < slides.length; i += 1) {
            if (slides[i] && !breakLoop) {
              slideSize += slides[i].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }
          for (var _i5 = activeIndex - 1; _i5 >= 0; _i5 -= 1) {
            if (slides[_i5] && !breakLoop) {
              slideSize += slides[_i5].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }
        } else {
          for (var _i6 = activeIndex + 1; _i6 < slides.length; _i6 += 1) {
            if (slidesGrid[_i6] - slidesGrid[activeIndex] < swiperSize) {
              spv += 1;
            }
          }
        }
        return spv;
      }
    }, {
      key: 'update',
      value: function update() {
        var swiper = this;
        if (!swiper || swiper.destroyed) return;
        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateProgress();
        swiper.updateSlidesClasses();

        var newTranslate = void 0;
        function setTranslate() {
          newTranslate = Math.min(Math.max(swiper.translate, swiper.maxTranslate()), swiper.minTranslate());
          swiper.setTranslate(newTranslate);
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        }
        var translated = void 0;
        if (swiper.params.freeMode) {
          setTranslate();
          if (swiper.params.autoHeight) {
            swiper.updateAutoHeight();
          }
        } else {
          if ((swiper.params.slidesPerView === 'auto' || swiper.params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
            translated = swiper.slideTo(swiper.slides.length - 1, 0, false, true);
          } else {
            translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
          }
          if (!translated) {
            setTranslate();
          }
        }
        swiper.emit('update');
      }
    }, {
      key: 'init',
      value: function init() {
        var swiper = this;
        if (swiper.initialized) return;

        swiper.emit('beforeInit');

        // Set breakpoint
        if (swiper.params.breakpoints) {
          swiper.setBreakpoint();
        }

        // Add Classes
        swiper.addClasses();

        // Create loop
        if (swiper.params.loop) {
          swiper.loopCreate();
        }

        // Update size
        swiper.updateSize();

        // Update slides
        swiper.updateSlides();

        // Set Grab Cursor
        if (swiper.params.grabCursor) {
          swiper.setGrabCursor();
        }

        if (swiper.params.preloadImages) {
          swiper.preloadImages();
        }

        // Slide To Initial Slide
        if (swiper.params.loop) {
          swiper.slideTo(swiper.params.initialSlide + swiper.loopedSlides, 0, swiper.params.runCallbacksOnInit);
        } else {
          swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit);
        }

        // Attach events
        swiper.attachEvents();

        // Init Flag
        swiper.initialized = true;

        // Emit
        swiper.emit('init');
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        var deleteInstance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var cleanStyles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        var swiper = this;
        var params = swiper.params,
            $el = swiper.$el,
            $wrapperEl = swiper.$wrapperEl,
            slides = swiper.slides;

        swiper.emit('beforeDestroy');

        // Init Flag
        swiper.initialized = false;

        // Detach events
        swiper.detachEvents();

        // Destroy loop
        if (params.loop) {
          swiper.loopDestroy();
        }

        // Cleanup styles
        if (cleanStyles) {
          swiper.removeClasses();
          $el.removeAttr('style');
          $wrapperEl.removeAttr('style');
          if (slides && slides.length) {
            slides.removeClass([params.slideVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass].join(' ')).removeAttr('style').removeAttr('data-swiper-slide-index').removeAttr('data-swiper-column').removeAttr('data-swiper-row');
          }
        }

        swiper.emit('destroy');

        // Detach emitter events
        Object.keys(swiper.eventsListeners).forEach(function (eventName) {
          swiper.off(eventName);
        });

        if (deleteInstance !== false) {
          swiper.$el[0].swiper = null;
          swiper.$el.data('swiper', null);
          Utils.deleteProps(swiper);
        }
        swiper.destroyed = true;
      }
    }], [{
      key: 'extendDefaults',
      value: function extendDefaults(newDefaults) {
        Utils.extend(extendedDefaults, newDefaults);
      }
    }, {
      key: 'extendedDefaults',
      get: function get() {
        return extendedDefaults;
      }
    }, {
      key: 'defaults',
      get: function get() {
        return defaults;
      }
    }, {
      key: 'Class',
      get: function get() {
        return SwiperClass;
      }
    }, {
      key: '$',
      get: function get() {
        return $;
      }
    }]);

    return Swiper;
  }(SwiperClass);

  var Device$2 = {
    name: 'device',
    proto: {
      device: Device
    },
    static: {
      device: Device
    }
  };

  var Support$2 = {
    name: 'support',
    proto: {
      support: Support
    },
    static: {
      support: Support
    }
  };

  var Browser$2 = {
    name: 'browser',
    proto: {
      browser: Browser
    },
    static: {
      browser: Browser
    }
  };

  var Resize = {
    name: 'resize',
    create: function create() {
      var swiper = this;
      Utils.extend(swiper, {
        resize: {
          resizeHandler: function resizeHandler() {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            swiper.emit('beforeResize');
            swiper.emit('resize');
          },
          orientationChangeHandler: function orientationChangeHandler() {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            swiper.emit('orientationchange');
          }
        }
      });
    },

    on: {
      init: function init() {
        var swiper = this;
        // Emit resize
        win.addEventListener('resize', swiper.resize.resizeHandler);

        // Emit orientationchange
        win.addEventListener('orientationchange', swiper.resize.orientationChangeHandler);
      },
      destroy: function destroy() {
        var swiper = this;
        win.removeEventListener('resize', swiper.resize.resizeHandler);
        win.removeEventListener('orientationchange', swiper.resize.orientationChangeHandler);
      }
    }
  };

  var Observer = {
    func: win.MutationObserver || win.WebkitMutationObserver,
    attach: function attach(target) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var swiper = this;

      var ObserverFunc = Observer.func;
      var observer = new ObserverFunc(function (mutations) {
        mutations.forEach(function (mutation) {
          swiper.emit('observerUpdate', mutation);
        });
      });

      observer.observe(target, {
        attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
        childList: typeof options.childList === 'undefined' ? true : options.childList,
        characterData: typeof options.characterData === 'undefined' ? true : options.characterData
      });

      swiper.observer.observers.push(observer);
    },
    init: function init() {
      var swiper = this;
      if (!Support.observer || !swiper.params.observer) return;
      if (swiper.params.observeParents) {
        var containerParents = swiper.$el.parents();
        for (var i = 0; i < containerParents.length; i += 1) {
          swiper.observer.attach(containerParents[i]);
        }
      }
      // Observe container
      swiper.observer.attach(swiper.$el[0], { childList: false });

      // Observe wrapper
      swiper.observer.attach(swiper.$wrapperEl[0], { attributes: false });
    },
    destroy: function destroy() {
      var swiper = this;
      swiper.observer.observers.forEach(function (observer) {
        observer.disconnect();
      });
      swiper.observer.observers = [];
    }
  };

  var Observer$1 = {
    name: 'observer',
    params: {
      observer: false,
      observeParents: false
    },
    create: function create() {
      var swiper = this;
      Utils.extend(swiper, {
        observer: {
          init: Observer.init.bind(swiper),
          attach: Observer.attach.bind(swiper),
          destroy: Observer.destroy.bind(swiper),
          observers: []
        }
      });
    },

    on: {
      init: function init() {
        var swiper = this;
        swiper.observer.init();
      },
      destroy: function destroy() {
        var swiper = this;
        swiper.observer.destroy();
      }
    }
  };

  var Keyboard = {
    handle: function handle(event) {
      var swiper = this;
      var e = event;
      if (e.originalEvent) e = e.originalEvent; // jquery fix
      var kc = e.keyCode || e.charCode;
      // Directions locks
      if (!swiper.allowSlideNext && (swiper.isHorizontal() && kc === 39 || swiper.isVertical() && kc === 40)) {
        return false;
      }
      if (!swiper.allowSlidePrev && (swiper.isHorizontal() && kc === 37 || swiper.isVertical() && kc === 38)) {
        return false;
      }
      if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
        return undefined;
      }
      if (doc.activeElement && doc.activeElement.nodeName && (doc.activeElement.nodeName.toLowerCase() === 'input' || doc.activeElement.nodeName.toLowerCase() === 'textarea')) {
        return undefined;
      }
      if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
        var inView = false;
        // Check that swiper should be inside of visible area of window
        if (swiper.$el.parents('.' + swiper.params.slideClass).length > 0 && swiper.$el.parents('.' + swiper.params.slideActiveClass).length === 0) {
          return undefined;
        }
        var windowScroll = {
          left: win.pageXOffset,
          top: win.pageYOffset
        };
        var windowWidth = win.innerWidth;
        var windowHeight = win.innerHeight;
        var swiperOffset = swiper.$el.offset();
        if (swiper.rtl) swiperOffset.left -= swiper.$el[0].scrollLeft;
        var swiperCoord = [[swiperOffset.left, swiperOffset.top], [swiperOffset.left + swiper.width, swiperOffset.top], [swiperOffset.left, swiperOffset.top + swiper.height], [swiperOffset.left + swiper.width, swiperOffset.top + swiper.height]];
        for (var i = 0; i < swiperCoord.length; i += 1) {
          var point = swiperCoord[i];
          if (point[0] >= windowScroll.left && point[0] <= windowScroll.left + windowWidth && point[1] >= windowScroll.top && point[1] <= windowScroll.top + windowHeight) {
            inView = true;
          }
        }
        if (!inView) return undefined;
      }
      if (swiper.isHorizontal()) {
        if (kc === 37 || kc === 39) {
          if (e.preventDefault) e.preventDefault();else e.returnValue = false;
        }
        if (kc === 39 && !swiper.rtl || kc === 37 && swiper.rtl) swiper.slideNext();
        if (kc === 37 && !swiper.rtl || kc === 39 && swiper.rtl) swiper.slidePrev();
      } else {
        if (kc === 38 || kc === 40) {
          if (e.preventDefault) e.preventDefault();else e.returnValue = false;
        }
        if (kc === 40) swiper.slideNext();
        if (kc === 38) swiper.slidePrev();
      }
      swiper.emit('keyPress', kc);
      return undefined;
    },
    enable: function enable() {
      var swiper = this;
      if (swiper.keyboard.enabled) return;
      $(doc).on('keydown', swiper.keyboard.handle);
      swiper.keyboard.enabled = true;
    },
    disable: function disable() {
      var swiper = this;
      if (!swiper.keyboard.enabled) return;
      $(doc).off('keydown', swiper.keyboard.handle);
      swiper.keyboard.enabled = false;
    }
  };

  var keyboard$1 = {
    name: 'keyboard',
    params: {
      keyboard: {
        enabled: false
      }
    },
    create: function create() {
      var swiper = this;
      Utils.extend(swiper, {
        keyboard: {
          enabled: false,
          enable: Keyboard.enable.bind(swiper),
          disable: Keyboard.disable.bind(swiper),
          handle: Keyboard.handle.bind(swiper)
        }
      });
    },

    on: {
      init: function init() {
        var swiper = this;
        if (swiper.params.keyboard.enabled) {
          swiper.keyboard.enable();
        }
      },
      destroy: function destroy() {
        var swiper = this;
        if (swiper.keyboard.enabled) {
          swiper.keyboard.disable();
        }
      }
    }
  };

  function isEventSupported() {
    var eventName = 'onwheel';
    var isSupported = eventName in doc;

    if (!isSupported) {
      var element = doc.createElement('div');
      element.setAttribute(eventName, 'return;');
      isSupported = typeof element[eventName] === 'function';
    }

    if (!isSupported && doc.implementation && doc.implementation.hasFeature &&
    // always returns true in newer browsers as per the standard.
    // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
    doc.implementation.hasFeature('', '') !== true) {
      // This is the only way to test support for the `wheel` event in IE9+.
      isSupported = doc.implementation.hasFeature('Events.wheel', '3.0');
    }

    return isSupported;
  }
  var Mousewheel = {
    lastScrollTime: Utils.now(),
    event: function getEvent() {
      if (win.navigator.userAgent.indexOf('firefox') > -1) return 'DOMMouseScroll';
      return isEventSupported() ? 'wheel' : 'mousewheel';
    }(),
    normalize: function normalize(e) {
      // Reasonable defaults
      var PIXEL_STEP = 10;
      var LINE_HEIGHT = 40;
      var PAGE_HEIGHT = 800;

      var sX = 0;
      var sY = 0; // spinX, spinY
      var pX = 0;
      var pY = 0; // pixelX, pixelY

      // Legacy
      if ('detail' in e) {
        sY = e.detail;
      }
      if ('wheelDelta' in e) {
        sY = -e.wheelDelta / 120;
      }
      if ('wheelDeltaY' in e) {
        sY = -e.wheelDeltaY / 120;
      }
      if ('wheelDeltaX' in e) {
        sX = -e.wheelDeltaX / 120;
      }

      // side scrolling on FF with DOMMouseScroll
      if ('axis' in e && e.axis === e.HORIZONTAL_AXIS) {
        sX = sY;
        sY = 0;
      }

      pX = sX * PIXEL_STEP;
      pY = sY * PIXEL_STEP;

      if ('deltaY' in e) {
        pY = e.deltaY;
      }
      if ('deltaX' in e) {
        pX = e.deltaX;
      }

      if ((pX || pY) && e.deltaMode) {
        if (e.deltaMode === 1) {
          // delta in LINE units
          pX *= LINE_HEIGHT;
          pY *= LINE_HEIGHT;
        } else {
          // delta in PAGE units
          pX *= PAGE_HEIGHT;
          pY *= PAGE_HEIGHT;
        }
      }

      // Fall-back if spin cannot be determined
      if (pX && !sX) {
        sX = pX < 1 ? -1 : 1;
      }
      if (pY && !sY) {
        sY = pY < 1 ? -1 : 1;
      }

      return {
        spinX: sX,
        spinY: sY,
        pixelX: pX,
        pixelY: pY
      };
    },
    handle: function handle(event) {
      var e = event;
      var swiper = this;
      var params = swiper.params.mousewheel;
      if (e.originalEvent) e = e.originalEvent; // jquery fix
      var delta = 0;
      var rtlFactor = swiper.rtl ? -1 : 1;

      var data$$1 = Mousewheel.normalize(e);

      if (params.forceToAxis) {
        if (swiper.isHorizontal()) {
          if (Math.abs(data$$1.pixelX) > Math.abs(data$$1.pixelY)) delta = data$$1.pixelX * rtlFactor;else return true;
        } else if (Math.abs(data$$1.pixelY) > Math.abs(data$$1.pixelX)) delta = data$$1.pixelY;else return true;
      } else {
        delta = Math.abs(data$$1.pixelX) > Math.abs(data$$1.pixelY) ? -data$$1.pixelX * rtlFactor : -data$$1.pixelY;
      }

      if (delta === 0) return true;

      if (params.invert) delta = -delta;

      if (!swiper.params.freeMode) {
        if (Utils.now() - swiper.mousewheel.lastScrollTime > 60) {
          if (delta < 0) {
            if ((!swiper.isEnd || swiper.params.loop) && !swiper.animating) {
              swiper.slideNext();
              swiper.emit('scroll', e);
            } else if (params.releaseOnEdges) return true;
          } else if ((!swiper.isBeginning || swiper.params.loop) && !swiper.animating) {
            swiper.slidePrev();
            swiper.emit('scroll', e);
          } else if (params.releaseOnEdges) return true;
        }
        swiper.mousewheel.lastScrollTime = new win.Date().getTime();
      } else {
        // Freemode or scrollContainer:
        var position = swiper.getTranslate() + delta * params.sensitivity;
        var wasBeginning = swiper.isBeginning;
        var wasEnd = swiper.isEnd;

        if (position >= swiper.minTranslate()) position = swiper.minTranslate();
        if (position <= swiper.maxTranslate()) position = swiper.maxTranslate();

        swiper.setTransition(0);
        swiper.setTranslate(position);
        swiper.updateProgress();
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();

        if (!wasBeginning && swiper.isBeginning || !wasEnd && swiper.isEnd) {
          swiper.updateSlidesClasses();
        }

        if (swiper.params.freeModeSticky) {
          clearTimeout(swiper.mousewheel.timeout);
          swiper.mousewheel.timeout = Utils.nextTick(function () {
            swiper.slideReset();
          }, 300);
        }
        // Emit event
        swiper.emit('scroll', e);

        // Stop autoplay
        if (swiper.params.autoplay && swiper.params.autoplayDisableOnInteraction) swiper.stopAutoplay();

        // Return page scroll on edge positions
        if (position === 0 || position === swiper.maxTranslate()) return true;
      }

      if (e.preventDefault) e.preventDefault();else e.returnValue = false;
      return false;
    },
    enable: function enable() {
      var swiper = this;
      if (!Mousewheel.event) return false;
      if (swiper.mousewheel.enabled) return false;
      var target = swiper.$el;
      if (swiper.params.mousewheel.eventsTarged !== 'container') {
        target = $(swiper.params.mousewheel.eventsTarged);
      }
      target.on(Mousewheel.event, swiper.mousewheel.handle);
      swiper.mousewheel.enabled = true;
      return true;
    },
    disable: function disable() {
      var swiper = this;
      if (!Mousewheel.event) return false;
      if (!swiper.mousewheel.enabled) return false;
      var target = swiper.$el;
      if (swiper.params.mousewheel.eventsTarged !== 'container') {
        target = $(swiper.params.mousewheel.eventsTarged);
      }
      target.off(Mousewheel.event, swiper.mousewheel.handle);
      swiper.mousewheel.enabled = false;
      return true;
    }
  };

  var mousewheel = {
    name: 'mousewheel',
    params: {
      mousewheel: {
        enabled: false,
        releaseOnEdges: false,
        invert: false,
        forceToAxis: false,
        sensitivity: 1,
        eventsTarged: 'container'
      }
    },
    create: function create() {
      var swiper = this;
      Utils.extend(swiper, {
        mousewheel: {
          enabled: false,
          enable: Mousewheel.enable.bind(swiper),
          disable: Mousewheel.disable.bind(swiper),
          handle: Mousewheel.handle.bind(swiper),
          lastScrollTime: Utils.now()
        }
      });
    },

    on: {
      init: function init() {
        var swiper = this;
        if (swiper.params.mousewheel.enabled) swiper.mousewheel.enable();
      },
      destroy: function destroy() {
        var swiper = this;
        if (swiper.mousewheel.enabled) swiper.mousewheel.disable();
      }
    }
  };

  var Navigation = {
    update: function update() {
      // Update Navigation Buttons
      var swiper = this;
      var params = swiper.params.navigation;

      if (swiper.params.loop) return;
      var _swiper$navigation = swiper.navigation,
          $nextEl = _swiper$navigation.$nextEl,
          $prevEl = _swiper$navigation.$prevEl;


      if ($prevEl && $prevEl.length > 0) {
        if (swiper.isBeginning) {
          $prevEl.addClass(params.disabledClass);
        } else {
          $prevEl.removeClass(params.disabledClass);
        }
      }
      if ($nextEl && $nextEl.length > 0) {
        if (swiper.isEnd) {
          $nextEl.addClass(params.disabledClass);
        } else {
          $nextEl.removeClass(params.disabledClass);
        }
      }
    },
    init: function init() {
      var swiper = this;
      var params = swiper.params.navigation;
      if (!(params.nextEl || params.prevEl)) return;

      var $nextEl = void 0;
      var $prevEl = void 0;
      if (params.nextEl) {
        $nextEl = $(params.nextEl);
        if (swiper.params.uniqueNavElements && typeof params.nextEl === 'string' && $nextEl.length > 1 && swiper.$el.find(params.nextEl).length === 1) {
          $nextEl = swiper.$el.find(params.nextEl);
        }
      }
      if (params.prevEl) {
        $prevEl = $(params.prevEl);
        if (swiper.params.uniqueNavElements && typeof params.prevEl === 'string' && $prevEl.length > 1 && swiper.$el.find(params.prevEl).length === 1) {
          $prevEl = swiper.$el.find(params.prevEl);
        }
      }

      if ($nextEl && $nextEl.length > 0) {
        $nextEl.on('click', function (e) {
          e.preventDefault();
          if (swiper.isEnd && !swiper.params.loop) return;
          swiper.slideNext();
        });
      }
      if ($prevEl && $prevEl.length > 0) {
        $prevEl.on('click', function (e) {
          e.preventDefault();
          if (swiper.isBeginning && !swiper.params.loop) return;
          swiper.slidePrev();
        });
      }

      Utils.extend(swiper.navigation, {
        $nextEl: $nextEl,
        nextEl: $nextEl && $nextEl[0],
        $prevEl: $prevEl,
        prevEl: $prevEl && $prevEl[0]
      });
    },
    destroy: function destroy() {
      var swiper = this;
      var _swiper$navigation2 = swiper.navigation,
          $nextEl = _swiper$navigation2.$nextEl,
          $prevEl = _swiper$navigation2.$prevEl;

      if ($nextEl && $nextEl.length) {
        $nextEl.off('click');
        $nextEl.removeClass(swiper.params.navigation.disabledClass);
      }
      if ($prevEl && $prevEl.length) {
        $prevEl.off('click');
        $prevEl.removeClass(swiper.params.navigation.disabledClass);
      }
    }
  };

  var navigation = {
    name: 'navigation',
    params: {
      navigation: {
        nextEl: null,
        prevEl: null,

        hideOnClick: false,
        disabledClass: 'swiper-button-disabled',
        hiddenClass: 'swiper-button-hidden'
      }
    },
    create: function create() {
      var swiper = this;
      Utils.extend(swiper, {
        navigation: {
          init: Navigation.init.bind(swiper),
          update: Navigation.update.bind(swiper),
          destroy: Navigation.destroy.bind(swiper)
        }
      });
    },

    on: {
      init: function init() {
        var swiper = this;
        swiper.navigation.init();
        swiper.navigation.update();
      },
      toEdge: function toEdge() {
        var swiper = this;
        swiper.navigation.update();
      },
      fromEdge: function fromEdge() {
        var swiper = this;
        swiper.navigation.update();
      },
      destroy: function destroy() {
        var swiper = this;
        swiper.navigation.destroy();
      },
      click: function click(e) {
        var swiper = this;
        var _swiper$navigation3 = swiper.navigation,
            $nextEl = _swiper$navigation3.$nextEl,
            $prevEl = _swiper$navigation3.$prevEl;

        if (swiper.params.navigation.hideOnClick && !$(e.target).is($prevEl) && !$(e.target).is($nextEl)) {
          if ($nextEl) $nextEl.toggleClass(swiper.params.navigation.hiddenClass);
          if ($prevEl) $prevEl.toggleClass(swiper.params.navigation.hiddenClass);
        }
      }
    }
  };

  var Pagination = {
    update: function update() {
      // Render || Update Pagination bullets/items
      var swiper = this;
      var rtl = swiper.rtl;
      var params = swiper.params.pagination;
      if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) return;
      var slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
      var $el = swiper.pagination.$el;
      // Current/Total
      var current = void 0;
      var total = swiper.params.loop ? Math.ceil((slidesLength - swiper.loopedSlides * 2) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
      if (swiper.params.loop) {
        current = Math.ceil((swiper.activeIndex - swiper.loopedSlides) / swiper.params.slidesPerGroup);
        if (current > slidesLength - 1 - swiper.loopedSlides * 2) {
          current -= slidesLength - swiper.loopedSlides * 2;
        }
        if (current > total - 1) current -= total;
        if (current < 0 && swiper.params.paginationType !== 'bullets') current = total + current;
      } else if (typeof swiper.snapIndex !== 'undefined') {
        current = swiper.snapIndex;
      } else {
        current = swiper.activeIndex || 0;
      }
      // Types
      if (params.type === 'bullets' && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
        var bullets = swiper.pagination.bullets;
        if (params.dynamicBullets) {
          swiper.pagination.bulletSize = bullets.eq(0)[swiper.isHorizontal() ? 'outerWidth' : 'outerHeight'](true);
          $el.css(swiper.isHorizontal() ? 'width' : 'height', swiper.pagination.bulletSize * 5 + 'px');
        }
        bullets.removeClass(params.bulletActiveClass + ' ' + params.bulletActiveClass + '-next ' + params.bulletActiveClass + '-next-next ' + params.bulletActiveClass + '-prev ' + params.bulletActiveClass + '-prev-prev');
        if ($el.length > 1) {
          bullets.each(function (index$$1, bullet) {
            var $bullet = $(bullet);
            if ($bullet.index() === current) {
              $bullet.addClass(params.bulletActiveClass);
              if (params.dynamicBullets) {
                $bullet.prev().addClass(params.bulletActiveClass + '-prev').prev().addClass(params.bulletActiveClass + '-prev-prev');
                $bullet.next().addClass(params.bulletActiveClass + '-next').next().addClass(params.bulletActiveClass + '-next-next');
              }
            }
          });
        } else {
          var $bullet = bullets.eq(current);
          $bullet.addClass(params.bulletActiveClass);
          if (params.dynamicBullets) {
            $bullet.prev().addClass(params.bulletActiveClass + '-prev').prev().addClass(params.bulletActiveClass + '-prev-prev');
            $bullet.next().addClass(params.bulletActiveClass + '-next').next().addClass(params.bulletActiveClass + '-next-next');
          }
        }
        if (params.dynamicBullets) {
          var dynamicBulletsLength = Math.min(bullets.length, 5);
          var bulletsOffset = (swiper.pagination.bulletSize * dynamicBulletsLength - swiper.pagination.bulletSize) / 2 - current * swiper.pagination.bulletSize;
          var offsetProp = rtl ? 'right' : 'left';
          bullets.css(swiper.isHorizontal() ? offsetProp : 'top', bulletsOffset + 'px');
        }
      }
      if (params.type === 'fraction') {
        $el.find('.' + params.currentClass).text(current + 1);
        $el.find('.' + params.totalClass).text(total);
      }
      if (params.type === 'progressbar') {
        var scale = (current + 1) / total;
        var scaleX = scale;
        var scaleY = 1;
        if (!swiper.isHorizontal()) {
          scaleY = scale;
          scaleX = 1;
        }
        $el.find('.' + params.progressbarFillClass).transform('translate3d(0,0,0) scaleX(' + scaleX + ') scaleY(' + scaleY + ')').transition(swiper.params.speed);
      }
      if (params.type === 'custom' && params.renderCustom) {
        $el.html(params.renderCustom(swiper, current + 1, total));
        swiper.emit('paginationRender', swiper, $el[0]);
      } else {
        swiper.emit('paginationUpdate', swiper, $el[0]);
      }
    },
    render: function render() {
      // Render Container
      var swiper = this;
      var params = swiper.params.pagination;
      if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) return;
      var slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;

      var $el = swiper.pagination.$el;
      var paginationHTML = '';
      if (params.type === 'bullets') {
        var numberOfBullets = swiper.params.loop ? Math.ceil((slidesLength - swiper.loopedSlides * 2) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
        for (var i = 0; i < numberOfBullets; i += 1) {
          if (params.renderBullet) {
            paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
          } else {
            paginationHTML += '<' + params.bulletElement + ' class="' + params.bulletClass + '"></' + params.bulletElement + '>';
          }
        }
        $el.html(paginationHTML);
        swiper.pagination.bullets = $el.find('.' + params.bulletClass);
      }
      if (params.type === 'fraction') {
        if (params.renderFraction) {
          paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
        } else {
          paginationHTML = '<span class="' + params.currentClass + '"></span>' + ' / ' + ('<span class="' + params.totalClass + '"></span>');
        }
        $el.html(paginationHTML);
      }
      if (params.type === 'progressbar') {
        if (params.renderProgressbar) {
          paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
        } else {
          paginationHTML = '<span class="' + params.progressbarFillClass + '"></span>';
        }
        $el.html(paginationHTML);
      }
      if (params.type !== 'custom') {
        swiper.emit('paginationRender', swiper.pagination.$el[0]);
      }
    },
    init: function init() {
      var swiper = this;
      var params = swiper.params.pagination;
      if (!params.el) return;

      var $el = $(params.el);
      if ($el.length === 0) return;

      if (swiper.params.uniqueNavElements && typeof params.el === 'string' && $el.length > 1 && swiper.$el.find(params.el).length === 1) {
        $el = swiper.$el.find(params.el);
      }

      if (params.type === 'bullets' && params.clickable) {
        $el.addClass(params.clickableClass);
      }

      $el.addClass(params.modifierClass + params.type);

      if (params.type === 'bullets' && params.dynamicBullets) {
        $el.addClass('' + params.modifierClass + params.type + '-dynamic');
      }

      if (params.clickable) {
        $el.on('click', '.' + params.bulletClass, function onClick(e) {
          e.preventDefault();
          var index$$1 = $(this).index() * swiper.params.slidesPerGroup;
          if (swiper.params.loop) index$$1 += swiper.loopedSlides;
          swiper.slideTo(index$$1);
        });
      }

      Utils.extend(swiper.pagination, {
        $el: $el,
        el: $el[0]
      });
    },
    destroy: function destroy() {
      var swiper = this;
      var params = swiper.params.pagination;
      if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) return;
      var $el = swiper.pagination.$el;

      $el.removeClass(params.hiddenClass);
      $el.removeClass(params.modifierClass + params.type);
      if (swiper.pagination.bullets) swiper.pagination.bullets.removeClass(params.bulletActiveClass);
      if (params.clickable) {
        $el.off('click', '.' + params.bulletClass);
      }
    }
  };

  var pagination = {
    name: 'pagination',
    params: {
      pagination: {
        el: null,
        bulletElement: 'span',
        clickable: false,
        hideOnClick: false,
        renderBullet: null,
        renderProgressbar: null,
        renderFraction: null,
        renderCustom: null,
        type: 'bullets', // 'bullets' or 'progressbar' or 'fraction' or 'custom'
        dynamicBullets: false,

        bulletClass: 'swiper-pagination-bullet',
        bulletActiveClass: 'swiper-pagination-bullet-active',
        modifierClass: 'swiper-pagination-', // NEW
        currentClass: 'swiper-pagination-current',
        totalClass: 'swiper-pagination-total',
        hiddenClass: 'swiper-pagination-hidden',
        progressbarFillClass: 'swiper-pagination-progressbar-fill',
        clickableClass: 'swiper-pagination-clickable' // NEW
      }
    },
    create: function create() {
      var swiper = this;
      Utils.extend(swiper, {
        pagination: {
          init: Pagination.init.bind(swiper),
          render: Pagination.render.bind(swiper),
          update: Pagination.update.bind(swiper),
          destroy: Pagination.destroy.bind(swiper)
        }
      });
    },

    on: {
      init: function init() {
        var swiper = this;
        swiper.pagination.init();
        swiper.pagination.render();
        swiper.pagination.update();
      },
      activeIndexChange: function activeIndexChange() {
        var swiper = this;
        if (swiper.params.loop) {
          swiper.pagination.update();
        } else if (typeof swiper.snapIndex === 'undefined') {
          swiper.pagination.update();
        }
      },
      snapIndexChange: function snapIndexChange() {
        var swiper = this;
        if (!swiper.params.loop) {
          swiper.pagination.update();
        }
      },
      slidesLengthChange: function slidesLengthChange() {
        var swiper = this;
        if (swiper.params.loop) {
          swiper.pagination.render();
          swiper.pagination.update();
        }
      },
      snapGridLengthChange: function snapGridLengthChange() {
        var swiper = this;
        if (!swiper.params.loop) {
          swiper.pagination.render();
          swiper.pagination.update();
        }
      },
      destroy: function destroy() {
        var swiper = this;
        swiper.pagination.destroy();
      },
      click: function click(e) {
        var swiper = this;
        if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && swiper.pagination.$el.length > 0 && !$(e.target).hasClass(swiper.params.pagination.bulletClass)) {
          swiper.pagination.$el.toggleClass(swiper.params.pagination.hiddenClass);
        }
      }
    }
  };

  // Swiper Class
  // Core Modules
  Swiper.use([Device$2, Support$2, Browser$2, Resize, Observer$1]);

  // Import Swiper and modules
  // import TweenMax from "gsap";
  // Install modules
  Swiper.use([navigation, pagination, mousewheel, keyboard$1]);

  var WodSlider = function (_CustomElement4) {
    _inherits(WodSlider, _CustomElement4);

    function WodSlider(dispatcher) {
      _classCallCheck(this, WodSlider);

      var _this6 = _possibleConstructorReturn(this, (WodSlider.__proto__ || Object.getPrototypeOf(WodSlider)).call(this));

      _this6.dispatcher = dispatcher;
      _this6.pagination = _this6.querySelector('.swiper-pagination');
      _this6.container = _this6.querySelector(".swiper-container");

      return _this6;
    }

    _createClass(WodSlider, [{
      key: 'disconnectCallback',
      value: function disconnectCallback() {
        this.swiper.destroy();
      }

      // Only called for the disabled and open attributes due to observedAttributes

    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, oldValue, zoomed) {
        var opts = {
          spaceBetween: 0,
          freeMode: false,
          freeModeSticky: false
        };
        if (zoomed != null) {
          opts.spaceBetween = 10;
          opts.freeMode = true;
          opts.freeModeSticky = true;

          this.swiper.enableMousewheelControl();
        } else {
          this.swiper.disableMousewheelControl();
        }
        Object.assign(this.swiper.params, opts);
        this.swiper.update();
      }
    }, {
      key: 'connectedCallback',
      value: function connectedCallback() {
        var _this7 = this;

        this.swiper = new Swiper(this.container, {
          spaceBetween: 0,
          slidesPerView: 1,
          pagination: {
            el: this.pagination,
            type: 'bullets'
          },
          keyboard: true,
          mousewheel: true
        });

        this.addEventListener("click", function (e) {
          // if (this.zoomed) {
          //     TweenMax.to(this.querySelector(".swiper-container"), .3, {scale: 1});
          // } else {
          //     TweenMax.to(this.querySelector(".swiper-container"), .3, {scale: .6});
          // }

          _this7.zoomed = !_this7.zoomed;

          // swiper.update();
        });
      }
    }, {
      key: 'zoomed',
      get: function get() {
        return this.hasAttribute('zoomed');
      },
      set: function set(val) {
        // Reflect the value of the open property as an HTML attribute.
        if (val) {
          this.setAttribute('zoomed', '');
        } else {
          this.removeAttribute('zoomed');
        }
      }
    }], [{
      key: 'observedAttributes',
      get: function get() {
        return ['zoomed'];
      }
    }]);

    return WodSlider;
  }(_CustomElement);

  var definitions = {
    "wod-menu": Menu,
    "wod-slider": WodSlider,
    "menu-boxes": MenuBoxes
    // ,"menu-visibility":MenuVisibility
  };

  bootstrap({
    definitions: definitions,
    loader: Loader(function (Mediator, resolve) {
      return resolve(Mediator);
    }),
    handler: CustomElementHandler({ definitions: definitions })

  }).promise.then(function (_) {
    return console.log("Ok");
  }).catch(function (e) {
    return console.log(e);
  });
})();

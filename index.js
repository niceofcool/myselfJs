'use strict';

(function () {
    window.oldV = window.v;
    var v = function v(selector) {
        var _this = this,
            _arguments = arguments;

        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
            methodHistory: [],
            selectorHistory: []
        };

        if (!(this instanceof v)) {
            return new v(selector);
        }
        if (selector instanceof v) {
            return selector;
        }
        if (selector && selector.nodeName) {
            selector = [selector];
            if (!this.selector) {
                this.selector = selector;
            }
        }

        this.version = '4.7.0';
        this.methodHistory = context.methodHistory;

        if (context.selectorHistory.length === 0) {
            this.selectorHistory = [];
            this.selectorHistory.push(selector);
        } else {
            this.selectorHistory = context.selectorHistory;
        }

        // Utility functions
        var error = function error(msg, selector, method, parameters) {
            var errMsg = function errMsg(msg) {
                console.error('vQuery: ' + msg + '\nAcceptable parameters: v(' + selector + ').' + method + '(' + parameters + ')');
            };
            if (msg === 'undefinedNode') {
                errMsg('Selector is not a val node.');
            } else if (msg === 'notType') {
                errMsg('Parameter passed to the ' + method + ' method is not of the type \'' + parameters + '\'.');
            } else {
                errMsg(msg);
            }
        };
        var isElement = function isElement(element) {
            return element instanceof Element || element[0] instanceof Element;
        };
        var queryElement = function queryElement(element) {
            return isElement(element) ? element : _this.query(document, element)[0];
        };
        var queryParameter = function queryParameter(param, checkNodes) {
            if (checkNodes) {
                return _this.nodes ? _this.nodes : _this.nonElement ? _this.nonElement : param;
            } else {
                return _this.nonElement ? _this.nonElement : param;
            }
        };
        v.prototype.for = function (iterator, func) {
            if (iterator !== undefined) {
                for (var i = 0, len = iterator.length; i < len; i++) {
                    func.apply(_this, [iterator[i], i, _arguments]);
                }
            }
        };
        v.prototype.forIn = function (props, func) {
            for (var y in props) {
                func.apply(_this, [y, props, _arguments]);
            }
        };
        v.prototype.includes = function (string, match) {
            return string.indexOf(match) > -1;
        };
        v.prototype.typeOf = function (input) {
            return Object.prototype.toString.call(input).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
        };
        v.prototype.handler = function (data, opts) {
            // If the selector is updated, start a new instance with the updated selector.
            var _selector = data ? data : _this.selector ? _this.selector : selector;
            _this.selectorHistory.push(_selector);
            _this.methodHistory.push(opts.method);
            return new v(_selector, {
                selectorHistory: _this.selectorHistory,
                methodHistory: _this.methodHistory
            });
        };
        v.prototype.move = function (fromIndex, toIndex) {
            try {
                _this.nodes.splice(toIndex, 0, _this.nodes.splice(fromIndex, 1)[0]);
                return _this.handler(null, {method: 'move'});
            } catch (e) {
                error('notType', '', 'move', 'array');
            }
        }, v.prototype.uniq = function (array) {
            var _array = array ? array : _this.nonElement ? _this.nonElement : _this.nodes ? _this.nodes : null;
            var uniq = Array.from(new Set(_array));
            if (array) {
                return uniq;
            } else {
                _this.selector = uniq;
                return _this.handler(null, {method: 'uniq'});
            }
        };
        v.prototype.slice = function (nodeList) {
            return Array.prototype.slice.call(nodeList);
        };
        var assignNodes = function assignNodes(nodes) {
            _this.nodes = _this.slice(nodes);
            _this.node = _this.nodes.length > 0 ? _this.nodes[0] : null;
        };
        // Turn the CSS selector into a node, pass an existing node to this.nodes, which is used by all methods.
        v.prototype.query = function (el, _selector) {
            return el.querySelectorAll(_selector);
        };
        v.prototype.parseHTML = function (string) {
            var tmp = document.implementation.createHTMLDocument();
            tmp.body.innerHTML = _this.nonElement ? _this.nonElement : string;
            return tmp.body.children;
        };
        // Assign the selector by calling this.query if its an element, otherwise assign it to this.nodes directly.
        if (selector) {
            if (this.typeOf(selector) === 'string') {
                try {
                    assignNodes(this.query(document, selector));
                } catch (e) {
                    try {
                        if (selector.match(/<(.|\n)*?>/g)[0]) {
                            this.nonElement = selector;
                            assignNodes(this.parseHTML(selector));
                        }
                    } catch (y) {
                        this.nonElement = selector;
                    }
                }
                if (!this.node) {
                    this.nonElement = selector;
                }
            } else {
                if (isElement(selector)) {
                    assignNodes(selector);
                } else {
                    this.nodes = selector;
                    this.node = this.nodes[0];
                }
            }
            this.length = this.nodes ? this.nodes.length : this.nonElement ? this.nonElement.length : 0;
        }
        v.prototype.mixin = function (mixin) {
            for (var prop in mixin) {
                if (mixin.hasOwnProperty(prop)) {
                    v.prototype[prop] = mixin[prop];
                }
                return v.prototype[prop].apply(_this, [_this.nodes, _arguments]);
            }
        };
        v.prototype.ajax = function (type, url, options) {
            var Promise = require('promise-polyfill');
            var setAsap = require('setasap');
            Promise._setImmediateFn(setAsap);
            return new Promise(function (resolve, reject) {
                var _resolve = function _resolve(data) {
                    var _data = options && options.chain ? _this.handler(data, {method: 'ajax'}) : data;
                    if (typeof _data !== 'undefined' && _data) {
                        resolve(_data);
                    }
                };
                var request = new XMLHttpRequest();
                request.open(type, url, true);
                var data = void 0;
                if (type.toLowerCase() === 'post') {
                    // Check if options.data is JSON, if not, send as application/x-www-form-urlencoded
                    try {
                        options.data = JSON.stringify(options.data);
                        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                    } catch (e) {
                        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                    }
                    request.send(options.data);
                }
                request.onload = function () {
                    if (request.status >= 200 && request.status < 400) {
                        try {
                            data = JSON.parse(request.responseText);
                        } catch (e) {
                            data = request.responseText;
                        }
                        _resolve(data);
                    } else {
                        reject();
                    }
                };
                if (type.toLowerCase() === 'get') {
                    request.send();
                }
                request.onerror = function (err) {
                    reject(err);
                };
            });
        };
        // v(selector).get(0) -> <div></div>
        v.prototype.get = function (i) {
            _this.selector = _this.nodes[i];
            return _this.handler(null, {method: 'get'});
        };
        // Event methods
        v.prototype.ready = function (func) {
            if (func && func !== undefined && typeof func === 'function') {
                document.addEventListener('DOMContentLoaded', func);
            } else {
                error('notType', '', 'ready', 'function');
            }
        };
        v.prototype.load = function (func) {
            if (func && func !== undefined && typeof func === 'function') {
                document.addEventListener('load', func);
            } else {
                error('notType', '', 'load', 'function');
            }
        };
        v.prototype.on = function (event, func) {
            _this.for(_this.nodes, function (i) {
                i.addEventListener(event, func);
            });
            return _this.handler(null, {method: 'on'});
        };
        v.prototype.off = function (event, func) {
            _this.for(_this.nodes, function (i) {
                i.removeEventListener(event, func);
            });
            return _this.handler(null, {method: 'off'});
        };
        v.prototype.trigger = function (event) {
            if (_this.node.fireEvent) {
                _this.node.fireEvent('on' + event);
            } else {
                var evObj = document.createEvent('Events');
                evObj.initEvent(event, true, false);
                _this.node.dispatchEvent(evObj);
            }
            return _this.handler(null, {method: 'trigger'});
        };
        v.prototype.click = function (func) {
            _this.for(_this.nodes, function (i) {
                if (func) {
                    _this.on('click', func);
                } else {
                    _this.trigger('click');
                }
            });
            return _this.handler(null, {method: 'click'});
        };
        // DOM traversal and manipulation methods
        v.prototype.filter = function (func) {
            Array.prototype.filter.call(_this.nodes, func);
            return _this.handler(null, {method: 'filter'});
        };
        v.prototype.each = function (func) {
            Array.prototype.forEach.call(_this.nodes, func);
            return _this.handler(null, {method: 'each'});
        };
        v.prototype.map = function (func) {
            Array.prototype.map.call(_this.nodes, func);
            return _this.handler(null, {method: 'map'});
        };
        v.prototype.find = function (_selector) {
            if (!isElement(_selector)) {
                if (_this.includes(_selector, ',')) {
                    (function () {
                        var __selector = _selector.split(',');
                        var newSelector = [];
                        var subset = [];
                        _this.for(__selector, function (i) {
                            subset = _this.query(_this.node, i);
                            _this.for(subset, function (y) {
                                newSelector.push(y);
                            });
                        });
                        _this.selector = newSelector;
                    })();
                } else {
                    _this.selector = _this.query(_this.node, _selector);
                }
            } else {
                _this.selector = _selector;
            }
            return _this.handler(null, {method: 'find'});
        };
        v.prototype.end = function () {
            _this.selector = _this.selectorHistory[0];
            return _this.handler(null, {method: 'end'});
        };
        v.prototype.hide = function () {
            _this.for(_this.nodes, function (i) {
                i.style.display = 'none';
            });
            return _this.handler(null, {method: 'hide'});
        };
        v.prototype.show = function () {
            _this.for(_this.nodes, function (i) {
                i.style.display = 'block';
            });
            return _this.handler(null, {method: 'show'});
        };
        v.prototype.remove = function () {
            _this.for(_this.nodes, function (i) {
                i.parentNode.removeChild(i);
            });
            return _this.handler(null, {method: 'remove'});
        };
        v.prototype.empty = function () {
            _this.for(_this.nodes, function (i) {
                i.innerHTML = '';
            });
            return _this.handler(null, {method: 'empty'});
        };
        v.prototype.clone = function () {
            var clone = _this.node.cloneNode(true);
            _this.selector = clone;
            return _this.handler(null, {method: 'clone'});
        };
        v.prototype.wrap = function (tag) {
            _this.for(_this.nodes, function (i) {
                i.outerHTML = '' + tag.match(/<(.|\n)*?>/g)[0] + i.outerHTML;
            });
            return _this.handler(null, {method: 'wrap'});
        };
        v.prototype.parent = function () {
            _this.selector = _this.node.parentNode;
            return _this.handler(null, {method: 'parent'});
        };
        v.prototype.parents = function (el) {
            var parent = _this.node.parentNode;
            var _parents = [];
            while (parent) {
                _parents.unshift(parent);
                parent = parent.parentNode;
            }
            if (el) {
                (function () {
                    var __parents = [];
                    var _parentsQuery = [];
                    _this.for(_parents, function (i) {
                        __parents = _this.slice(_this.query(i, el));
                        _this.for(__parents, function (y) {
                            _parentsQuery.push(y);
                        });
                    });
                    _this.selector = _this.uniq(_parentsQuery);
                })();
            } else {
                _this.selector = _parents;
            }
            return _this.handler(null, {method: 'parents'});
        };
        v.prototype.children = function (el) {
            var children = _this.slice(_this.nodes[0].children);
            if (el) {
                (function () {
                    var _children = [];
                    var arr = [];
                    _this.for(children, function (i) {
                        _children = _this.slice(_this.query(i, el));
                        _this.for(_children, function (y) {
                            arr.push(_children[y]);
                        });
                    });
                    _this.selector = arr;
                })();
            } else {
                _this.selector = children;
            }
            return _this.handler(null, {method: 'children'});
        };
        v.prototype.allChildren = function (_el) {
            var __el = _el ? _this.slice(_this.query(_this.node, _el))[0] : _this.node;
            var arr = [];
            var recurse = function recurse(el) {
                arr.push(el);
                if (el.childNodes.length > 0) {
                    _this.forIn(el.childNodes, function (child) {
                        if (el.childNodes[child].nodeType == 1) {
                            recurse(el.childNodes[child]);
                        }
                    });
                }
            };
            recurse(__el);
            _this.selector = arr;
            return _this.handler(null, {method: 'allChildren'});
        };
        v.prototype.isEmpty = function () {
            return !_this.node.hasChildNodes();
        };
        v.prototype.siblings = function () {
            _this.nodes = _this.node.parentNode.children;
            return _this.filter(function (child) {
                return child !== _this.node;
            });
        };
        v.prototype.next = function () {
            _this.selector = _this.node.nextElementSibling;
            return _this.handler(null, {method: 'next'});
        };
        v.prototype.prev = function () {
            _this.selector = _this.node.previousElementSibling;
            return _this.handler(null, {method: 'prev'});
        };
        v.prototype.addClass = function (_class) {
            var classArr = _class.split(' ');
            _this.for(_this.nodes, function (i) {
                _this.for(classArr, function (y) {
                    i.classList.add(y);
                });
            });
            return _this.handler(null, {method: 'addClass'});
        };
        v.prototype.removeClass = function (_class) {
            var classArr = _class.split(' ');
            _this.for(_this.nodes, function (i) {
                _this.for(classArr, function (y) {
                    i.classList.remove(y);
                });
            });
            return _this.handler(null, {method: 'removeClass'});
        };
        v.prototype.toggleClass = function (_class) {
            var classArr = _class.split(' ');
            _this.for(_this.nodes, function (i) {
                _this.for(classArr, function (y) {
                    i.classList.toggle(y);
                });
            });
            return _this.handler(null, {method: 'toggleClass'});
        };
        v.prototype.hasClass = function (_class) {
            var bool = _this.node.classList.contains(_class);
            return bool;
        };
        v.prototype.removeAttr = function (attr) {
            _this.for(_this.nodes, function (i) {
                i.removeAttribute(attr);
            });
            return _this.handler(null, {method: 'removeAttr'});
        };
        // v(selector).attr() returns an object of camelized attribute keys.
        // v(selector).attr({dataId: '0'}) -> <div data-id="0"></div>
        v.prototype.attr = function (props, props2) {
            var _return = null;
            _this.for(_this.nodes, function (i) {
                if (props) {
                    if (props2 && _this.typeOf(props2) === 'string') {
                        i.setAttribute(_this.decamelize(props), props2);
                        _return = _this.handler(null, {method: 'attr'});
                    } else {
                        _this.forIn(props, function (y) {
                            if (_this.typeOf(props) === 'string') {
                                _return = i.attributes[props].value;
                            } else {
                                i.setAttribute(_this.decamelize(y), props[y]);
                                _return = _this.handler(null, {method: 'attr'});
                            }
                        });
                    }
                } else {
                    var obj = {};
                    var name = null;
                    var value = null;
                    _this.for(i.attributes, function (z) {
                        name = _this.camelize(z.name);
                        value = z.value;
                        obj[name] = value;
                    });
                    _return = obj;
                }
            });
            return _return;
        };
        // v(selector).css({backgroundColor: '#FFF'}) -> <div style="background-color:#FFF;"></div>
        v.prototype.css = function (props) {
            if (props) {
                _this.for(_this.nodes, function (i) {
                    _this.forIn(props, function (y) {
                        i.style[y] = props[y];
                    });
                });
                return _this.handler(null, {method: 'css'});
            } else {
                if (isElement(_this.node)) {
                    return getComputedStyle(_this.node);
                } else {
                    return {};
                }
            }
        };
        v.prototype.val = function (string) {
            if (string) {
                _this.for(_this.nodes, function (i) {
                    i.value = string;
                });
                return _this.handler(null, {method: 'val'});
            } else {
                return _this.node.value;
            }
        };
        v.prototype.rect = function () {
            return _this.node.getBoundingClientRect();
        };
        v.prototype.offset = function () {
            var rect = _this.rect();
            var offset = {
                top: rect.top + document.body.scrollTop,
                left: rect.left + document.body.scrollLeft
            };
            return offset;
        };
        v.prototype.offsetParent = function () {
            return _this.node.offsetParent || _this.node;
        };
        v.prototype.height = function (heightMargin) {
            var height = _this.node.offsetHeight;
            if (heightMargin) {
                var style = _this.css();
                height += parseInt(style.marginTop) + parseInt(style.marginBottom);
            }
            return height;
        };
        v.prototype.width = function (withMargin) {
            var width = _this.node.offsetWidth;
            if (withMargin) {
                var style = _this.css();
                width += parseInt(style.marginLeft) + parseInt(style.marginRight);
            }
            return width;
        };
        v.prototype.position = function (withMargin) {
            if (typeof _this.node !== 'undefined') {
                return {left: _this.node.offsetLeft, top: _this.node.offsetTop};
            } else {
                error('undefinedNode', 'node', 'position', 'withMargin');
            }
        };
        v.prototype.html = function (contents) {
            var output = [];
            _this.for(_this.nodes, function (i) {
                if (!contents) {
                    output.push(i.outerHTML);
                } else {
                    i.innerHTML = contents;
                }
            });
            return contents ? _this.handler(null, {method: 'html'}) : output;
        };
        v.prototype.json = function (input) {
            var _input = _this.nodes ? _this.nodes : _this.nonElement ? _this.nonElement : input;
            try {
                return JSON.stringify(_input);
            } catch (e) {
                error(e, '', 'json', 'serializable input');
            }
        };
        v.prototype.parseJSON = function (string) {
            string = _this.nonElement ? _this.nonElement : string;
            try {
                var output = JSON.parse(string);
                return output;
            } catch (e) {
                error(e, '', 'parseJSON', 'valid JSON');
            }
        };
        v.prototype.type = function (input) {
            input = queryParameter(input, true);
            return _this.nodes && isElement(_this.nodes) ? 'node' : _this.typeOf(input);
        };
        v.prototype.replaceWith = function (string) {
            _this.for(_this.nodes, function (i) {
                if (string && typeof string === 'string') {
                    i.outerHTML = string;
                    return _this.handler(null, {method: 'replaceWith'});
                } else {
                    error('notType', '', 'replaceWith', 'string');
                }
            });
        };
        v.prototype.text = function (contents) {
            var output = [];
            _this.for(_this.nodes, function (i) {
                if (!contents) {
                    output.push(i.textContent);
                } else {
                    i.textContent = contents;
                }
            });
            return contents ? _this.handler(null, {method: 'text'}) : output;
        };
        v.prototype.insertBefore = function (el1, el2) {
            _this.for(_this.nodes, function (i) {
                i.insertBefore(el1, el2);
            });
            return _this.handler(null, {method: 'insertBefore'});
        };
        v.prototype.prepend = function (el) {
            var _element = queryElement(el);
            _this.for(_this.nodes, function (i) {
                i.insertBefore(_element, i.firstChild);
            });
            return _this.handler(null, {method: 'prepend'});
        };
        v.prototype.append = function (el) {
            var _element = queryElement(el);
            _this.for(_this.nodes, function (i) {
                i.appendChild(_element);
            });
            return _this.handler(null, {method: 'append'});
        };
        v.prototype.after = function (string) {
            _this.for(_this.nodes, function (i) {
                i.insertAdjacentHTML('afterend', string);
            });
            return _this.handler(null, {method: 'after'});
        };
        v.prototype.before = function (string) {
            _this.for(_this.nodes, function (i) {
                i.insertAdjacentHTML('beforebegin', string);
            });
            return _this.handler(null, {method: 'before'});
        };
        v.prototype.contains = function (text) {
            var textContent = null;
            if (_this.nonElement) {
                textContent = _this.nonElement;
            } else {
                textContent = _this.node.textContent;
            }
            var bool = _this.includes(_this.node.textContent, text);
            return bool;
        };
        v.prototype.is = function (el) {
            var _el = queryElement(el);
            return _this.node === _el;
        };
        v.prototype.inViewport = function () {
            var rect = _this.rect();
            return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
        };
        v.prototype.inIframe = function () {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        };
        v.prototype.trim = function (string) {
            string = queryParameter(string, true);
            return string.trim();
        };
        // Used by attr method 驼峰式命名
        v.prototype.camelize = function (string) {
            string = queryParameter(string, false);
            return string.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
                return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
            }).replace(/\s+/g, '').replace(/[-_]+/g, '');
        };
        v.prototype.decamelize = function (string) {
            string = queryParameter(string, false);
            return string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1-$2$3').replace(/^./, function (str) {
                return str.toLowerCase();
            });
        };
        v.prototype.noConflict = function () {
            var _v = v;
            window.v = window.oldV;
            return _v;
        };
        // Aliases
        v.prototype = {
            get n() {
                return this.node;
            },
            get ns() {
                return this.nodes;
            },
            get ne() {
                return this.nonElement;
            }
        };
    };
    window.v = v;
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = v;
    } else {
        if (typeof define === 'function' && define.amd) {
            define([], function () {
                return v;
            });
        }
    }
})();
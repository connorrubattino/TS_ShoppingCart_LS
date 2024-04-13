/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var v1 = __webpack_require__(2);
var v4 = __webpack_require__(5);

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;


/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var rng = __webpack_require__(3);
var bytesToUuid = __webpack_require__(4);

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/uuidjs/uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;


/***/ }),
/* 3 */
/***/ ((module) => {

// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}


/***/ }),
/* 4 */
/***/ ((module) => {

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]
  ]).join('');
}

module.exports = bytesToUuid;


/***/ }),
/* 5 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var rng = __webpack_require__(3);
var bytesToUuid = __webpack_require__(4);

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
//import { Shop, Item, User } from './Cart';
const uuid_1 = __webpack_require__(1);
class Container {
    constructor(_backgroundColor = 'white', _borderColor = 'black', _borderRadius = '0px', _borderWidth = '1px', _borderStyle = 'solid', _zIndex = 0) {
        this._backgroundColor = _backgroundColor;
        this._borderColor = _borderColor;
        this._borderRadius = _borderRadius;
        this._borderWidth = _borderWidth;
        this._borderStyle = _borderStyle;
        this._zIndex = _zIndex;
    }
    get attributes() {
        return {
            backgroundColor: this.backgroundColor,
            borderColor: this.borderColor,
            borderRadius: this.borderRadius,
            borderWidth: this.borderWidth,
            borderStyle: this.borderStyle,
            zIndex: this.zIndex
        };
    }
    get zIndex() {
        return this._zIndex;
    }
    set zIndex(value) {
        this._zIndex = value;
    }
    get borderStyle() {
        return this._borderStyle;
    }
    set borderStyle(value) {
        this._borderStyle = value;
    }
    get borderWidth() {
        return this._borderWidth;
    }
    set borderWidth(value) {
        this._borderWidth = value;
    }
    get borderRadius() {
        return this._borderRadius;
    }
    set borderRadius(value) {
        this._borderRadius = value;
    }
    get borderColor() {
        return this._borderColor;
    }
    set borderColor(value) {
        this._borderColor = value;
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        this._backgroundColor = value;
    }
}
class ItemContainer extends Container {
    constructor() {
        super();
        this.borderRadius = '10%';
    }
}
class Item {
    get shop() {
        return this._shop;
    }
    set shop(value) {
        this._shop = value;
    }
    get shape() {
        return this._shape;
    }
    set shape(value) {
        this._shape = value;
    }
    get content() {
        return this._content;
    }
    set content(value) {
        this._content = value;
    }
    get locationLeft() {
        return this._locationLeft;
    }
    set locationLeft(value) {
        this._locationLeft = value;
    }
    get locationTop() {
        return this._locationTop;
    }
    set locationTop(value) {
        this._locationTop = value;
    }
    get height() {
        return this._height;
    }
    set height(value) {
        this._height = value;
    }
    get width() {
        return this._width;
    }
    set width(value) {
        this._width = value;
    }
    constructor(_id = (0, uuid_1.v4)(), _name, _price, _description, _width = 2, _height = 2, _locationTop = 3, _locationLeft = 5, _content = `<div></div>`, _shape = new ItemContainer(), _shop) {
        this._id = _id;
        this._name = _name;
        this._price = _price;
        this._description = _description;
        this._width = _width;
        this._height = _height;
        this._locationTop = _locationTop;
        this._locationLeft = _locationLeft;
        this._content = _content;
        this._shape = _shape;
        this._shop = _shop;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get price() {
        return this._price;
    }
    set price(value) {
        this._price = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get id() {
        return this._id;
    }
    itemElement() {
        let itemCard = document.createElement('div');
        itemCard.id = this.id;
        itemCard.innerHTML = `<div class="card text-center mb-3" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">${this.name}</h5>
          <p class="card-text">${this.description}</p>
          <p class="card-text">$${this.price}</p>
          <a href="#" id="${this.id}-add" class="btn btn-primary">Add To Cart</a>
        </div>
      </div>`;
        console.log(itemCard.innerHTML);
        let addButton = itemCard.querySelector(`#${this.id}-add`);
        addButton === null || addButton === void 0 ? void 0 : addButton.addEventListener('click', () => {
            Shop.myUser.addToCart(this);
        });
        return itemCard;
    }
}
class Shop {
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = Object.assign(Object.assign({}, this.state), value);
        this.render();
    }
    constructor(_items = [], _state = {}, parent = document.body) {
        this._items = _items;
        this._state = _state;
        this.parent = parent;
        this.parent.innerHTML = '';
        this.parent.id = 'shop';
        const newStyle = {
            display: 'grid',
            backgroundImage: 'url(f256fa53f4a71faeafdc7d83ece05548.jpg)',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'repeat(12, 1fr)',
            height: '100vh',
            columnGap: '5px',
            rowGap: '5px',
            aspectRatio: '1 / 1'
        };
        Object.assign(this.parent.style, newStyle);
        const shopContainer = document.getElementById('shop');
        if (shopContainer) {
            shopContainer.style.display = 'grid';
            shopContainer.style.gridTemplateColumns = 'repeat(12, 1fr)';
            shopContainer.style.gridTemplateRows = 'repeat(12, 1fr)';
        }
        // this._items.push(new Item(uuidv4(), 'Golf Ball Sleeve', 15, 'ProV-1 or ProV-1X'));
        // this._items.push(new Item(uuidv4(), 'TaylorMade Driver', 650, 'The newest driving technology on the planet'));
        // this._items.push(new Item(uuidv4(), 'Golf Glove', 25, 'Pro-dry - includes ball marker magnet'));
        // this._items.push(new Item(uuidv4(), 'Electric Push Cart', 1500, 'Never carry your bag again(as long as you bring your remote)'));
        // this._items.push(new Item(uuidv4(), 'Travis Mathew Golf Polo', 75, 'Comfortable material with new-age style'));
        // this._items.push(new Item(uuidv4(), 'Scotty Cameron Putter', 450, 'Top of the line putter from the most coveted brand in the game'));
        this.render();
        this.showItems();
        Shop.myUser.cart = [];
    }
    get items() {
        return this._items;
    }
    set items(value) {
        this._items = value;
    }
    static loginUser(event) {
        event.preventDefault();
        let nameInput = document.getElementById('name').value;
        let ageInput = parseInt(document.getElementById('age').value);
        Shop.myUser = User.createUser(nameInput, ageInput);
        const items = [
            new Item((0, uuid_1.v4)(), 'Golf Ball Sleeve', 15, 'ProV-1 or ProV-1X', 3, 3, 2, 2),
            new Item((0, uuid_1.v4)(), 'TaylorMade Driver', 650, 'The newest driving technology on the planet', 3, 3, 2, 6),
            new Item((0, uuid_1.v4)(), 'Golf Glove', 25, 'Pro-dry - includes ball marker magnet', 3, 3, 2, 10),
            new Item((0, uuid_1.v4)(), 'Electric Push Cart', 1500, 'Never carry your bag again(as long as you bring your remote)', 3, 3, 6, 2),
            new Item((0, uuid_1.v4)(), 'Travis Mathew Golf Polo', 75, 'Comfortable material with new-age style', 3, 3, 6, 6),
            new Item((0, uuid_1.v4)(), 'Scotty Cameron Putter', 450, 'Top of the line putter from the most coveted brand in the game', 3, 3, 6, 10),
        ];
        const shop = new Shop(items);
        shop.showItems();
    }
    initializeItemDiv(item) {
        let div = document.createElement('div');
        div.id = item.id;
        const newStyle = {
            margin: 'auto',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            padding: '3%',
            aspectRatio: '1 / 1'
        };
        // Set the div styling
        Object.assign(div.style, newStyle);
        // Set up the shape for the component
        Object.assign(div.style, item.shape.attributes);
        // Set the innerHTML of the div to the component's content
        div.innerHTML = item.content;
        return div;
    }
    render() {
        this.parent.innerHTML = '';
        for (let item of this.items) {
            let div = this.initializeItemDiv(item);
            this.placeItem(item, div);
            this.injectState(item, div);
        }
    }
    placeItem(item, div) {
        const newStyle = {
            gridColumnStart: item.locationLeft.toString(),
            gridColumnEnd: "span " + item.width,
            gridRowStart: item.locationTop.toString(),
            gridRowEnd: "span " + item.height
        };
        Object.assign(div.style, newStyle);
        this.parent.append(div);
    }
    showItems() {
        // const shopDiv = document.getElementById('shop')
        // if (shopDiv) {
        //     for (let item of this.items){
        //         shopDiv.appendChild(item.itemElement());
        //     }
        // } else {
        //     console.error('Error - no shop found')
        // }
        var _a;
        for (let item of this.items) {
            (_a = document.getElementById("shop")) === null || _a === void 0 ? void 0 : _a.appendChild(item.itemElement());
            let div = this.initializeItemDiv(item);
            this.placeItem(item, div);
        }
    }
    static updateCart() {
    }
    injectState(item, div) {
        div.innerHTML = item.content;
        let key;
        for (key in this.state) {
            if (div.innerHTML.includes(`{{ ${key} }}`)) {
                div.innerHTML = div.innerHTML.split(`{{ ${key} }}`).join(this.state[key]);
            }
        }
    }
    addItem(item) {
        // Add the component to the canvas's components array
        this.items.push(item);
        // Set the component's canvas property to this canvas
        item.shop = this;
        // Render the components
        this.render();
    }
}
class User {
    constructor(
    // private readonly _id: string = uuidv4(),//DO I EVEN NEED ID?
    _name, _age, _cart) {
        this._name = _name;
        this._age = _age;
        this._cart = _cart;
    }
    get cart() {
        return this._cart;
    }
    set cart(value) {
        this._cart = value;
    }
    get age() {
        return this._age;
    }
    set age(value) {
        this._age = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    // public get id(): string {
    //     return this._id;
    // }
    static createUser(name, age) {
        return new User(name, age, []);
    }
    addToCart(item) {
        this.cart.push(item);
    }
    removeFromCart(item) {
        this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
    }
    removeQuantityFromCart(item, quantity) {
        for (let i = 0; i < quantity; i++) {
            let indexOfItem = this.cart.findIndex(cartItem => cartItem.id == item.id);
            this.cart.splice(indexOfItem, 1);
        }
    }
    addRemoveEventListeners() {
    }
}
const loginPress = document.getElementById('login');
if (loginPress) {
    loginPress.addEventListener('click', (event) => {
        Shop.loginUser(event);
    });
}
else {
    console.error('no login');
}
(_a = document
    .getElementById('login')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (e) => Shop.loginUser(e));

})();

/******/ })()
;
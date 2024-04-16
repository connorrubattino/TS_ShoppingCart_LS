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

Object.defineProperty(exports, "__esModule", ({ value: true }));
const uuid_1 = __webpack_require__(1);
class Item {
    constructor(_id = (0, uuid_1.v4)(), _name, _price, _description) {
        this._id = _id;
        this._name = _name;
        this._price = _price;
        this._description = _description;
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
        const itemCard = document.createElement('div');
        itemCard.classList.add('item', 'card');
        itemCard.innerHTML =
            `<h5 class="card-title">${this.name}</h5>
            <p class="card-text">${this.description}</p>
            <p class="card-text">$${this.price}</p>
            <button href="#" id="${this.id}-add" class="btn btn-primary">Add To Cart</button>`;
        const addButton = itemCard.querySelector(`#${this.id}-add`);
        addButton.addEventListener('click', () => {
            Shop.myUser.addToCart(this);
        });
        return itemCard;
    }
}
class Shop {
    constructor(_items = []) {
        this._items = _items;
        this._items.push(new Item((0, uuid_1.v4)(), 'Golf Ball Sleeve', 15, 'ProV-1 or ProV-1X'));
        this._items.push(new Item((0, uuid_1.v4)(), 'TaylorMade Driver', 650, 'The newest driving technology on the planet'));
        this._items.push(new Item((0, uuid_1.v4)(), 'Golf Glove', 25, 'Pro-dry - includes ball marker magnet'));
        this._items.push(new Item((0, uuid_1.v4)(), 'Electric Push Cart', 1500, 'Never carry your bag again(as long as you bring your remote)'));
        this._items.push(new Item((0, uuid_1.v4)(), 'Travis Mathew Golf Polo', 75, 'Comfortable material with new-age style'));
        this._items.push(new Item((0, uuid_1.v4)(), 'Scotty Cameron Putter', 450, 'Top of the line putter from the most coveted brand in the game'));
        this.showItems();
        Shop.myUser.cart = [];
        Shop.updateCart();
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
        Shop.myUser = User.createUser();
        new Shop();
        if (Shop.myUser) {
            document.getElementById('inputs').remove();
        }
    }
    showItems() {
        const shop = document.getElementById('shop');
        for (const item of this.items) {
            shop.appendChild(item.itemElement());
        }
    }
    static updateCart() {
        const cartDiv = document.getElementById('cart');
        if (Shop.myUser.cart.length <= 0) {
            cartDiv.innerHTML = "<H2>No Items Currently in Cart</H2>";
        }
        else {
            cartDiv.replaceChildren(Shop.myUser.cartHTMLElement());
            cartDiv.innerHTML = ("<H2>Cart</H2>" + cartDiv.innerHTML);
            Shop.myUser.addRemoveEventListeners();
        }
    }
}
class User {
    constructor(name, age) {
        this._id = (0, uuid_1.v4)();
        this._name = name;
        this._age = age;
        this._cart = [];
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
    get id() {
        return this._id;
    }
    static createUser() {
        const name = document.getElementById('name').value;
        const age = parseInt(document.getElementById('age').value);
        if (age > 0 && name.length > 0) {
            return new User(name, age);
        }
        return;
    }
    addToCart(item) {
        this.cart.push(item);
        Shop.updateCart();
    }
    showCart() {
        for (let item of this.cart) {
            console.log(item.name);
        }
    }
    cartTotal() {
        let tot = 0;
        for (let item of this.cart) {
            tot += item.price;
        }
        return tot;
    }
    itemQuantity(item) {
        const quant = this.cart.filter(thisItem => thisItem.id === item.id).length;
        return quant;
    }
    removeFromCart(item) {
        this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
        Shop.updateCart();
    }
    removeQuantityFromCart(item, quantity) {
        for (let i = 0; i < quantity; i++) {
            let indexOfItem = this.cart.findIndex(cartItem => cartItem.id == item.id);
            this.cart.splice(indexOfItem, 1);
        }
        Shop.updateCart();
    }
    cartHTMLElement() {
        const cartItems = document.createElement('div');
        cartItems.classList.add('all-cart-items', 'bg-success-subtle', 'bg-rounded');
        for (const item of new Set(this.cart)) {
            const cartItem = document.createElement('div');
            cartItem.classList.add('mt-4', 'mb-2');
            cartItem.textContent = `${this.itemQuantity(item)} ~~ ${item.name} @ $${item.price}`;
            const removeAllButton = document.createElement('button');
            removeAllButton.textContent = 'Clear';
            removeAllButton.classList.add('btn', `${item.id}-remove`, 'btn-outline-success', 'ms-4', 'ps-4');
            removeAllButton.id = `${item.id}-remove`;
            const removeOneButton = document.createElement('button');
            removeOneButton.textContent = '-1';
            removeOneButton.classList.add('btn', `${item.id}-remove-one`, 'btn-outline-success', 'ms-4', 'ps-4');
            removeOneButton.id = `${item.id}-remove-one`;
            cartItem.appendChild(removeAllButton);
            cartItem.appendChild(removeOneButton);
            cartItems.appendChild(cartItem);
        }
        const cartTot = document.createElement('div');
        cartTot.textContent = `Total - $${this.cartTotal()}`;
        cartItems.appendChild(cartTot);
        return cartItems;
    }
    addRemoveEventListeners() {
        this._cart.forEach(item => {
            const removeAll = document.querySelectorAll(`.${item.id}-remove`);
            removeAll.forEach(button => {
                button.addEventListener("click", () => Shop.myUser.removeFromCart(item));
            });
            const removeOne = document.getElementById(`${item.id}-remove-one`) || null;
            if (removeOne) {
                removeOne.onclick = () => { var _a; return (_a = Shop.myUser) === null || _a === void 0 ? void 0 : _a.removeQuantityFromCart(item, 1); };
            }
            ;
        });
    }
}
const loginPress = document.getElementById('login');
if (loginPress) {
    loginPress.addEventListener('click', (event) => {
        Shop.loginUser(event);
    });
}
else {
    console.error('no login button');
}
document
    .getElementById('login')
    .addEventListener('click', (e) => Shop.loginUser(e));

})();

/******/ })()
;
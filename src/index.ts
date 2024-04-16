import { v4 as uuidv4 } from "uuid";

class Item {
    constructor(
        private readonly _id: string = uuidv4(),
        private _name: string,
        private _price: number,
        private _description: string,
    ) { }
    public get description(): string {
        return this._description;
    }
    public set description(value: string) {
        this._description = value;
    }
    public get price(): number {
        return this._price;
    }
    public set price(value: number) {
        this._price = value;
    }
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
    public get id(): string {
        return this._id;
    }

    public itemElement(): HTMLDivElement {
        const itemCard = document.createElement('div');
        itemCard.classList.add('item', 'card');
        itemCard.innerHTML = 
            `<h5 class="card-title">${this.name}</h5>
            <p class="card-text">${this.description}</p>
            <p class="card-text">$${this.price}</p>
            <button href="#" id="${this.id}-add" class="btn btn-primary">Add To Cart</button>`;

        const addButton = itemCard.querySelector(`#${this.id}-add`) as HTMLButtonElement;
        addButton.addEventListener('click', () => {
            Shop.myUser!.addToCart(this)
        });
        return itemCard
    }

}


class Shop {
    static myUser: User | undefined;

    constructor(
        private _items: Item[] = [],

    ) {

        this._items.push(new Item(uuidv4(), 'Golf Ball Sleeve', 15, 'ProV-1 or ProV-1X'));
        this._items.push(new Item(uuidv4(), 'TaylorMade Driver', 650, 'The newest driving technology on the planet'));
        this._items.push(new Item(uuidv4(), 'Golf Glove', 25, 'Pro-dry - includes ball marker magnet'));
        this._items.push(new Item(uuidv4(), 'Electric Push Cart', 1500, 'Never carry your bag again(as long as you bring your remote)'));
        this._items.push(new Item(uuidv4(), 'Travis Mathew Golf Polo', 75, 'Comfortable material with new-age style'));
        this._items.push(new Item(uuidv4(), 'Scotty Cameron Putter', 450, 'Top of the line putter from the most coveted brand in the game'));

        this.showItems();
        Shop.myUser!.cart = [];
        Shop.updateCart();
    }
    public get items(): Item[] {
        return this._items;
    }
    public set items(value: Item[]) {
        this._items = value;
    }

    static loginUser(event: Event): void {
        event.preventDefault();
        let nameInput = (<HTMLInputElement>document.getElementById('name')).value;
        let ageInput = parseInt((<HTMLInputElement>document.getElementById('age')).value);
        Shop.myUser = User.createUser()
        new Shop();
        if (Shop.myUser){
            document.getElementById('inputs')!.remove()
        }



    }

    public showItems() {
        const shop = document.getElementById('shop');
        for (const item of this.items) {
            shop!.appendChild(item.itemElement());
        }

    }

    static updateCart() {
        const cartDiv = document.getElementById('cart') as HTMLElement;
        if (Shop.myUser!.cart.length <= 0){
            cartDiv.innerHTML = "<H2>No Items Currently in Cart</H2>"
        } else {
            cartDiv.replaceChildren(Shop.myUser!.cartHTMLElement());
            cartDiv.innerHTML = ("<H2>Cart</H2>" + cartDiv.innerHTML);
            Shop.myUser!.addRemoveEventListeners();
        }
    }


}

class User {
    private _id: string;
    private _name: string;
    private _age: number;
    private _cart: Item[];

    constructor(name:string, age:number){
        this._id = uuidv4();
        this._name = name;
        this._age = age;
        this._cart = [];
    }

    public get cart(): Item[] {
        return this._cart;
    }
    public set cart(value: Item[]) {
        this._cart = value;
    }
    public get age(): number {
        return this._age;
    }
    public set age(value: number) {
        this._age = value;
    }
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
    public get id(): string {
        return this._id;
    }

    static createUser(): User | undefined {
        const name = (<HTMLInputElement>document.getElementById('name')).value;
        const age = parseInt((<HTMLInputElement>document.getElementById('age')).value);
        if (age > 0 && name.length >0) {
            return new User(name, age)
        } 
        return;  
    }

    public addToCart(item: Item): void {
        this.cart.push(item);
        Shop.updateCart()
    }


    public showCart():void{
        for (let item of this.cart){
            console.log(item.name);
        }
    }


    public cartTotal():number {
        let tot = 0
        for (let item of this.cart){
            tot += item.price
        }
        return tot;
    }

    public itemQuantity(item:Item):number{
        const quant = this.cart.filter(thisItem => thisItem.id === item.id).length;
        return quant
    }


    public removeFromCart(item: Item): void {
        this.cart = this.cart.filter(cartItem => cartItem.id !== item.id)
        Shop.updateCart();
    }

    public removeQuantityFromCart(item: Item, quantity: number): void {
        for (let i = 0; i < quantity; i++) {
            let indexOfItem = this.cart.findIndex(cartItem => cartItem.id == item.id)
            this.cart.splice(indexOfItem, 1);
        }
        Shop.updateCart();
    }


    public cartHTMLElement():HTMLDivElement {
        const cartItems = document.createElement('div');
        cartItems.classList.add('all-cart-items', 'bg-success-subtle', 'bg-rounded')
        for (const item of new Set(this.cart)) {
            const cartItem = document.createElement('div');
            cartItem.classList.add('mt-4', 'mb-2')
            cartItem.textContent = `${this.itemQuantity(item)} ~~ ${item.name} @ $${item.price}`

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
        cartItems.appendChild(cartTot)
        return cartItems;
    }

    public addRemoveEventListeners(): void {
        this._cart.forEach(item => {
            const removeAll = document.querySelectorAll(`.${item.id}-remove`);
            removeAll.forEach(button => {
                button.addEventListener("click", () => Shop.myUser!.removeFromCart(item));
            });
            const removeOne = document.getElementById(`${item.id}-remove-one`) as HTMLButtonElement||null;
            if (removeOne) {removeOne.onclick = () => Shop.myUser?.removeQuantityFromCart(item, 1);
            };
        });
    }

}

const loginPress = document.getElementById('login');
if (loginPress) {
    loginPress.addEventListener('click', (event) => {
        Shop.loginUser(event);
    });
} else {
    console.error('no login button')
}


document
    .getElementById('login')!
    .addEventListener('click', (e: Event) => Shop.loginUser(e))
//import { Shop, Item, User } from './Cart';
import { v4 as uuidv4 } from "uuid";

// const loginPress = document.getElementById('login');
// if (loginPress){
//     loginPress.addEventListener('click', (event) => {
//         Shop.loginUser(event);
//     });
// } else {
//     console.error('no login button')
// }


//trying all on one page

type GridUnit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

interface Containerable {
    backgroundColor: string
    borderColor: string
    borderRadius: string
    borderWidth: string
    borderStyle: string
    zIndex: number
    attributes: Partial<Containerable>
}

type State = {
    [key:string]: string
}

class Container implements Containerable {
    constructor(
        private _backgroundColor: string = 'white',
        private _borderColor: string = 'black',
        private _borderRadius: string = '0px',
        private _borderWidth: string = '1px',
        private _borderStyle: string = 'solid',
        private _zIndex: number = 0
    ){}

    public get attributes(): Partial<Containerable> {
        return {
            backgroundColor: this.backgroundColor,
            borderColor: this.borderColor,
            borderRadius: this.borderRadius,
            borderWidth: this.borderWidth,
            borderStyle: this.borderStyle,
            zIndex: this.zIndex
        }
    }

    public get zIndex(): number {
        return this._zIndex;
    }
    public set zIndex(value: number) {
        this._zIndex = value;
    }
    public get borderStyle(): string {
        return this._borderStyle;
    }
    public set borderStyle(value: string) {
        this._borderStyle = value;
    }
    public get borderWidth(): string {
        return this._borderWidth;
    }
    public set borderWidth(value: string) {
        this._borderWidth = value;
    }
    public get borderRadius(): string {
        return this._borderRadius;
    }
    public set borderRadius(value: string) {
        this._borderRadius = value;
    }
    public get borderColor(): string {
        return this._borderColor;
    }
    public set borderColor(value: string) {
        this._borderColor = value;
    }
    public get backgroundColor(): string {
        return this._backgroundColor;
    }
    public set backgroundColor(value: string) {
        this._backgroundColor = value;
    }
}

class ItemContainer extends Container {
    constructor(){
        super()
        this.borderRadius = '10%'
    }
}


class Item {
    public get shop(): Shop|undefined {
        return this._shop;
    }
    public set shop(value: Shop) {
        this._shop = value;
    }
    public get shape(): Container {
        return this._shape;
    }
    public set shape(value: Container) {
        this._shape = value;
    }
    public get content(): string {
        return this._content;
    }
    public set content(value: string) {
        this._content = value;
    }
    public get locationLeft(): GridUnit {
        return this._locationLeft;
    }
    public set locationLeft(value: GridUnit) {
        this._locationLeft = value;
    }
    public get locationTop(): GridUnit {
        return this._locationTop;
    }
    public set locationTop(value: GridUnit) {
        this._locationTop = value;
    }
    public get height(): GridUnit {
        return this._height;
    }
    public set height(value: GridUnit) {
        this._height = value;
    }
    public get width(): GridUnit {
        return this._width;
    }
    public set width(value: GridUnit) {
        this._width = value;
    }
    constructor(
        private readonly _id: string = uuidv4(),
        private _name: string,
        private _price: number,
        private _description: string,
        private _width: GridUnit = 2,
        private _height: GridUnit = 2,
        private _locationTop: GridUnit = 3,
        private _locationLeft: GridUnit = 5,
        private _content: string = `<div></div>`,
        private _shape: Container = new ItemContainer(),
        private _shop?: Shop
    ){}
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

    public itemElement():HTMLDivElement{
        let itemCard = document.createElement('div');
        itemCard.id = this.id
        itemCard.innerHTML = `<div class="card text-center mb-3" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">${this.name}</h5>
          <p class="card-text">${this.description}</p>
          <p class="card-text">$${this.price}</p>
          <a href="#" id="${this.id}-add" class="btn btn-primary">Add To Cart</a>
        </div>
      </div>`

      console.log(itemCard.innerHTML)
        
        let addButton = itemCard.querySelector(`#${this.id}-add`);
        addButton?.addEventListener('click', () => {
            Shop.myUser.addToCart(this)
      });

            return itemCard
    }


}


class Shop{
    public get state(): State {
        return this._state;
    }
    public set state(value: State) {
        this._state = {...this.state,...value};
        this.render()
    }
    static myUser: User //| undefined

    constructor(
        private _items: Item[] = [],
        private _state: State = {},
        private parent:HTMLElement = document.body

    ){
        this.parent.innerHTML = '';
        this.parent.id = 'shop';
        const newStyle: Partial<CSSStyleDeclaration> = {
            display: 'grid',
            backgroundImage:'url(f256fa53f4a71faeafdc7d83ece05548.jpg)',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'repeat(12, 1fr)',
            height: '100vh',
            columnGap: '5px',
            rowGap: '5px',
            aspectRatio: '1 / 1'
        }
        Object.assign(this.parent.style, newStyle);

        const shopContainer = document.getElementById('shop')
        if(shopContainer){
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
        Shop.myUser.cart =[];
    }
    public get items(): Item[] {
        return this._items;
    }
    public set items(value: Item[]) {
        this._items = value;
    }

    static loginUser(event:Event):void {
        event.preventDefault();
        let nameInput = (<HTMLInputElement>document.getElementById('name')).value;
        let ageInput = parseInt((<HTMLInputElement>document.getElementById('age')).value);
        Shop.myUser = User.createUser(nameInput, ageInput);
        const items = [
                new Item(uuidv4(), 'Golf Ball Sleeve', 15, 'ProV-1 or ProV-1X', 3, 3, 2, 2),
                new Item(uuidv4(), 'TaylorMade Driver', 650, 'The newest driving technology on the planet', 3, 3, 2, 6),
                new Item(uuidv4(), 'Golf Glove', 25, 'Pro-dry - includes ball marker magnet', 3, 3, 2, 10),
                new Item(uuidv4(), 'Electric Push Cart', 1500, 'Never carry your bag again(as long as you bring your remote)', 3, 3, 6, 2),
                new Item(uuidv4(), 'Travis Mathew Golf Polo', 75, 'Comfortable material with new-age style', 3, 3, 6, 6),
                new Item(uuidv4(), 'Scotty Cameron Putter', 450, 'Top of the line putter from the most coveted brand in the game', 3, 3, 6, 10),
         ]
        const shop = new Shop(items); 
        shop.showItems();


    }



    private initializeItemDiv(item:Item):HTMLDivElement {
        let div = document.createElement('div');
        div.id = item.id
        const newStyle: Partial<CSSStyleDeclaration> = {
            margin: 'auto',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            padding: '3%',
            aspectRatio:'1 / 1'
        }
        // Set the div styling
        Object.assign(div.style, newStyle);
        // Set up the shape for the component
        Object.assign(div.style, item.shape.attributes);
        // Set the innerHTML of the div to the component's content
        div.innerHTML = item.content
        return div
    }



    private render():void{
        this.parent.innerHTML = '';
        for (let item of this.items){
            let div = this.initializeItemDiv(item);
            this.placeItem(item, div);
            this.injectState(item, div)

        }
    }



    private placeItem(item:Item, div: HTMLDivElement):void {
        const newStyle: Partial<CSSStyleDeclaration> = {
            gridColumnStart: item.locationLeft.toString(),
            gridColumnEnd: "span " + item.width,
            gridRowStart: item.locationTop.toString(),
            gridRowEnd: "span " + item.height
        }
        Object.assign(div.style, newStyle);
        this.parent.append(div);
    }

    public showItems() {
        // const shopDiv = document.getElementById('shop')
        // if (shopDiv) {
        //     for (let item of this.items){
        //         shopDiv.appendChild(item.itemElement());
        //     }
        // } else {
        //     console.error('Error - no shop found')
        // }

        for (let item of this.items) {
            document.getElementById("shop")?.appendChild(item.itemElement());
            let div = this.initializeItemDiv(item);
            this.placeItem(item, div)
        }
        
    }
    

    static updateCart() {
        
    }


    private injectState(item:Item, div:HTMLDivElement):void {
        div.innerHTML = item.content;
        let key: keyof State;
        for (key in this.state){
            if (div.innerHTML.includes(`{{ ${key} }}`)){
                div.innerHTML = div.innerHTML.split(`{{ ${key} }}`).join(this.state[key])
            }
        }
    }

    public addItem(item:Item):void{
        // Add the component to the canvas's components array
        this.items.push(item);
        // Set the component's canvas property to this canvas
        item.shop = this
        // Render the components
        this.render()
    }


}




class User{
    constructor(
        // private readonly _id: string = uuidv4(),//DO I EVEN NEED ID?
        private _name: string,
        private _age: number,
        private _cart: Item[]
    ){}

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
    // public get id(): string {
    //     return this._id;
    // }

    static createUser(name:string, age:number):User {
        return new User(name, age, [])
    }

    public addToCart(item:Item):void{
        this.cart.push(item)
    }

    public removeFromCart(item:Item):void{
        this.cart = this.cart.filter(cartItem => cartItem.id !== item.id)
    }

    public removeQuantityFromCart(item:Item, quantity:number):void{
        for (let i=0; i < quantity; i++){
            let indexOfItem = this.cart.findIndex(cartItem => cartItem.id == item.id)
            this.cart.splice(indexOfItem, 1);
        }
    }

    addRemoveEventListeners(){

    }

}

const loginPress = document.getElementById('login');
if (loginPress){
    loginPress.addEventListener('click', (event) => {
        Shop.loginUser(event);
    });
} else {
    console.error('no login')
}

document
.getElementById('login')
?.addEventListener('click', (e: Event)=>Shop.loginUser(e))

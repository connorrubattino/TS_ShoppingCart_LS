import { v4 as uuidv4 } from "uuid";
import Item from './Item';
import User from './User';

export default class Shop{
    static myUser: User //when I add in '| undefined' it wont let me call my add to cart function because it might be undefined

    constructor(
        private _items: Item[] = [],
    ){
        this._items.push(new Item(uuidv4(), 'Golf Ball Sleeve', 15, 'ProV-1 or ProV-1X'))
        this._items.push(new Item(uuidv4(), 'TaylorMade Driver', 650, 'The newest driving technology on the planet'))
        this._items.push(new Item(uuidv4(), 'Golf Glove', 25, 'Pro-dry - includes ball marker magnet'))
        this._items.push(new Item(uuidv4(), 'Electric Push Cart', 1500, 'Never carry your bag again(as long as you bring your remote)'))
        this._items.push(new Item(uuidv4(), 'Travis Mathew Golf Polo', 75, 'Comfortable material with new-age style'))
        this._items.push(new Item(uuidv4(), 'Scotty Cameron Putter', 450, 'Top of the line putter from the most coveted brand in the game'))
    
        this.showItems();
        Shop.myUser.cart =[];
        Shop.updateCart();
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
        Shop.myUser = User.createUser(nameInput, ageInput)
        new Shop();



    }

    public showItems() {
        const shopDiv = document.getElementById('shop')
        if (shopDiv) {
            for (let item of this.items){
                shopDiv.appendChild(item.itemElement());
            }
        } else {
            console.error('Error - no shop found')
        }

    // for (let item of this.items) {
    //     document.getElementById("shop")?.appendChild(item.itemElement());
    // }
        
    }

    static updateCart() {
        
    }


}
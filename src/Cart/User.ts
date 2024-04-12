import { v4 as uuidv4 } from "uuid";
import Item from './Item';
import Shop from './Shop';


export default class User{
    constructor(
        private readonly _id: string = uuidv4(),
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
    public get id(): string {
        return this._id;
    }

    static createUser(name:string, age:number):User {
        return new User(uuidv4(), name, age, [])
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
    console.error('no login button')
}

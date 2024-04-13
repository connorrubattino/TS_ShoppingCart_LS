// import { v4 as uuidv4 } from "uuid";
// import Shop from './Shop';
// import User from './User';


// export default class Item{
//     constructor(
//         private readonly _id: string = uuidv4(),
//         private _name: string,
//         private _price: number,
//         private _description: string,
//     ){}
//     public get description(): string {
//         return this._description;
//     }
//     public set description(value: string) {
//         this._description = value;
//     }
//     public get price(): number {
//         return this._price;
//     }
//     public set price(value: number) {
//         this._price = value;
//     }
//     public get name(): string {
//         return this._name;
//     }
//     public set name(value: string) {
//         this._name = value;
//     }
//     public get id(): string {
//         return this._id;
//     }

//     public itemElement():HTMLDivElement{
//         let itemCard = document.createElement('div');
//         itemCard.innerHTML = `<div class="card text-center mb-3" style="width: 18rem;">
//         <div class="card-body">
//           <h5 class="card-title">${this.name}</h5>
//           <p class="card-text">${this.description}</p>
//           <p class="card-text">$${this.price}</p>
//           <a href="#" id="${this.id}-add" class="btn btn-primary">Add To Cart</a>
//         </div>
//       </div>`
        
//         let addButton = itemCard.querySelector(`#${this.id}-add`);
//         addButton?.addEventListener('click', () => {
//             Shop.myUser.addToCart(this)
//       });

//             return itemCard
//     }

// }
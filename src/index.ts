import { Shop, Item, User } from './Cart';

const loginPress = document.getElementById('login');
if (loginPress){
    loginPress.addEventListener('click', (event) => {
        Shop.loginUser(event);
    });
} else {
    console.error('no login button')
}
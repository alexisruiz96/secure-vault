"use strict";
let add;
add = (a, b) => {
    return a + b;
};
class Person {
    constructor(n) {
        this.age = 30;
        if (n) {
            this.name = n;
        }
    }
    greet(phrase) {
        if (this.name) {
            console.log(phrase + ' ' + this.name);
        }
        else {
            console.log('Hi');
        }
    }
}
let user1;
user1 = new Person('Max');
// user1.name = 'Manu'
user1.greet('hola');
console.log(user1);
//# sourceMappingURL=app.js.map
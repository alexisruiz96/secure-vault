"use strict";
//Generic types
// const names: Array<string> = []; //string[]
// names[0].split(' ');
//indicamos que devuelve un string esa promise
// const promise: Promise<string> = new Promise((resolve,reject) => {
//      setTimeout(() => {
//         resolve('This is done!');
//     },2000);
// });
// promise.then(data => {
//     data.split(' ');
// })
//lo que ponemos en los diamantes es para indicar restricciones en el tipo 
//que queremos recibir
function merge(objA, objB) {
    return Object.assign(objA, objB);
}
const mergedObj = merge({ name: 'Ama', hobbies: ['Sports'] }, { age: 30 });
console.log(mergedObj);
//revisar leccion 97 de Generics
function countAndDescribe(element) {
    let descriptionText = 'Got no value.';
    if (element.length === 1) {
        descriptionText = 'Got 1 value';
    }
    else if (element.length > 1) {
        descriptionText = 'Got ' + element + ' elements.';
    }
    return [element, descriptionText];
}
console.log(countAndDescribe([10]));
function extractAndConvert(obj, key) {
    return 'Value ' + obj[key];
}
console.log(extractAndConvert({ name: 'Max' }, 'name'));
class DataStorage {
    constructor() {
        this.data = [];
    }
    addItem(item) {
        this.data.push(item);
    }
    removeItem(item) {
        if (this.data.indexOf(item) === -1) {
            return;
        }
        this.data.splice(this.data.indexOf(item), 1);
    }
    getItems() {
        return [...this.data];
    }
}
const textStorage = new DataStorage();
textStorage.addItem('Max');
textStorage.addItem('Manu');
const numberStorage = new DataStorage();
//no parece que lo vayas a usar Generic utilities
function createCouseGoal(title, description, date) {
    let courseGoal = {};
    courseGoal.title = title;
    courseGoal.description = description;
    courseGoal.completeUntil = date;
    return courseGoal;
}
;
const names = ['Max', 'Sports'];
// names.push('Manu');
//# sourceMappingURL=app.js.map
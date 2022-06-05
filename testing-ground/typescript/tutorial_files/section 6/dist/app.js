"use strict";
var _a;
const e1 = {
    name: 'Max',
    privileges: ['create-server'],
    startDate: new Date()
};
function add(a, b) {
    if (typeof a === 'string' || typeof b === 'string') {
        return a.toString(+b.toString());
    }
    return a + b;
}
const result = add('Max', 'Scwarch');
result.split(' ');
//in case we get an object we dont know if it has a property
const fetchedUserData = {
    id: 'u1',
    name: 'Max',
    job: { title: 'CEO', description: 'My company' }
};
//if you are not sure if you have the value
console.log((fetchedUserData === null || fetchedUserData === void 0 ? void 0 : fetchedUserData.job) && ((_a = fetchedUserData === null || fetchedUserData === void 0 ? void 0 : fetchedUserData.job) === null || _a === void 0 ? void 0 : _a.title));
const userInput = undefined;
//nullish coalescence if is null or undefined and not really other thing
const storedData = userInput !== null && userInput !== void 0 ? userInput : 'DEFAULT';
console.log(storedData);
// type UnknownEmployee = Employee | Admin;
// const printEmployeeINformation = (emp: UnknownEmployee) => {
//     console.log('Name: ' + emp.name);
//     if('privileges' in emp){
//         console.log('Privileges: ' + emp.privileges);
//     }
//     if('startDate' in emp){
//         console.log('Privileges: ' + emp.startDate);
//     }
// }
// printEmployeeINformation(e1);
// class Car {
//     drive() {
//         console.log('Driving');
//     }
// }
// class Truck {
//     drive() {
//         console.log('Driving a truck');
//     }
//     loadCargo(amount: number){
//         console.log('Loading cargo ' + amount);
//     }
// }
// type Vehicle = Car | Truck;
// const v1 = new Car();
// const v2 = new Truck();
// const useVehicle = (vehicle: Vehicle) => {
//     vehicle.drive();
//     if(vehicle instanceof Truck){
//         vehicle.loadCargo(1000);
//     }
// }
// useVehicle(v1);
// interface Bird {
//     type: 'bird';
//     flyingSpeed: number;
// }
// interface Horse {
//     type: 'horse';
//     runninSpeed: number;
// }
// type Animal = Bird | Horse;
// const moveAnimal = (animal: Animal) => {
//     let speed;
//     switch (animal.type) {
//         case 'bird':
//             speed = animal.flyingSpeed;
//             break;
//     case 'horse':
//         speed = animal.runninSpeed;
//         break;
//         default:
//             speed = 0;
//             break;
//     }
//     console.log('Moving at speed: ' + speed);
// }
// moveAnimal({type:'bird', flyingSpeed:20});
// const userInputELement = document.getElementById("user-input");
// console.log(userInputELement);
// if (userInputELement) {
//     (userInputELement as HTMLInputElement).value = 'Hi there!'
// }
// interface ErrorContainer { //{email: 'Not a valid email', username:'Must start with a character!'}
//     [prop: string]: string;
// }
// const errorBaf: ErrorContainer = {
//     email: 'Not a valid email',
//     username: 'Must start with a capital character!'
// };
//# sourceMappingURL=app.js.map
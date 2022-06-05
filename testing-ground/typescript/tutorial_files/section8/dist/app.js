"use strict";
// const Logger = (constructor: Function) => {
//     console.log('Logging...')
//     console.log(constructor);
// }
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const Logger = (logString) => {
    console.log('LOGGER FACTORY!');
    return (constructor) => {
        console.log(logString);
        console.log(constructor);
    };
};
const WithTemplate = (template, hookId) => {
    console.log('TEMPLATE FACTORY!');
    return (
    //el underscore se puede poner en los casos que sepamos que vayamos a recibir argumentos
    //pero que posiblemente no los utilicemos
    originalConstructor) => {
        return class extends originalConstructor {
            constructor(..._) {
                super();
                console.log('Template log');
                const hookEl = document.getElementById(hookId);
                if (hookEl) {
                    hookEl.innerHTML = template;
                    hookEl.querySelector('h1').textContent = this.name;
                }
            }
        };
    };
};
let Person = class Person {
    constructor() {
        this.name = 'Manx';
        console.log('Creating person object');
    }
};
Person = __decorate([
    Logger('LOGGING'),
    WithTemplate('<h1>My Person Object</h1>', 'app')
], Person);
const person = new Person();
console.log(person);
const Log = (target, propertyName) => {
    console.log('Property decorator');
    console.log(target, propertyName);
};
const Log2 = (target, name, descriptor) => {
    console.log('Accessor decorator!');
    console.log(target);
    console.log(descriptor);
    console.log(name);
};
const Log3 = (target, name, descriptor) => {
    console.log('Method decorator!');
    console.log(target);
    console.log(descriptor);
    console.log(name);
};
const Log4 = (target, name, position) => {
    console.log('Parameter decorator!');
    console.log(target);
    console.log(name);
    console.log(position);
};
class Product {
    constructor(t, p) {
        this.title = t;
        this._price = p;
    }
    set price(val) {
        if (val > 0) {
            this._price = val;
        }
        else {
            throw new Error('Invalid price - Should be positive');
        }
    }
    getPriceWithTax(tax) {
        return this._price * (1 + tax);
    }
}
__decorate([
    Log
], Product.prototype, "title", void 0);
__decorate([
    Log2
], Product.prototype, "price", null);
__decorate([
    Log3,
    __param(0, Log4)
], Product.prototype, "getPriceWithTax", null);
//Decorators only execute when you define the class
//Decorators on parameters on properties or parameters can return something but
//Ts will ignore it
//it can work on method decorators or accessors decorators
const p1 = new Product('Book', 9);
//En esta parte vemos como hacer un binding directamente del objeto que instanciamos
const Autobind = (_, _2, descriptor) => {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
};
class Printer {
    constructor() {
        this.message = 'This works';
    }
    showMessage() {
        console.log(this.message);
    }
}
__decorate([
    Autobind
], Printer.prototype, "showMessage", null);
const p = new Printer();
const button = document.querySelector('button');
button.addEventListener('click', p.showMessage);
const registeredValidators = {};
const Required = (target, propName) => {
    registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: ['required'] });
};
const PositiveNumber = (target, propName) => {
    registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: ['positive'] });
};
const validate = (obj) => {
    const objectValidatorConfig = registeredValidators[obj.constructor.name];
    if (!objectValidatorConfig) {
        return true;
    }
    let isValid = true;
    for (const prop in objectValidatorConfig) {
        for (const validator of objectValidatorConfig[prop]) {
            switch (validator) {
                case 'required':
                    isValid = isValid && !!obj[prop];
                    break;
                case 'positive':
                    isValid = isValid && obj[prop] > 0;
                    break;
                default:
                    return true;
                    break;
            }
        }
    }
    return isValid;
};
class Course {
    constructor(t, p) {
        this.title = t;
        this.price = p;
    }
}
__decorate([
    Required
], Course.prototype, "title", void 0);
__decorate([
    PositiveNumber
], Course.prototype, "price", void 0);
const courseForm = document.querySelector('form');
courseForm.addEventListener('submit', event => {
    event.preventDefault();
    const titleEl = document.getElementById('title');
    const priceEl = document.getElementById('price');
    const title = titleEl.value;
    const price = +priceEl.value;
    const createdCourse = new Course(title, price);
    if (!validate(createdCourse)) {
        alert('Invalid input, please try again');
        return;
    }
    console.log(createdCourse);
});
//# sourceMappingURL=app.js.map
// const Logger = (constructor: Function) => {
//     console.log('Logging...')
//     console.log(constructor);
// }

const Logger = (logString: string) => {
    console.log('LOGGER FACTORY!')
    return (constructor: Function) => {
        console.log(logString)
        console.log(constructor);
    }
}

const WithTemplate = (template: string, hookId: string) => {
    console.log('TEMPLATE FACTORY!')
    return <T extends {new(...args: any[]): {name: string}}>(
        //el underscore se puede poner en los casos que sepamos que vayamos a recibir argumentos
        //pero que posiblemente no los utilicemos
        originalConstructor: T) => {
        return class extends originalConstructor {
            constructor(..._: any[]){
                super();
                console.log('Template log')
                const hookEl = document.getElementById(hookId);
                if(hookEl){
                    hookEl.innerHTML = template;
                    hookEl.querySelector('h1')!.textContent = this.name;
                }
            }
        }
    }
}

@Logger('LOGGING')
@WithTemplate('<h1>My Person Object</h1>','app')
class Person {
    name = 'Manx';

    constructor(){
        console.log('Creating person object')
    }
}

const person = new Person();

console.log(person);

const Log = (target: any, propertyName: string) => {
    console.log('Property decorator');
    console.log(target, propertyName);
}

const Log2 = (target: any, name: string, descriptor: PropertyDescriptor) => {
    console.log('Accessor decorator!');
    console.log(target);
    console.log(descriptor);
    console.log(name);
}

const Log3 = (target: any, name: string |  Symbol, descriptor: PropertyDescriptor) => {
    console.log('Method decorator!');
    console.log(target);
    console.log(descriptor);
    console.log(name);
}

const Log4 = (target: any, name: string |  Symbol, position: number) => {
    console.log('Parameter decorator!');
    console.log(target);
    console.log(name);
    console.log(position);
}

class Product {
    @Log
    title: string;
    private _price: number;

    @Log2
    set price(val: number) {
        if(val>0){
            this._price = val;
        } else{
            throw new Error('Invalid price - Should be positive')
        }
    }

    constructor(t:string, p: number){
        this.title = t;
        this._price = p;
    }
    
    @Log3
    getPriceWithTax(@Log4 tax: number){
        return this._price * (1+ tax);
    }
}

//Decorators only execute when you define the class
//Decorators on parameters on properties or parameters can return something but
//Ts will ignore it
//it can work on method decorators or accessors decorators
const p1 = new Product('Book', 9);


//En esta parte vemos como hacer un binding directamente del objeto que instanciamos

const Autobind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}
class Printer {
    message = 'This works';

    @Autobind
    showMessage(){
        console.log(this.message);
    }
}

const p = new Printer();

const button = document.querySelector('button')!;
button.addEventListener('click', p.showMessage);

//--

//hay un bug que se puede ver en la 117
interface ValidatorConfig {
    [property: string]: {
        [validateProp: string]: string[] //['required,'positive]
    }
}

const registeredValidators: ValidatorConfig = {}

const Required = (target: any, propName: string) => {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: ['required']
    }
}
const PositiveNumber = (target: any, propName: string) => {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: ['positive']
    }
}

const validate = (obj: any) => {
    const objectValidatorConfig = registeredValidators[obj.constructor.name];
    if(!objectValidatorConfig){
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
}

class Course {
    @Required
    title: string;
    @PositiveNumber
    price: number;

    constructor(t:string, p:number){
        this.title = t;
        this.price = p;
    }
}

const courseForm = document.querySelector('form')!;
courseForm.addEventListener('submit', event=> {
    event.preventDefault();
    const titleEl = document.getElementById('title') as HTMLInputElement;
    const priceEl = document.getElementById('price') as HTMLInputElement;

    const title = titleEl.value;
    const price = +priceEl.value;

    const createdCourse = new Course(title, price);

    if(!validate(createdCourse)){
        alert('Invalid input, please try again');
        return;
    }
    console.log(createdCourse)
});
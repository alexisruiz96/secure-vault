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
function merge<T extends object,U extends object>(objA: T,objB: U){
    return Object.assign(objA,objB);
}

const mergedObj = merge({name:'Ama',hobbies: ['Sports']}, {age:30});
console.log(mergedObj);

interface Lengthy {
    length: number;
}

//revisar leccion 97 de Generics
function countAndDescribe<T extends Lengthy>(element: T): [T,string] {
    let descriptionText = 'Got no value.';
    if (element.length===1) {
        descriptionText = 'Got 1 value'
    } else if(element.length>1){
        descriptionText = 'Got ' + element + ' elements.';
    }

    return [element,descriptionText]
}

console.log(countAndDescribe([10]))

function extractAndConvert<T extends object,U extends keyof T>(
    obj: T, 
    key:U
){
    return 'Value ' + obj[key];
}

console.log(extractAndConvert({name:'Max'},'name'));

class DataStorage<T extends string | boolean | number> {
    private data: T[] = [];


    addItem(item: T){
        this.data.push(item);
    }

    removeItem(item: T){
        if(this.data.indexOf(item) === -1){
            return;

        }
        this.data.splice(this.data.indexOf(item),1);
    }

    getItems(){
        return[...this.data];
    }
}

const textStorage = new DataStorage<string>();
textStorage.addItem('Max')
textStorage.addItem('Manu');

const numberStorage = new DataStorage<number>();

// const objStorage = new DataStorage<object>();
// objStorage.addItem({name: 'Max'});
// objStorage.addItem({name: 'Manu'});


// objStorage.removeItem({name:'Max'})
// console.log(objStorage.getItems());

interface CourseGoal {
    title: string;
    description: string;
    completeUntil: Date;
}

//no parece que lo vayas a usar Generic utilities
function createCouseGoal(
    title: string, 
    description: string, 
    date: Date
): CourseGoal {
    let courseGoal: Partial<CourseGoal> = {};

    courseGoal.title = title;
    courseGoal.description = description;
    courseGoal.completeUntil = date;
    return courseGoal as CourseGoal;
    };

    const names: Readonly<string[]> = ['Max','Sports'];
    // names.push('Manu');


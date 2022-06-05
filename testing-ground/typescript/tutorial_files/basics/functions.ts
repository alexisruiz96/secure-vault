const add = (n1:number, n2: number) => {
    return n1 + n2;
}

const printResult = (num: number): void => {
    console.log('Result: ' + num);
}

const addHandle = (n1: number, n2: number, cb:(num:number) => void) => {
    const result = n1+ n2;
    cb(result);
}

printResult(add(1,2))

let combineValues: (a: number, b: number) => number;

combineValues = add;

console.log(combineValues(8,8));

addHandle(12,20, (result) =>{
    console.log(result);
})
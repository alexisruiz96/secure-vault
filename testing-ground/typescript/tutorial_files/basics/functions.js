"use strict";
const add = (n1, n2) => {
    return n1 + n2;
};
const printResult = (num) => {
    console.log('Result: ' + num);
};
const addHandle = (n1, n2, cb) => {
    const result = n1 + n2;
    cb(result);
};
printResult(add(1, 2));
let combineValues;
combineValues = add;
console.log(combineValues(8, 8));
addHandle(12, 20, (result) => {
    console.log(result);
});

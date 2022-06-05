"use strict";
const combine = (input1, input2, resultConvertion) => {
    let result;
    if (typeof input1 === 'number' && typeof input2 === 'number' || resultConvertion === 'as-number') {
        result = +input1 + +input2;
    }
    else {
        result = input1.toString() + input2.toString();
    }
    // if (resultConvertion === 'as-number') {
    //     return result
    // }
    // else{
    //     return result.toString()
    // }
    return result;
};
const combinedAges = combine(30, 26, 'as-number');
console.log(combinedAges);
const combinedNames = combine('Max', 'Anna', 'as-text');
console.log(combinedNames);

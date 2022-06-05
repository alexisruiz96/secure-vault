"use strict";
let userInput;
let userName;
userInput = 5;
userInput = 'Max';
if (typeof userInput === 'string') {
    userName = userInput;
}
const generateError = (message, code) => {
    throw { message: message, erroCode: code };
};
generateError('An error ocurred!', 500);

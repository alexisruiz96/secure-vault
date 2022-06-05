"use strict";
// const person:{
//     name: string;
//     age: number;
//     hobbies: string[];
//     role: [number, string];
// } = {
//     name: "Alexis",
//     age: 25,
//     hobbies:['Sports','Cooking'],
//     role: [2, 'author']
// };
var Role;
(function (Role) {
    Role[Role["ADMIN"] = 0] = "ADMIN";
    Role[Role["READ_ONLY"] = 1] = "READ_ONLY";
    Role[Role["AUTHOR"] = 2] = "AUTHOR";
})(Role || (Role = {}));
const person = {
    name: "Alexis",
    age: 25,
    hobbies: ['Sports', 'Cooking'],
    role: Role.READ_ONLY
};
// person.role.push('admin');
//person.role[1] = 10;
let favoriteActivities;
favoriteActivities = ['Sports'];
console.log(person.name);
for (const hobby of person.hobbies) {
    console.log(hobby.toUpperCase());
}
if (person.role === Role.ADMIN) {
    console.log("Only for admins");
}

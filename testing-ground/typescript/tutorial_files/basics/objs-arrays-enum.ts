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

enum Role { ADMIN, READ_ONLY, AUTHOR}

const person = {
    name: "Alexis",
    age: 25,
    hobbies:['Sports','Cooking'],
    role: Role.READ_ONLY
};

// person.role.push('admin');
//person.role[1] = 10;

let favoriteActivities: string[];
favoriteActivities = ['Sports'];

console.log(person.name)

for (const hobby of person.hobbies){
    console.log(hobby.toUpperCase());
}

if(person.role === Role.ADMIN){
    console.log("Only for admins")
}
const fs = require('fs')
const chalk = require('chalk')
const { parse } = require('path')

const addUser = (username,expiration) => {
    const users = loadUsers()
    const parsedUsers = JSON.parse(users)
    const duplicateUser = parsedUsers.find((user)=> user.username===username)

    if(!duplicateUser){
        parsedUsers.push({
            username: username,
            expiration: expiration
        })
        saveUsers(parsedUsers)
        console.log(chalk.green.inverse('New user added!'))
    } else{
        console.log(chalk.red.inverse('User already exists!'))
    }

}

const removeUser = (username) => {
    const users = loadUsers()
    const parsedUsers = JSON.parse(users)
    const usersToKeep = parsedUsers.filter((user) => user.username !== username)

    if (parsedUsers.length > usersToKeep.length) {
        console.log(chalk.red.inverse('User removed!'))
        saveUsers(usersToKeep)
    } else {
        console.log(chalk.red.inverse('No user found'))
    }

}

const saveUsers = (users) => {
    const dataJSON = JSON.stringify(users)
    fs.writeFileSync('users.json',dataJSON)
}

const loadUsers = () => {
    
    try {
        const dataBuffer = fs.readFileSync('users.json')
        const dataJSON = dataBuffer.toString()
        // return JSON.parse(dataJSON)
        console.log('Show users data') 
        console.log(dataJSON)       
        return dataJSON
    } catch (error) {
        return []
    }
}

module.exports = {
    addUser: addUser,
    removeUser: removeUser,
    loadUsers: loadUsers
}
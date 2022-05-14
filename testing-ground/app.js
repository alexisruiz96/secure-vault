const yargs = require('yargs')
const securevault = require('./components/securevault.js')
const users = require('./components/users.js')
const {argv} = require('process')

// Generate key 
yargs.command({
    command: 'generateKey',
    describe: 'Generate a key with scrypt and SubtleCrypto',
    builder:{
        password: {
            describe: 'Generate key (outputs as base64)',
            //used to require param
            demandOption: true,
            //what you expect to receive
            type:'string'
        }
    },
    handler(argv){
        securevault.generateKey(argv.password)
    }
})

// Generate CryptoKey object 
yargs.command({
    command: 'generateCryptoKey',
    describe: 'Generate a CryptoKey',
    builder:{
        key: {
            describe: 'Generate CryptoKey',
            demandOption: true,
            type:'string'
        }
    },
    handler(argv){
        securevault.generateCryptoKey(argv.key)
    }
})

yargs.command({
    command: 'encryptData',
    describe: 'Encrypt data passing jwk exported CryptoKey',
    builder:{
        jwk: {
            describe: 'JSON Web Key',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv){
        securevault.encryptData(argv.jwk)
    }
})

// Decrypt data
//TODO only pass password and encryptedData
yargs.command({
    command: 'decryptData',
    describe: 'Decrypt stored data',
    builder:{
        pwd: {
            describe: 'Password',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv){
        securevault.decryptData(argv.pwd)
    }
})

//Add User
yargs.command({
    command: 'addUser',
    describe: 'Add a new user',
    builder:{
        username: {
            describe: 'Username',
            //used to require param
            demandOption: true,
            //what you expect to receive
            type:'string'
        },
        expiration: {
            describe: 'Expiration date',
            //used to require param
            demandOption: true,
            //what you expect to receive
            type:'number'
        }
    },
    handler(argv){
        users.addUser(argv.username, argv.expiration)
    }
})

// Remove user
yargs.command({
    command: 'removeUser',
    describe: 'Remove a user',
    builder:{
        username: {
            describe: "Username",
            demandOption: true,
            type:'string'
        }
    },
    handler(argv){
        users.removeUser(argv.username)
    }
})

// Load users
yargs.command({
    command: 'loadUsers',
    describe: 'Load Users',
    handler(){
        users.loadUsers()
    }
})

yargs.parse()
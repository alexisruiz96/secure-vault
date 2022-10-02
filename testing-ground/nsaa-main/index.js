//imports
const cookieparser = require('cookie-parser')
const cookie = require('cookie')
const express = require('express')
const fortune = require('fortune-teller')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const logger = require('morgan')
const jwt = require('jsonwebtoken')
const https = require('https');
const fs = require('fs');
const { token } = require('morgan')
const sqlite3 = require('sqlite3')
const timestamp = require('timestamp')
const securevault = require('./securevault.js')
const crypto = require('crypto').webcrypto
let GitHubStrategy = require('passport-github2').Strategy;
const env = require('dotenv').config()


const jwtSecret = require('crypto').randomBytes(16) // 16*8=256 random bits 

// Server params
const tlsServerKey = fs.readFileSync('./tls/webserver.key.pem');
const tlsServerCrt = fs.readFileSync('./tls/webserver.crt.pem');
const port = 3000
const httpsOptions = {
    key: tlsServerKey,
    cert: tlsServerCrt
};
const db = new sqlite3.Database(__dirname+'/nsaa.db');         


//Create table
/*await db.exec('CREATE TABLE USERS (' +
	'id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,' +
  	'user varchar(25) NOT NULL UNIQUE,' +
  	'password varchar(255) NOT NULL,' +
  	'versiontime timestamp NULL)'
)*/


//Initialize Express app
const app = express()
app.use(logger('dev'))

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(obj, done) {
done(null, obj);
});
  
/*
Configure the local strategy for using it in Passport.
The local strategy requires a `verify` function which receives the credentials
(`username` and `password`) submitted by the user.
*/
passport.use('local', new LocalStrategy({
        usernameField: 'username', // it MUST match username in the login HTML formulary
        passwordField: 'password', // it MUST match password in the login HTML formulary
        session: false // Our server does not need to keep a session, it's going to be stateless
    },
    async (username, password, done) => {

        db.get('SELECT rowid AS id, * FROM users WHERE username = ?', [ username ], async (err, user) => {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Incorrect username or password.' }); } // in passport returning false as the user object means that the authentication process failed. 
            debugger
            //TODO separate retrieve user from checking password to login

            const isCorrectPassword = await securevault.checkPassword(password,user.password)
            if (!(isCorrectPassword)) {
              return done(null, false, { message: 'Incorrect username or password.' });
            }
            return done(null,user) // the first argument for done is the error, if any. In our case there is no error, and so we pass null.
        });
        
    }
))

passport.use('github', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://30.0.2.6:3000/oauth2/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    
    return done(null,profile);
  }
));

app.use(express.urlencoded({
    extended: true
})) // needed to retrieve html form fields
app.use(passport.initialize()) // load the passport auth middleware before any route
app.use(cookieparser())

app.get('/', (req, res) => {
    let tokenSession = null
    let validatedSession = false
    if (Object.keys(req.cookies).length!==0)
    {
        try {
            tokenSession = req.cookies.jwt;
            validatedSession = jwt.verify(tokenSession,jwtSecret)
        } catch (error) {
            res.clearCookie()
            res.redirect('/login')
            console.log(error)            
        }
        if (tokenSession!==null && validatedSession){
            console.log(tokenSession)
            //call fortune teller
            //res.json(fortune.fortune()+"<a href='https://30.0.2.6:3000/logout'> <br> <button>Logout</button>")
            res.send(fortune.fortune()+"<a href='https://30.0.2.6:3000/logout'> <br> <button>Logout</button>")
        }
    }
    
    else{
        res.clearCookie()
        res.redirect('/login')
    }
})

app.get('/login',
    (req, res) => {
        res.sendFile('login.html', {
            root: __dirname
        })
    }
)

// http://www.passportjs.org/tutorials/password/signup/ add sign up to save password with KDF from securevault
app.get('/signup',
    (req, res) => {
        res.sendFile('signup.html', {
            root: __dirname
        })
    }
)


app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        session: false
    }), // indicate endpoint must pass through the passport local strategy
    (req, res) => {
        // create JWT for the fortune teller and send it to the user agent inside a cookie
        const jwtClaims = {
            sub: req.user.username,
            iss: '30.0.2.6:3000',
            aud: '30.0.2.6:3000',
            exp: Math.floor(Date.now() / 1000) + 604800, // 1 week (7×24×60×60=604800s) from now
            role: 'user' // just to show a private JWT field
        }

        // By default the signing algorithm is HS256 (HMAC-SHA256)
        const token = jwt.sign(jwtClaims, jwtSecret)
        
        // Set jwt into a cookie
        res.cookie('jwt',token,{
            httpOnly: true,
            secure: true
        })

        // Log a link to the jwt.io debugger
        console.log(`Token sent. Debug at https://jwt.io/?value=${token}`)
        console.log(`Token secret (for verifying the signature): ${jwtSecret.toString('base64')}`)

        res.redirect('/')
    }
)

app.get('/oauth2/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/oauth2/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    const jwtClaims = {
        sub: req.user.username,
        iss: '30.0.2.6:3000',
        aud: '30.0.2.6:3000',
        exp: Math.floor(Date.now() / 1000) + 604800, // 1 week (7×24×60×60=604800s) from now
        role: 'user'
    }

    const token = jwt.sign(jwtClaims, jwtSecret)
    
    // Set jwt into a cookie
    res.cookie('jwt',token,{
        httpOnly: true,
        secure: true
    })

    // Log a link to the jwt.io debugger, for easy checking/verifying:
    console.log(`Token sent. https://jwt.io/?value=${token}`)
    console.log(`Token secret (for verifying the signature): ${jwtSecret.toString('base64')}`)

    res.redirect('/');
  });

app.post('/signup', async (req, res) => {
    debugger
    const hashedPassword = await crypto.subtle.digest('SHA-256', req.body.password)
    const hashBase64 = securevault.convertBufferToBase64(hashedPassword)
    const key = await securevault.generateKey(req.body.password)
    const cryptoKey = await securevault.generateCryptoKey(key)
    const encryptedDataToSave = await securevault.encryptData(cryptoKey,hashBase64)
    //console.log('hashedPassword: ' + hashBase64);console.log('key: ' + key);console.log('cryptokey: ' + cryptoKey);console.log('encryptedDataToSave: ' + encryptedDataToSave);
    db.run('INSERT INTO users (username, password, versiontime) VALUES (?, ?, ?)', [
        req.body.username,
        encryptedDataToSave,
        timestamp()
    ], (err) => {
        if (err) { 
            console.log(err)
            res.redirect('/signup')
        }
        else{
            res.redirect('/login')
        }
    })
  })

app.get('/logout',
    (req,res) => {
        res.clearCookie('jwt')
        res.redirect('/')
    }
)

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

const server = https.createServer(httpsOptions, app);

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    console.log('Listening on ' + bind);
}

server.listen(port, () => {
    console.log(`Example app listening at https://localhost:${port}`)
});
server.on('listening', onListening);

/*app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})*/
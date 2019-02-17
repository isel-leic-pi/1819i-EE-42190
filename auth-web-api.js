'use strict'

const passport = require('passport')
const auth = require('./lib/auth-service.js')

const es = {
    host: 'localhost',
    port: '9200'
}

const authService = auth.init(es)

module.exports = (app) => {
    passport.serializeUser((user, done) => done(null, user._id))
    passport.deserializeUser((userId, done) => authService
        .getUser(userId)
        .then(user => done(null, user))
        .catch(error => done(error))
    )
    app.use(passport.initialize())
    app.use(passport.session())
    app.get('/focaG4/auth/session', getSession)
    app.post('/focaG4/auth/login', login)
    app.post('/focaG4/auth/logout', logout)
    app.post('/focaG4/auth/signup', signup)
    function getSession(req, resp, next) {
        const username = req.isAuthenticated() ? req.user.username : undefined
        resp.json({
            'auth': req.isAuthenticated(), // <=> req.user != undefined
            'username': username
        })
    }
    function login(req, resp, next) {
        authService
            .authenticate(req.body.username, req.body.password)
            .then(user => {
                req.login(user, (err) => {
                    if (err) next(err)
                    else resp.json(user)
                })
            })
            .catch(err => next(err))
    }
    function logout(req, resp, next) {
        req.logout()
        req.session.destroy(err => {
            if (err) { return next(err) }
            return resp.send({ authenticated: req.isAuthenticated() })
        })    
    }
    function signup(req, resp, next) {
        if(!req.body.username || !req.body.password){            
            return next({'statusCode': 406, 'message':'Username or Password missing!'})
        }
        authService
            .createUser(req.body.username, req.body.password)
            .then(user => {
                req.login(user, (err) => {
                    if (err) next(err)
                    else resp.json(user)
                })
            })
            .catch(err => {
                if(err.statusCode == 409)
                    return next({'statusCode': 409, 'message':'There is already a user with that username. Choose a differente one!'})
                return next(err)
            })
    }
}
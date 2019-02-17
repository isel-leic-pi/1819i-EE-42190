'use strict'

const express = require('express')
const morgan = require('morgan')
const focaApi = require('./foca-web-api')
const bodyParser = require('body-parser')
const expressSession = require('express-session')
const authWebApi = require('./auth-web-api')

const port = 3000
const host = 'localhost'

const app = express()

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(expressSession({secret: 'keyboard cat', resave: false, saveUninitialized: true }))
app.use(express.static('dist'))

authWebApi(app)
focaApi(app, express)

app.listen(port, host, (error) => {
    if(error){
        return console.error(error)
    }
})
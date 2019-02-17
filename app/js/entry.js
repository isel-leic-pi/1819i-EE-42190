'use strict'

require('../../node_modules/bootstrap/dist/css/bootstrap.css')
require('./../../node_modules/bootstrap/dist/js/bootstrap.js')

const Handlebars = require('handlebars/dist/handlebars')
const util = require('./util')
const index = require('./index')
const leaguesSearch = require('./leaguesSearch')
const league = require('./league')
const groups = require('./groups')
const specificGroup = require('./specificGroup')
const login = require('./login')
const signOut = require('./signOut')

const mainView = require('../views/main.html')
const navbarView = Handlebars.compile(require('../views/navbar.hbs'))

document.body.innerHTML = mainView
const divMain = document.getElementById('divMain')
const divNavbar = document.getElementById('divNavbar')

showNavbar()
    .then(() => {
        window.onload = showView
        window.onhashchange = showView
        showView()
    })

async function showNavbar() {
    const resp = await fetch('http://localhost:3000/focaG4/auth/session')
    const body = await resp.json() // body => {auth, username}
    if (resp.status != 200) {
        util.showAlert(JSON.stringify(body))
    }
    divNavbar.innerHTML = navbarView(body)
}


function showView() {
    const path = window.location.hash.split('/')
    switch (path[0]) {
    case '':
        index(divMain)
        break
    case '#index':
        index(divMain)
        break
    case '#leaguesSearch':
        leaguesSearch(divMain)
        break
    case '#league':
        league(divMain)
        break
    case '#groups':
        groups(divMain)
        break
    case '#specificGroup':
        specificGroup(divMain)
        break
    case '#login':
        login(divMain, showNavbar)
        break
    case '#signout':
        signOut(showNavbar)
        break
    default:
        divMain.innerHTML = 'Resource Not Found!'
    }
    updateNav(path)
}

function updateNav(path) {
    const current = document.querySelector('a.active')
    if (current) current.classList.remove('active')
    const nav = document.getElementById('nav' + path)
    if (!nav) return
    nav.classList.add('active')
}
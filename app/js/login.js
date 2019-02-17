'use strict'

const util = require('./util.js')
const loginView = require('../views/login.html')

module.exports = (divMain, getAuthAndInsertNavbar) => {
    divMain.innerHTML = loginView

    const password = document.getElementById('inputPassword')
    const username = document.getElementById('inputUsername')

    document
        .getElementById('buttonSignup')
        .addEventListener('click', signupHander)
    document
        .getElementById('buttonLogin')
        .addEventListener('click', loginHander)

    function signupHander(ev) {
        ev.preventDefault()
        
        const url = 'http://localhost:3000/focaG4/auth/signup'
        const options = {
            method: 'POST',
            body: JSON.stringify({
                'username': username.value,
                'password': password.value
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        fetch(url, options)
            .then(async (resp) => {
                if (resp.status != 201 && resp.status != 200) {
                    const body = await resp.json()
                    throw `${resp.status} ${resp.statusText}: ${JSON.stringify(body.message)}`                    
                }
                getAuthAndInsertNavbar()
                    .then(() => window.location.hash = '#index')
            })
            .catch(err => util.showAlert(err, 'danger'))
    }

    async function loginHander(ev) {
        ev.preventDefault()
        const url = 'http://localhost:3000/focaG4/auth/login'
        const options = {
            method: 'POST',
            body: JSON.stringify({
                'username': username.value,
                'password': password.value
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const resp = await fetch(url, options)
        try {
            if (resp.status == 200) {
                await getAuthAndInsertNavbar()
                window.location.hash = '#index'
            } else {
                const body = await resp.json()
                util.showAlert(`${resp.status} ${resp.statusText}: ${JSON.stringify(body)}`)
            }
        } catch (err) {
            util.showAlert(JSON.stringify(err))
        }
    }
}
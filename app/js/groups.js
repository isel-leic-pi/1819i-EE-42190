'use strict'

const Handlebars = require('handlebars/dist/handlebars.js')
const groupsView = require('../views/groups.html')
const groupsTemplate = require('../views/groups.hbs')
const groupsHbs = Handlebars.compile(groupsTemplate)

module.exports = (divMain) => {
    divMain.innerHTML = groupsView
    document
        .getElementById('buttonCreate')
        .addEventListener('click', createGroup)

    const divResults = document.getElementById('divResults')

    async function showGroups() {
        const resp = await fetch('http://localhost:3000/focaG4/auth/session')
        const body = await resp.json() // body => {auth, username}

        if(!body.auth) {
            window.location.hash = 'index'
            alert('You must be logged in to view this page')
        }

        fetch('http://localhost:3000/focaG4/favourites/teams')
            .then(resp => resp.json())
            .then(body => groupsHbs(body))
            .then(html => divResults.innerHTML = html)
    }

    showGroups()

    function createGroup(event) {
        event.preventDefault()
        const name = document.getElementById('inputName').value
        const description = document.getElementById('inputDescription').value
        if (!name || !description) return alert('Name or Description missing')
        fetch('http://localhost:3000/focaG4/favourites/teams',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'name': name,                    
                    'description': description
                })
            }
        )
            .then((resp) => {
                if (resp.status == 201)
                    alert('Group created')
                else
                    alert('Invalid group!')
                showGroups()
            })
    }
}
'use strict'

const Handlebars = require('handlebars/dist/handlebars.js')
const leagueView = require('../views/league.html')
const leagueTemplate = require('../views/league.hbs')
const leagueHbs = Handlebars.compile(leagueTemplate)
module.exports = (divMain) => {
    divMain.innerHTML = leagueView
    const divResults = document.getElementById('divResults')
    const leagueID = window.location.hash.split('/')[1]
    fetch(`http://localhost:3000/focaG4/leagues/${leagueID}/teams`)
        .then(resp => resp.ok ? resp.json() : Promise.reject())
        .then(body => leagueHbs(body))
        .then(html => divResults.innerHTML = html)
        .catch(() => {
            alert('League not available')
            window.history.back()
        })
}
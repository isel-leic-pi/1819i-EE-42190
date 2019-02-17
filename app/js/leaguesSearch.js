'use strict'

const Handlebars = require('handlebars/dist/handlebars.js')
const leagueSearchView = require('./../views/leaguesSearch.html')
const leaguesSearchResultsTemplate = require('../views/leaguesSearchResults.hbs')
const searchResults = Handlebars.compile(leaguesSearchResultsTemplate)

module.exports = (divMain) => {
    divMain.innerHTML = leagueSearchView

    const divResults = document.getElementById('divResults')

    fetch('http://localhost:3000/focaG4/leagues')
        .then(resp => resp.json())        
        .then(body => searchResults(body))
        .then(html => divResults.innerHTML = html)  
}




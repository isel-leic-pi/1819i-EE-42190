'use strict'

const Handlebars = require('handlebars/dist/handlebars.js')
const specificGroupView = require('./../views/specificGroup.html')
const specificGroupTemplate = require('../views/specificGroup.hbs')
const specificGroupHbs = Handlebars.compile(specificGroupTemplate)
const matchesTemplate = require('../views/matches.hbs')
const matchesHbs = Handlebars.compile(matchesTemplate)

module.exports = (divMain) => {
    divMain.innerHTML = specificGroupView
    const groupID = window.location.hash.split('/')[1]

    document
        .getElementById('buttonEdit')
        .addEventListener('click', editGroup)

    document
        .getElementById('buttonAddTeam')
        .addEventListener('click', addTeamToGroup)

    document
        .getElementById('buttonRemoveTeam')
        .addEventListener('click', removeTeamFromGroup)

    document
        .getElementById('buttonMatches')
        .addEventListener('click', getMatchesfromGroup)

    document
        .getElementById('buttonCloneGroup')
        .addEventListener('click', cloneGroup)    


    function updateView() {
        const divResults = document.getElementById('divResults')
        const groupID = window.location.hash.split('/')[1]

        fetch(`http://localhost:3000/focaG4/favourites/teams/${groupID}`)
            .then(resp => resp.json())
            .then(body=>{
                body.content.teams.forEach(elem => {
                    if(!elem.crestUrl) elem.crestUrl = 'https://image.flaticon.com/icons/svg/53/53283.svg'
                })
                return body
            }             
            )
            .then(body => specificGroupHbs(body))
            .then(html => divResults.innerHTML = html)
    }

    updateView()

    function editGroup(event) {
        event.preventDefault()
        const name = document.getElementById('inputName').value
        const description = document.getElementById('inputDescription').value
        if (!name || !description) return alert('Name or Description missing')
        fetch(`http://localhost:3000/focaG4/favourites/teams/${groupID}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'name': name,
                    'description': description
                })
            }
        )
            .then(resp => resp.json())
            .then(resp => {
                alert(resp.result)
                updateView()
            })
    }

    function addTeamToGroup(event) {
        event.preventDefault()
        const teamID = document.getElementById('inputIDAdd').value
        if (!teamID) return alert('Team ID missing')
        fetch(`http://localhost:3000/focaG4/favourites/teams/${groupID}/add/${teamID}`, { method: 'PUT' })
            .then(resp => resp.json())
            .then(resp => {
                alert(resp.result)
                updateView()
            })
    }

    function removeTeamFromGroup(event) {
        event.preventDefault()
        const teamID = document.getElementById('inputIDRemove').value
        if (!teamID) return alert('Team ID missing')
        fetch(`http://localhost:3000/focaG4/favourites/teams/${groupID}/remove/${teamID}`, { method: 'DELETE' })
            .then(resp => resp.json())
            .then(resp => {
                alert(resp.result)
                updateView()
            })
    }

    function getMatchesfromGroup(event) {
        event.preventDefault()
        const matchesHtml = document.getElementById('matchesResults')
        const fromDate = document.getElementById('fromDate').value
        const toDate = document.getElementById('toDate').value
        if (!fromDate || !toDate) return alert('One of the requested dates is missing')
        if (Date.parse(toDate) < Date.parse(fromDate)) return alert('Please specify a valid set of dates')

        const url = new URL(`http://localhost:3000/focaG4/favourites/teams/${groupID}/matches`)
        const params = { 'fromDate': fromDate, 'toDate': toDate }
        url.search = new URLSearchParams(params)
        fetch(url)
            .then(resp => resp.json())
            .then(matches => {
                matches.forEach(match => {
                    match.utcDate = match.utcDate
                        .replace('T', ' ')
                        .replace('Z', '')
                        .substring(0, 16)
                })
                return matches
            })
            .then(body => matchesHbs(body))
            .then(html => matchesHtml.innerHTML = html)
    }

    function cloneGroup(ev){
        ev.preventDefault()
        const newName = document.getElementById('inputCloneGroup').value
        if(!newName) return alert('New group name is missing')
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'name': newName,
                'gid': groupID
            })
        }
        fetch('http://localhost:3000/focaG4/favourites/teams/dup', options)
            .then(resp=>resp.json())
            .then(resp=>{
                alert(resp.result)
                updateView()
            })
    }
}
'use strict'
const request = require('request-promise-native')
async function xpto() {

    try {
        await request.delete('http://localhost:9200/focausers/')
        await request.delete('http://localhost:9200/focateams/')
    } catch (error) {
        console.log('NOTHING TO DELETE!')
    }


    const user = { username:'Alice', password:'Alice1337' }
    let options = {
        url: `http://localhost:9200/focausers/user/${user.username}/_create`,
        json: true,
        body: { password: user.password }
    }
    await request.put(options)

    const teams = []

    options = {
        url: 'http://api.football-data.org/v2/teams/503',
        headers: {
            'X-Auth-Token': 'af8581cfde69420592973e248f814360'
        }
    }
    let team = await request.get(options)
    teams.push(team)

    options = {
        url: 'http://api.football-data.org/v2/teams/86',
        headers: {
            'X-Auth-Token': 'af8581cfde69420592973e248f814360'
        }
    }
    team = await request.get(options)
    teams.push(team)
    
    options = {
        url: 'http://localhost:9200/focateams/teams',
        json: true,
        body: { 'name': 'Worst teams 2k19', 'description': 'really bad teams', 'teams': teams, 'user': 'Alice' }
    }
    await request.post(options)
    console.log('Username: Alice | Password: Alice1337')
}
xpto()
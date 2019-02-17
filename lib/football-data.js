'use strict'

const request = require('request-promise-native')

class FootBallDataApi {

    constructor() {
        this.leaguesUrl = 'http://api.football-data.org/v2/competitions/'
        this.teamsFromLeagueUrl = 'http://api.football-data.org/v2/competitions/:lid/teams'
        this.specificTeamUrl = 'http://api.football-data.org/v2/teams/:tid'
        this.teamMatchesUrl = 'http://api.football-data.org/v2/teams/:tid/matches'
        this.footBallToken = 'af8581cfde69420592973e248f814360'
    }

    static init() {
        return new FootBallDataApi()
    }

    getLeagues() {
        return request
            .get(this.leaguesUrl)
            .then(body => JSON.parse(body))
    }

    getTeamsFromLeague(leagueId) {
        const options = {
            url: this.teamsFromLeagueUrl.replace(':lid', leagueId),
            headers: {
                'X-Auth-Token': this.footBallToken
            }
        }
        return request
            .get(options)
            .then(body => JSON.parse(body))
    }

    getTeam(teamId) {
        const options = {
            url: this.specificTeamUrl.replace(':tid', teamId),
            headers: {
                'X-Auth-Token': this.footBallToken
            }
        }
        return request
            .get(options)
            .then(body => JSON.parse(body))
    }

    getMatchesFromTeam(teamId, fromDate, toDate) {
        const options = {
            url: this.teamMatchesUrl.replace(':tid', teamId),
            headers: {
                'X-Auth-Token': this.footBallToken
            },
            qs: {
                'dateFrom': fromDate,
                'dateTo': toDate
            }
        }
        return request
            .get(options)
            .then(body => JSON.parse(body))
    }

}

module.exports = FootBallDataApi
'use strict'

class footBallApiMocks {

    static init() {
        return new footBallApiMocks()
    }

    async getLeagues() {
        try {
            return require('../mocks/leagues.json')
        } catch (error) {
            return {
                code: 404,
                message: 'Leagues not found',
                error: 'NOT FOUND'
            }
        }
    }

    async getTeamsFromLeague(id) {
        try {
            return require(`../mocks/league${id}.json`)
        } catch (error) {
            return {
                code: 404,
                message: 'League not found',
                error: 'NOT FOUND'
            }
        }

    }

    async getTeam(id) {
        try {
            return require(`../mocks/team${id}.json`)
        } catch (err) {
            return {
                code: 404,
                message: 'League not found!',
                error: 'NOT FOUND'
            }
        }
    }

    async getMatchesFromTeam(teamId, fromDate, toDate) {
        try {
            const teamMatches = require(`../mocks/matches${teamId}.json`).matches
            fromDate = Date.parse(fromDate)
            toDate = Date.parse(toDate)

            const filteredMatches = teamMatches.filter(team => {
                const currentMatchDate = Date.parse(team.utcDate)
                return currentMatchDate >= fromDate && currentMatchDate <= toDate
            })

            return { matches: filteredMatches }
        } catch (err) {
            return {
                code: 404,
                message: 'Matches not found!',
                error: 'NOT FOUND'
            }
        }
    }

}

module.exports = footBallApiMocks
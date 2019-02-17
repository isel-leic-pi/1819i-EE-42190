'use strict'

const assert = require('assert')
const service = require('../lib/foca-services').init(
    require('../lib/football-data-mock').init(),
    require('../lib/foca-db-mock').init())

describe('Group creation and manipulation with mocks', () => {

    it('should create the first group', done => {
        const params = {
            name: 'test group',
            description: 'this group is meant for testing purposes'
        }
        service.postGroup(params)
            .then(response => {
                assert.strictEqual(1, response.id)
                assert.strictEqual('created', response.result)
            })
            .finally(done)

    })

    it('should add a team to the first group', done => {
        service.putTeamInGroup(1, 18)
            .then(response => {
                assert.strictEqual(1, response.id)
                assert.strictEqual('updated', response.result)
            })
            .finally(done)
    })

    it('should return the group created before', done => {
        service.getFavouriteGroup(1)
            .then(response => {
                assert.strictEqual('test group', response.content.name)
            })
            .finally(done)
    })

    it('should return the matches from the team in the group', done => {
        service.getMatchesFromGroup(1, '2018-08-15', '2018-12-31')
            .then(data => {
                assert.notStrictEqual(data[0], null)
            })
            .finally(done)
    })

    it('should add another group and return both', done => {
        const params = {
            name: 'another test group',
            description: 'just another test group'
        }
        service.postGroup(params)
            .then(data => {
                assert.strictEqual('created', data.result)
                service.getAllFavouriteGroups().then(data => {
                    assert.strictEqual(2, data.length)
                })
            })
            .finally(done)


    })

    it('should edit the first groups details', done => {
        const params = {
            name: 'still a test group',
            description: 'still a test description'
        }
        service.putGroup(1, params)
            .then(data => {
                assert.strictEqual('updated', data.result)
            })
            .finally(done)
    })

    it('should delete the team inserted in the first group', done => {
        service.deleteTeamFromGroup(1, 18)
            .then(data => {
                assert.strictEqual('updated', data.result)
                service.getFavouriteGroup(1).then(data => {
                    assert.deepStrictEqual([], data.content.teams)
                })
            })
            .finally(done)
    })
})


describe('Leagues and Teams from leagues testing', () => {

    it('should return all available leagues', done => {
        service.getLeagues()
            .then(response => {
                assert.strictEqual(147, response.count)
            })
            .finally(done)
    })

    it('should get the portuguese league with 18 teams', done => {
        service.getTeamsFromLeague(2017)
            .then(data => {
                assert.strictEqual(18, data.count)
                assert.strictEqual('Primeira Liga', data.competition.name)
            })
            .finally(done)
    })
})
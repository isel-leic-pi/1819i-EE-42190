'use strict'

const groups = []

class ElasticSearchApiMocks {

    static init() {
        return new ElasticSearchApiMocks()
    }

    async getGroup(id) {
        if (groups[id - 1]) {
            return {_id: id, _source: JSON.parse(JSON.stringify(groups[id - 1]._source))} //creates copy of array index
        } else {
            return {
                code: 404,
                message: 'No groups',
                error: 'NOT FOUND'
            }
        }
    }


    async postGroup(body) {
        groups.push(
            {
                _id: (groups.length + 1),
                _source: {
                    name: body.name,
                    description: body.description,
                    teams: []
                }
            })
        return { _id: groups.length, result: 'created' }
    }

    async putGroup(id, body) {
        let group = groups[id - 1]._source
        if (group) {
            group.name = body.name
            group.description = body.description
            return { result: 'updated', _id: group.id }
        } else {
            return {
                code: 404,
                message: 'Group not found!',
                error: 'NOT FOUND'
            }
        }
    }

    async getAllFavouriteGroups() {
        return { hits: { hits: JSON.parse(JSON.stringify(groups)) } } //clone groups array 
    }


    async putGroupWithTeams(id, body) {
        let group
        if ((group = groups[id - 1]._source)) {
            group.name = body.name
            group.description = body.description
            group.teams = body.teams
            return { result: 'updated', _id: id }
        } else {
            return {
                code: 404,
                message: 'Group not found!',
                error: 'NOT FOUND'
            }
        }
    }
}

module.exports = ElasticSearchApiMocks
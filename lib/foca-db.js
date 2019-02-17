'use strict'

const request = require('request-promise-native')

class ElasticSearchApi {

    constructor(es) {
        this.url = `http://${es.host}:${es.port}/${es.teamsIndex}/teams`
    }

    static init(es) {
        return new ElasticSearchApi(es)
    }

    getGroup(id) {
        const options = {
            url: `${this.url}/${id}`,
            json: true
        }
        return request.get(options)
    }

    postGroup(body, username) {
        const options = {
            url: `${this.url}`,
            json: true,
            body: { 'name': body.name, 'description': body.description, 'teams': [], 'user': username }
        }
        return request.post(options)
    }

    putGroup(id, body) {
        const options = {
            url: `${this.url}/${id}/_update`,
            json: true,
            body: {
                'doc': {
                    'name': body.name,
                    'description': body.description,
                    'user': body.user
                }
            }
        }
        return request.post(options)
    }

    putGroupWithTeams(groupId, body) {
        const options = {
            url: `${this.url}/${groupId}`,
            json: true,
            body: {
                name: body.name,
                description: body.description,
                teams: body.teams,
                user: body.user
            }
        }
        return request.put(options)
    }

    getAllFavouriteGroups(username) {
        const options = {
            url: `${this.url}/_search`,
            qs: {
                size: 50,
                q: `user:${username}`
            }
        }
        return request
            .get(options)
            .then(data => JSON.parse(data))
    }

}

module.exports = ElasticSearchApi

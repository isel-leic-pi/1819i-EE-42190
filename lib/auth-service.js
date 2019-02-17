'use strict'

const request = require('request-promise-native')

class Auth {
    static init(es) {
        return new Auth(es)
    }

    constructor(es){
        this.usersRefresh = `http://${es.host}:${es.port}/focausers/_refresh`
        this.usersUrl = `http://${es.host}:${es.port}/focausers/user`
    }

    async createUser(username, password) {
        const user = {username, password}
        const options = {
            url: `${this.usersUrl}/${user.username}/_create`,
            json: true,
            body: {password : user.password}
        }        
        const resp = await request.put(options)        
        await request.post(this.usersRefresh)
        user._id = resp._id
        return user
    }

    getUser(userId) {
        return request
            .get(`${this.usersUrl}/${userId}`)
            .then(body => JSON.parse(body))
            .then(obj => {return {
                'username': obj._id,                
                'password': obj._source.password,
            }})

    }
    async authenticate(username, password) {
        const url = `${this.usersUrl}/_search?q=_id:${username}`
        const body = await request.get(url)
        const obj = JSON.parse(body)
        if(obj.hits.hits.length == 0)
            throw {'statusCode': 404, 'message': 'Username not found!' }
        const first = obj.hits.hits[0]
        if(first._source.password != password)
            throw {'statusCode': 401, 'message': 'Wrong credentials!' }
        return {
            '_id': first._id
        }
    }

}

module.exports = Auth
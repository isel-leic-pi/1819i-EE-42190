'use strict'

class focaServices {

    /**
     * saves the api references (either mocks or "real" api)
     * @param {*} footBallApi 
     * @param {*} elasticSearchApi 
     */
    constructor(footBallApi, elasticSearchApi) {
        this.footBallApi = footBallApi
        this.elasticSearchApi = elasticSearchApi
    }

    static init(footBallApi, elasticSearchApi) {
        return new focaServices(footBallApi, elasticSearchApi)
    }

    /**
     *returns available leagues back to the web api
     * 
     */
    getLeagues() {
        return this.footBallApi.getLeagues()
    }

    /**
     * returns teams belonging to the league supplied
     * @param {*} leagueId the id of the league to retrieve information
     * 
     */
    getTeamsFromLeague(leagueId) {
        return this.footBallApi.getTeamsFromLeague(leagueId)
    }

    /**
     * creates a new favourite group in the database
     * @param {*} body an object containing the name and the description of the new group
     * 
     */
    async postGroup(body, username) {                   //EE 1
        const userGroups = await this.elasticSearchApi.getAllFavouriteGroups(username)
        let anyGroup = true
        userGroups.hits.hits.forEach(group => {
            if(body.name === group._source.name){
                anyGroup = false
            }
        })
        let actionResult = {}
        if(anyGroup)
            actionResult = await this.elasticSearchApi.postGroup(body, username)
        else
            return { statusCode: 409, result: 'conflict'}
        
        return { id: actionResult._id, statusCode: 201, result: actionResult.result }
    }

    /**
     * changes the name and the description of a given group
     * @param {*} id the id of the group to be edited
     * @param {*} body an object containing the new name and description of the group
     * 
     */
    async putGroup(id, body) {
        const actionResult = await this.elasticSearchApi.putGroup(id, body)
        return { id: actionResult._id, result: actionResult.result }
    }

    async dupGroup(gid, name){
        const group = await this.elasticSearchApi.getGroup(gid)                 //copia
        if(name === group.name) return { statusCode: 409, result: 'Conflit'}
        group._source.name = name
        const usr = group._source.user
        const obj = {
            name: name,
            description: group._source.description
        }
        const newgid = await this.postGroup(obj,usr)
        const newid = newgid.id

        for(let team in group._source.teams){
            const id = JSON.parse(group._source.teams[team]).id
            await this.putTeamInGroup(newid,id,usr)
        };
        return newgid
    }

    /**
     * returns to the client all created groups
     * 
     */
    async getAllFavouriteGroups(username) {
        const data = await this.elasticSearchApi.getAllFavouriteGroups(username)

        const necessaryInfo = data.hits.hits.map(hit => {
            return { id: hit._id, content: hit._source }
        })

        necessaryInfo.forEach(group => {
            group.content.teams = group.content.teams.map(teamString => {
                return JSON.parse(teamString)
            })
        })

        return necessaryInfo
    }

    /**
     * returns details of a specific group
     * @param {*} id the id of the group to retrieve the information 
     * 
     */
    async getFavouriteGroup(id) {
        const body = await this.elasticSearchApi.getGroup(id)

        const data = { id: body._id, content: body._source }

        data.content.teams = data.content.teams.map(team => {
            return JSON.parse(team) //teams are stored as strings in elasticSearch
        })

        return data
    }

    /**
     * adds a teams to a group if it hasnt been added to it before
     * @param {*} groupId the id of the group to whitch the team is going to be added
     * @param {*} teamId the id of the team to add to the group
     * 
     */
    async putTeamInGroup(groupId, teamId, username) { // EE 2
        const [newTeam, group] = await Promise.all([
            this.footBallApi.getTeam(teamId),
            this.getFavouriteGroup(groupId)
        ])

        let teams = group.content.teams

        if (teams.map(team => team.id).includes(newTeam.id)) {  //confirm that the team does not exist in the group
            return { id: groupId, result: 'already exists' }
        }

        teams.push(newTeam)
        group.content.teams = teams.map(team => {
            return JSON.stringify(team) //teams are stored as strings in elasticSearch
        })
        group.content.user = username
        return this.elasticSearchApi.putGroupWithTeams(groupId, group.content)
            .then(response => {
                return { id: response._id, result: response.result }
            })
    }

    /**
     * removes a team from the given group
     * @param {*} groupId the id of the group from which the team will be removed
     * @param {*} teamId the id of the team to be removed
     * 
     */
    async deleteTeamFromGroup(groupId, teamId) {
        const data = await this.getFavouriteGroup(groupId)

        const group = data.content

        console.log

        if (!(group.teams.map(team => team.id).includes(Number(teamId)))) {
            return { id: groupId, result: 'does not exist in group' }
        }

        group.teams = group.teams.filter((team) => {
            return team.id != teamId
        })
        group.teams = group.teams.map((team) => {
            return JSON.stringify(team)
        })

        return this.elasticSearchApi.putGroupWithTeams(groupId, group)
            .then(body => {
                return { id: body._id, result: body.result }
            })
    }

    /**
     * returns the matches from all teams that belong to a group, sorted chronologically
     * @param {*} groupId the id of the group to get all matches from
     * @param {*} fromDate the date from which matches are going to be searched
     * @param {*} toDate the date until matches are going to be searched
     * 
     */
    async getMatchesFromGroup(groupId, fromDate, toDate) {
        const group = await this.getFavouriteGroup(groupId)

        const tasks = []

        group.content.teams.forEach(team => {
            tasks.push(this.footBallApi.getMatchesFromTeam(team.id, fromDate, toDate))
        })

        return Promise.all(tasks)
            .then(array => array.map(data => {
                return data.matches
            }))
            .then(matchesArray => {
                return flatten(matchesArray)  //[[matches for team 1],[team 2], ...]
                    .sort((o1, o2) => {
                        return Date.parse(o1.utcDate) - Date.parse(o2.utcDate) //chronological sort
                    })
            })
    }
}

/**
 * returns a new array where all members are flat
 * e.g. passing [1,2,[3,4]] will return [1,2,3,4]
 * @param {*} arr array to be flattened
 */
function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
    }, [])
}

module.exports = focaServices
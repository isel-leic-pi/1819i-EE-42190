'use strict'

/**
 * export all available routes
 */

module.exports = (app, express) => {
    app.get('/focaG4/leagues', getLeagues)
    app.get('/focaG4/leagues/:lid/teams', getTeamsFromLeague)
    app.get('/focaG4/favourites/teams', getAllFavouriteGroups)
    app.get('/focaG4/favourites/teams/:tgid', getFavouriteGroup)
    app.get('/focaG4/favourites/teams/:tgid/matches', getMatchesFromGroup)
    app.post('/focaG4/favourites/teams', express.urlencoded({ extended: true }), postGroup)
    app.put('/focaG4/favourites/teams/:tgid', express.urlencoded({ extended: true }), putGroup)
    app.put('/focaG4/favourites/teams/:tgid/add/:tid', putTeamInGroup)
    app.delete('/focaG4/favourites/teams/:tgid/remove/:tid', deleteTeamFromGroup)
    app.post('/focaG4/favourites/teams/dup', dupGroup)
    app.use(resourceNotFound)
    app.use(errorHandler)
}

const es = {
    host: 'localhost',
    port: '9200',
    teamsIndex: 'focateams'
}

// const service = require('../services/foca-services-mock').init()
const service = require('./lib/foca-services').init(
    require('./lib/football-data').init(),
    require('./lib/foca-db').init(es))

/**
 * request treatment for GET /focaG4/legues
 * @param {*} request request recieved from server
 * @param {*} response response to be sent back to client
 */
async function getLeagues(request, response, next) {
    try {
        const leagues = await service.getLeagues()
        response.json(leagues)
    } catch (error) {
        next(error)
    }
}

/**
 * request treatment for GET /focaG4/legues/lid where lid represents the league id
 * @param {*} request request recieved from server
 * @param {*} response response to be sent back to client
 */
async function getTeamsFromLeague(request, response, next) {
    try {
        const teams = await service.getTeamsFromLeague(request.params.lid)
        response.json(teams)
    } catch (error) {
        next(error)
    }
}

/**
 * request treatment for GET /focaG4/favourites/teams
 * @param {*} request request recieved from server
 * @param {*} response response to be sent back to client
 */
async function getAllFavouriteGroups(request, response, next) {
    try {
        const groups = await service.getAllFavouriteGroups(request.user.username)
        response.json(groups)
    } catch (error) {
        next(error)
    }
}

/**
 * request treatment for GET /focaG4/favourites/teams/tgid where tgid represents the group id
 * @param {*} request request recieved from server
 * @param {*} response response to be sent back to client
 */
async function getFavouriteGroup(request, response, next) {
    try {
        const group = await service.getFavouriteGroup(request.params.tgid)
        response.json(group)
    } catch (error) {
        next(error)
    }
}

/**
 * request treatment for GET /focaG4/favourites/teams/tgid/matches where tgid represents the group id
 * recieves two query string parameters that represent the dates between witch the matches are going to be searched
 * @param {*} request request recieved from server
 * @param {*} response response to be sent back to client
 */
async function getMatchesFromGroup(request, response, next) {
    const groupID = request.params.tgid
    const fromDate = request.query.fromDate
    const toDate = request.query.toDate
    try {
        const matches = await service.getMatchesFromGroup(groupID, fromDate, toDate)
        response.json(matches)
    } catch (error) {
        next(error)
    }

}

/**
 * request treatment for POST /focaG4/favourites/teams
 * @param {*} request request recieved from server
 * @param {*} response response to be sent back to client
 */
async function postGroup(request, response, next) {
    try {
        if (!request.body.name || !request.body.description) {
            return next({ statusCode: 400, message: 'name or description missing', error: 'bad request' })
        }
        const resp = await service.postGroup(request.body, request.user.username)
        response.status(resp.statusCode).json(resp)
    } catch (error) {
        next(error)
    }
}


/**
 * request treatment for PUT /focaG4/favourites/teams/tgid where tgid represents the group id
 * @param {*} request request recieved from server
 * @param {*} response response to be sent back to client
 */
async function putGroup(request, response, next) {
    try {
        if ((!request.body.name || !request.body.description)) {
            return next({ statusCode: 400, message: 'name or description missing', error: 'bad request' })
        }
        request.body.user = request.user.username
        const resp = await service.putGroup(request.params.tgid, request.body)
        response.json(resp)
    } catch (error) {
        next(error)
    }
}



/**
 * request treatment for PUT /focaG4/favourites/teams/tgid/add/tid where tgid represents the group id and tid the id of the team to be inserted into the group
 * @param {*} request request recieved from server
 * @param {*} response response to be sent back to client
 */
async function putTeamInGroup(request, response, next) {
    const groupID = request.params.tgid
    const teamID = request.params.tid
    try {
        const resp = await service.putTeamInGroup(groupID, teamID, request.user.username)
        response.json(resp)
    } catch (error) {
        next(error)
    }
}

/**
 * request treatment for DELETE /focaG4/favourites/teams/tgid/remove/tid where tgid represents the group id and tid the id of the team to be removed form the group
 * @param {*} request request recieved from server
 * @param {*} response response to be sent back to client
 */
async function deleteTeamFromGroup(request, response, next) {
    const groupID = request.params.tgid
    const teamID = request.params.tid
    try {
        const resp = await service.deleteTeamFromGroup(groupID, teamID)
        response.json(resp)
    } catch (error) {
        next(error)
    }
}

async function dupGroup(request, response, next){
    const gid = request.body.gid
    const name = request.body.name
    try {
        const resp = await service.dupGroup(gid,name)
        response.json(resp)
    } catch (err){
        next(err)
    }
}


/**
 * Returns a simple 404 response when an invalid route is requested
 * @param {*} request request recieved from server
 * @param {*} response response to be sent back to client
 */
function resourceNotFound(request, response, next) {
    next({
        statusCode: 404,
        message: 'Resource Not Found'
    })
}

function errorHandler(err, req, res, next) { //error handlers require 4 parameters 
    if (err.cause) {
        if (err.cause.code == 'ECONNREFUSED' || err.cause.code == 'ENOTFOUND') {
            err.statusCode = 504
            err.message = 'No Internet connection detected'
            err.error = 'Gateway Timeout'
        }
    }
    res.statusCode = err.statusCode
    res.json({ message: err.message, error: err.error })
}
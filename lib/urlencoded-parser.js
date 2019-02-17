/**
 * x-www-form-urlencoded parser
 */
'use strict'


module.exports = function (body) {
    const pairs = body.split('&')
    let map = {}
    pairs.forEach(pair => {
        let keyValue = pair.split('=')
        if (!map.hasOwnProperty(keyValue[0])) {
            Object.defineProperty(map, keyValue[0], {
                value: keyValue[1]
                    .replace(new RegExp('%20', 'g'), ' ')
                    .replace(new RegExp('%2C', 'g'), ','),
                writable: false
            })
        }
    })
    return map
}
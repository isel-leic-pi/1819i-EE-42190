'use strict'

module.exports = function (tasks, cb) {
    const arr = []
    let op = 0
    let f = false
    tasks.forEach((element, i) => {
        if (f) return
        element((err, res) => {
            if ((f = err)) {
                cb(err)
            } else
                arr[i] = res

            if (tasks.length == ++op)
                cb(null, arr)
        })
    })
}
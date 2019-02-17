'use strict'

module.exports = (updateNav) => {

    const button = document.getElementById('nav#signout')
    button.addEventListener('click', logoutHander)
        
    function logoutHander(event) {
        event.preventDefault()
        const url = 'http://localhost:3000/focaG4/auth/logout'
        fetch(url, { method: 'POST' })
            .then(() => {
                updateNav()
                    .then(() => {
                        window.location.hash = 'index'
                    })
            })
    }

    button.dispatchEvent(new Event('click')) //force event as click will only register function
    
}
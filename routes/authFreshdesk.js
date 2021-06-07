var fetch = require('node-fetch');

async function authFresh() {

    const response = await fetch('https://domain.freshdesk.com/api/v2/tickets', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            'user': process.env.FRESHDESK_TOKEN,
            'pass': 'X'
        }
    });
    
    if (response.status === "200") {
        return response.json();
    }
    else {
        return { error: response.status }
    }
}

module.exports = authFresh
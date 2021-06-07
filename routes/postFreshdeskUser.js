var fetch = require('node-fetch');

async function postFreshUser(data) {

    const response = await fetch('https://domain.freshdesk.com/api/v2/contacts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        auth: {
            'user': process.env.FRESHDESK_TOKEN,
            'pass': 'X'
        }
    });

    console.log(data);

    if (response.status === "200") {
        return response.json();
    }
    else {
        return { error: response.status }
    }

}

module.exports = postFreshUser
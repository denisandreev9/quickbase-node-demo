var fetch = require('node-fetch');


async function getUserInfo(token) {
	const response = await fetch('https://api.github.com/user', {
        method: 'GET',
        headers: {
			'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${process.env.GITHUB_TOKEN}`
        },
    });
    
    if (response) {
        return response.json();
    }
    else {
        return { error: response.status }
    }
}

module.exports = getUserInfo
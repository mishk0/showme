var config = require('./config.json');
var request = require('request');

var url = 'https://api.telegram.org/bot' + config.key + '/';

request(
    {
        method: 'POST',
        uri: url + 'sendMessage',
        json: true,
        body: {
            text: '1',
            chat_id: '36839438'
        }
    },
    function (error, response, body) {
        console.log(body)
    }
);

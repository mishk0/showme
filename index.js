'use strict';

var config = require('./config.json');
var request = require('request');

//request(
//    {
//        method: 'POST',
//        uri: url + 'sendVenue',
//        json: true,
//        body: {
//            chat_id: '36839438',
//            foursquare_id: '42829c80f964a5205f221fe3',
//            'latitude': '40.713718849212306',
//            'longitude': '-74.01459719955484',
//            'title': 'title',
//            'address': 'address',
//            'reply_markup': {
//                keyboard: [[{
//                    text: 'geo',
//                    request_location: true
//                }]]
//            }
//        }
//    },
//    function (error, response, body) {
//        console.log(body)
//    }
//);

function getVparam() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    var curr_day = (date < 10) ? '0' + date : date;
    var curr_month = (month < 10) ? '0' + month : month;
    var curr_year = d.getFullYear();

    return curr_year + '' + curr_month + '' + curr_day;
}


class PartyBot {
    constructor(config) {
        this.config = config;
        this._processed = [];
        this.url = `https://api.telegram.org/bot${config.key}/`;
    }

    getUpdates() {
        return new Promise((resolve) => {
            request(
                {
                    method: 'GET',
                    uri: this.url + 'getUpdates'
                },
                (error, response, body) => {
                    resolve(body);
                }
            );
        });
    }

    sendMessage(id, text) {
        return new Promise((resolve) => {
            request(
                {
                    method: 'POST',
                    uri: this.url + 'sendMessage',
                    json: true,
                    body: {
                        chat_id: id,
                        text: text,
                        //'reply_markup': {
                        //    keyboard: [[{
                        //        request_location: true
                        //    }]]
                        //}
                    }
                },
                (error, response, body) => {
                    resolve(body);
                }
            );
        })
    }

    init() {
        setInterval(() => {
            this.getUpdates().then((data) => this.processResponse(JSON.parse(data))).catch((e) => console.error(e));
        }, 5000)
    }

    processResponse(data) {
        var mess = data.result[data.result.length - 1].message;

        this.findVenues(mess.location).then((res) => {
            var message = res.reduce((text, item) => {
                text.push(item.name);
                return text;
            }, []).join(', ');

            console.log(mess.from.id, message);

            this.sendMessage(mess.from.id, message);
        }).catch((e) => console.error(e));
    }

    findVenues(ll) {
        const location = [ll.latitude, ll.longitude].join(',');

        return new Promise((resolve) => {
            request(
                {
                    method: 'GET',
                    uri:  this.config.fs + '?ll=' + location + '&client_id=' + this.config.clientId + '&client_secret=' + this.config.clientSecret + '&v=' + getVparam()
                },
                function (error, response, body) {
                    body = JSON.parse(body);

                    resolve(body.response.venues);
                }
            );
        })
    }
}

var bot = new PartyBot(config);

bot.init();

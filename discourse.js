var request = require('request');
var config = require('config');

exports.discourse = discourse = (function(){
    var api_key = config.get('discourse.api_key');
    var api_username = config.get('discourse.api_user');
    var headers = {
        'accept': 'application/json'
    };

    var query_string = {
        'api_key': api_key,
        'api_username': api_username,
    }

    function getAdminDash(){
        var url = 'http://community.p2pu.org/admin/dashboard.json';
        request.get({url: url, headers: headers, qs: query_string}, 
            function(error, response, body) {
                if (error) {
                    console.log(error);
                }
                console.log(body);
                console.log(JSON.parse(body));
            }
        );
    }

    function getLatest(){
        var query_string = {
            'api_key': api_key,
            'api_username': api_username,
            'no_definitions': 'true'
        }
        var url = 'http://community.p2pu.org/latest.json';
        var fetchAll = function(callback, topics){
            if (topics == undefined){
                topics = [];
            }
            return function (error, response, body){
                if (error) {
                    console.log(error);
                    callback(error);
                }
                var data = JSON.parse(body);
                if (data.topic_list.more_topics_url){
                    var url = 'http://community.p2pu.org' + data.topic_list.more_topics_url;
                    console.log('Getting more: ' + url);
                    request.get({url: url, headers: headers, qs: query_string}, fetchAll(callback, topics.concat(data.topic_list.topics)));
                }
                else
                {
                    callback(error, topics);
                }
            };
        };
        request.get({url: url, headers: headers, qs: query_string}, 
            fetchAll(function(error, topics) {
                if (error) {
                    console.log(error);
                }
                console.log('done');
                console.log(topics);
            })
        );
    }

    return {
        getLatest: getLatest
    };

})();

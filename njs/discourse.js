var request = require('request');
var config = require('config');

exports.discourse = (function(){
    var api_key = config.get('discourse.api_key');
    var api_username = config.get('discourse.api_user');
    var headers = {
        'accept': 'application/json'
    };

    function get(url, callback){
        var query_string = {
            'api_key': api_key,
            'api_username': api_username,
            'no_definitions': 'true'
        };
        console.log('get ' + url);
        request.get({url: url, headers: headers, qs: query_string}, function(error, response, body){
            if (error) {
                callback(error);
            } else {
                callback(null, body);
            }
        });
    }


    function getAdminDash(){
        var query_string = {
            'api_key': api_key,
            'api_username': api_username,
        }

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

    function getPost(post_id, cb){
        console.log("getPost " + post_id);
        get('http://community.p2pu.org/posts/' + post_id + '.json', function(error, body){
            if (error) { 
                cb(error); 
            } else {
                var data = JSON.parse(body);
                //console.log('Post: ' + [data.id, data.username, data.created_at].join(','));
                cb(null, data);
            }
        });
    }

    function getTopic(topic_id, callback){
        var query_string = {
            'api_key': api_key,
            'api_username': api_username,
            'no_definitions': 'true'
        }
        var url = 'http://community.p2pu.org/t/' + topic_id + '.json';
        console.log('getTopic success ' + url);
        request.get({url: url, headers: headers, qs: query_string}, function (error, response, body){
            if (error) {
                console.log(error);
                callback(error);
            } else{
                var data = JSON.parse(body);
                callback(null, data);
                //console.log(data);
                //console.log(data.posts_count);
                //console.log(data.post_stream.posts.length);
                //console.log(data.post_stream.stream.length)
            }
        });
    }

    function getLatest(cb){
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
                    cb(error);
                    console.log(error);
                }
                cb(null, topics);
                console.log('done');
//                console.log(topics);
            })
        );
    }

    return {
        get: get,
        getLatest: getLatest,
        getTopic: getTopic,
        getPost: getPost
    };

})();

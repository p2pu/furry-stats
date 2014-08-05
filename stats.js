var Q = require('q');
var request = require('request');
var config = require('config');

var token = config.get('GitHub.token');

function getOrgRepos(org){
    var deferred = Q.defer();
    var headers = {
        'Accept': 'application/vnd.github.raw+json',
        'User-Agent': 'request',
        'Authorization': 'token ' + token
    }
    var url = 'https://api.github.com/orgs/' + org +'/repos?per_page=100';
    console.log('** Getting all repositories for ' + org + ' (' + url + ')');
    request.get({url: url, headers: headers}, 
        function(error, response, body) {
            if (error) {
                deferred.reject(error);
            }
            var repos = JSON.parse(body);
            deferred.resolve(repos);
        }
    );
    return deferred.promise;
};


function getRepoStats(user, repo){
    var headers = {
        'Accept': 'application/vnd.github.raw+json',
        'User-Agent': 'request',
        'Authorization': 'token ' + token
    }

    var stats = {
        name: repo,
        full_name: user + '/' + repo
    };

    var deferred = Q.defer();
    var url = 'https://api.github.com/repos/' + user + '/' + repo + '/forks?per_page=100';
    console.log('** Getting stats for repository ' + user + '/' + repo + ' (' + url + ')');

    request.get({url: url, headers: headers}, 
        function(error, response, body) {
            if (error) {
                deferred.reject(error);
            }
            var forks = JSON.parse(body);
            stats.forks = forks;
            deferred.resolve(stats);
        }
    );
    return deferred.promise;
}


getOrgRepos('p2pu').then(function(repos){
    console.log(repos.length);
    var promises = [];
    for (var i = 0; i < repos.length; ++i){
        console.log(repos[i].name + ',' + repos[i].forks_count + ',' + repos[i].stargazers_count);
        promises.push(getRepoStats('p2pu', repos[i].name));
    }
    return Q.all(promises);
}).then(function(stats){
    console.log("Stats gathered from " + stats.length + " repositories");
    for (var i = 0; i < stats.length; ++i){
        var forks = stats[i].forks;
        for (var j = 0; j < forks.length; ++j){
            console.log(forks[j].owner.login + ',forked,' + stats[i].full_name + ',' + forks[j].created_at);
        }
    }
});


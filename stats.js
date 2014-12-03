var Q = require('q');
var request = require('request');
var config = require('config');

var stats = (function(){

    var token = config.get('GitHub.token');
    var headers = {
        'Accept': 'application/vnd.github.raw+json',
        'User-Agent': 'request',
        'Authorization': 'token ' + token
    };

    function getOrgRepos(org){
        var deferred = Q.defer();
        var url = 'https://api.github.com/orgs/' + org +'/repos?per_page=100';
        //console.log('** Getting all repositories for ' + org + ' (' + url + ')');
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


    function getRepoStargazers(user, repo){
        var deferred = Q.defer();
        var url = 'https://api.github.com/repos/' + user + '/' + repo + '/stargazers?per_page=100';

        request.get({url: url, headers: headers}, 
            function(error, response, body) {
                if (error) {
                    deferred.reject(error);
                }
                var stars = JSON.parse(body);
                deferred.resolve(stars);
            }
        );
        return deferred.promise;
    }

    function getRepoForks(user, repo){
        var deferred = Q.defer();
        var url = 'https://api.github.com/repos/' + user + '/' + repo + '/forks?per_page=100';

        request.get({url: url, headers: headers}, 
            function(error, response, body) {
                if (error) {
                    deferred.reject(error);
                }
                var forks = JSON.parse(body);
                deferred.resolve(forks);
            }
        );
        return deferred.promise;
    }


    function getRepoStats(user, repo){
        var stats = {
            name: repo,
            full_name: user + '/' + repo
        };

        return getRepoForks(user,repo).then(function(forks){
            stats.forks = forks;
        }).then(function(){
            return getRepoStargazers(user,repo);
        }).then(function(stars){
            stats.stargazers = stars;
            return stats;
        });
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
            //console.log(stats[i]);
            var stargazers = stats[i].stargazers;
            for (var j = 0; j < stargazers.length; ++j){
                console.log(stargazers[j].login + ',starred,' + stats[i].full_name);
            }
        }
    });
})();

var Q = require('q');
var discourse = require('./discourse.js').discourse;

function get_topic_posts(topic_id){
    return Q.nfcall(discourse.getTopic, topic_id).then(function(topic){
        var promises = [];
        topic.post_stream.stream.forEach(function(post_id, index){
            promises.push(Q.nfcall(discourse.getPost, post_id));
            console.log('Fetching post ' + post_id + ' (' + (1+index) + '/' + topic.post_stream.stream.length + ')');
        });
        return Q.all(promises);
    });
}

Q.nfcall(discourse.getLatest).then(function(topics){
    console.log(topics.length);
    var promises = [];
    topics.forEach(function(topic, index){
        console.log('Fetching topic ' + topic.id + ' (' + (1 + index) + '/' + topics.length + ')');
        promises.push(get_topic_posts(topic.id));
    });
    return Q.all(promises);
}).then(function(posts){
    console.log('Finally, all posts');
    console.log(posts);
}).catch(function (error) {
        // Handle any error from all above steps
    console.log('error');
}).done();

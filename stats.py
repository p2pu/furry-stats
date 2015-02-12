import discourse
from config import config

def getDiscourseStats(forum_url):
    forum_config = config.forums.get(forum_url)
    credentials = {
        'api_key': forum_config.get('api_key'),
        'api_username': forum_config.get('api_username')
    }
    api = discourse.DiscourseApi(forum_url, credentials)
    posts = []
    post_ids = []
    topics = api.getAllTopics()
    for topic in topics:
        print('Get topic {0} data'.format(topic['id']))
        topic_data = api.getTopic(topic['id'])
        post_ids += topic_data['post_stream']['stream']
    for post_id in post_ids:
        print('Get post {0} data'.format(post_id))
        post_data = api.getPost(post_id)
        posts += [post_data]
    return posts, topics

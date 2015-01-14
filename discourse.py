import requests

from beaker.cache import CacheManager
from beaker.util import parse_cache_config_options

class DiscourseApi(object):
    def __init__(self, forum_url, credentials):
        self.forum_url = forum_url
        self.credentials = credentials
        cache_opts = {
            'cache.type': 'file',
            'cache.data_dir': '/tmp/' + forum_url + '-cache/data',
            'cache.lock_dir': '/tmp/' + forum_url + '-cache/lock'
        }
        cache = CacheManager(**parse_cache_config_options(cache_opts))
        self.cache = cache

        if cache:
            # TODO initialize the cache only if it's supplied 
            #self.getTopic = cache.cache('discourse.DiscourseApi.getTopic', expire=86400)(self.getTopic)
            #self.getPost = cache.cache('discourse.DiscourseApi.getPost')(self.getPost)
            pass


    def _get(self, url):
        headers = {
            'accept': 'application/json'
        }
        query_string = {
            'api_key': self.credentials['api_key'],
            'api_username': self.credentials['api_username'],
            'no_definitions': 'true'
        }
        url = ''.join([self.forum_url, url])
        print('Getting {0}'.format(url))
        resp = requests.get(url, headers=headers, params=query_string)
        return resp


    def getAllTopics(self):
        url = '/latest.json'
        resp = self._get(url)
        topics = resp.json()['topic_list']['topics']
        while 'more_topics_url' in resp.json()['topic_list'].keys():
            url = resp.json()['topic_list']['more_topics_url']
            print("Getting more topics from " + url)
            resp = self._get(url)
            topics += resp.json()['topic_list']['topics']
        return topics

    #@cache.cache('discourse.DiscourseApi.getTopic', expire=86400)
    def getTopic(self, topic_id):
        resp = self._get('/t/{0}.json'.format(topic_id))
        return resp.json()


    #@cache.cache('discourse.DiscourseApi.getPost')
    def getPost(self, post_id):
        resp = self._get('/posts/{0}.json'.format(post_id))
        return resp.json()

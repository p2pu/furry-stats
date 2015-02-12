import requests

class GithubApi(object):
    def __init__(self, token):
        self.token = token

    def _get(self, url, query_string=None):
        headers = {
            'Accept': 'application/vnd.github.raw+json',
            'User-Agent': 'request',
            'Authorization': 'token ' + self.token
        }
        return requests.get(url, headers=headers, params=query_string)

    def get_org_repos(self, org):
        url = 'https://api.github.com/orgs/{0}/repos?per_page=100'.format(org)
        #console.log('** Getting all repositories for ' + org + ' (' + url + ')');
        resp = self._get(url)
        return resp.json()


    def get_repo_stargazers(self, user, repo):
        url = 'https://api.github.com/repos/{0}/{1}/stargazers?per_page=100'.format(user, repo)
        resp = self._get(url)
        return resp.json()

    def get_repo_forks(self, user, repo):
        url = 'https://api.github.com/repos/{0}/{1}/forks?per_page=100'.format(user, repo)
        resp = self._get(url)
        return resp.json()

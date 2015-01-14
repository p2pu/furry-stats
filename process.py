from collections import Counter
import json
import datetime

def process_discourse_stats(data):
    
    #TODO - remove this
    with open('community.p2pu.org.json', 'r') as infile:
        data = json.load(infile)
    print(len(data))

    event_list = [ {
        'id': d['id'], 
        'created_at': datetime.datetime.strptime(d['created_at'], "%Y-%m-%dT%H:%M:%S.%fZ"),
    } for d in data]

    daily = Counter([d['created_at'].date() for d in event_list]).items()
    daily.sort(key=lambda x: x[0])
    daily_data = {
        "labels": [d[0].strftime('%Y-%m-%d') for d in daily],
        "values": [d[1] for d in daily],
        "data": [ [d[0].strftime('%Y-%m-%d'), d[1]] for d in daily ]
    }
    with open('daily.json', 'w') as outfile:
        json.dump(daily_data, outfile)

    return event_list

# keys = ['id','created_at','username','topic_id','topic_slug','reply_to_post_number']

from collections import Counter
import json
import datetime

def iso_year_start(iso_year):
    "The gregorian calendar date of the first day of the given ISO year"
    fourth_jan = datetime.date(iso_year, 1, 4)
    delta = datetime.timedelta(fourth_jan.isoweekday()-1)
    return fourth_jan - delta 


def iso_to_gregorian(iso_year, iso_week, iso_day):
    "Gregorian calendar date for the given ISO year, week and day"
    year_start = iso_year_start(iso_year)
    return year_start + datetime.timedelta(days=iso_day-1, weeks=iso_week-1)


def process_discourse_stats(data):
    
    #TODO - remove this
#    with open('community.p2pu.org.json', 'r') as infile:
#        data = json.load(infile)
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

    weekly = Counter(['{0[0]}-{0[1]:02}'.format(d['created_at'].date().isocalendar()[:2]) for d in event_list]).items()
    weekly.sort(key=lambda x: x[0])
    weekly_data = {
        "labels": [iso_to_gregorian(*[ int(i) for i in d[0].split('-')] + [1]).strftime('%Y-%m-%d') for d in weekly],
        "values": [d[1] for d in weekly],
        "data": [
            [
                iso_to_gregorian(*[ int(i) for i in d[0].split('-')] + [1]).strftime('%Y-%m-%d'),
                d[1]
            ] for d in weekly 
        ]
    }
    with open('weekly.json', 'w') as outfile:
        json.dump(weekly_data, outfile)

    return event_list

# keys = ['id','created_at','username','topic_id','topic_slug','reply_to_post_number']

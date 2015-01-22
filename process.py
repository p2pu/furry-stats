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


def get_number_of_active_users_by_week(data):
    weekly_users = {}
    for event in data:
        week = datetime.datetime.strptime(event['created_at'], "%Y-%m-%dT%H:%M:%S.%fZ").date().isocalendar()[:2]
        if week in weekly_users:
            weekly_users[week] += [event['username']]
        else:
            weekly_users[week] = [event['username']]

    weekly = [ [iso_to_gregorian(key[0], key[1], 1), set(val)] for key,val in weekly_users.items() ]
    weekly.sort(key=lambda x: x[0])

    weekly_data = {
        "labels": [d[0].strftime('%Y-%m-%d')  for d in weekly],
        "values": [len(d[1]) for d in weekly],
        "data": [ [d[0].strftime('%Y-%m-%d'), len(d[1]), {'users': list(d[1])}] for d in weekly ]
    }

    return weekly_data


def get_weekly_posts(data):
    event_list = [ {
        'id': d['id'], 
        'created_at': datetime.datetime.strptime(d['created_at'], "%Y-%m-%dT%H:%M:%S.%fZ"),
    } for d in data]

    weekly = Counter(['{0[0]}-{0[1]:02}'.format(d['created_at'].date().isocalendar()[:2]) for d in event_list]).items()
    weekly.sort(key=lambda x: x[0])
    format_date = lambda d : iso_to_gregorian(*[ int(i) for i in d.split('-')] + [1]).strftime('%Y-%m-%d') 
    weekly_data = {
        "labels": [format_date(d[0]) for d in weekly],
        "values": [d[1] for d in weekly],
        "data": [ [format_date(d[0]), d[1]] for d in weekly ]
    }
    return weekly_data


def get_daily_posts(data):
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
    return daily_data


def process_discourse_stats(data):
    daily_data = get_daily_posts(data)
    with open('daily.json', 'w') as outfile:
        json.dump(daily_data, outfile)

    weekly_data = get_weekly_posts(data)
    with open('weekly.json', 'w') as outfile:
        json.dump(weekly_data, outfile)

    weekly_user_data = get_number_of_active_users_by_week(data)
    with open('weekly-users.json', 'w') as outfile:
        json.dump(weekly_user_data, outfile)

# keys = ['id','created_at','username','topic_id','topic_slug','reply_to_post_number']

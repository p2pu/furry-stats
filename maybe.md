# HTML5 component to show time stamped events.

- Date input for start date and end date
- Radio button for daily/monthly
- Data is fetched from server:

> GET /data/source_name/daily.json?start_date=2013-01-01&end_date=2015-01-01
> GET /data/source_name/monthly.json?start_date=2013-01-01&end_date=2015-01-01

- returned data is in the following format:

    {
        labels: ['2013-01-01', ...],
        values: [2, 1, ...],
        data: [
            ['2013-01-01', 2, [{optional_event_info}, {optional_event_info}] ],
            ['2013-01-01', 1],
            ['2013-01-01', 1]
        ]
    }

- Possible to pre-process data and serve static files.
- Server can parse query string and return the correct ranges

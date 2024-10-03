from datetime import timedelta, datetime

def date_filtering(queryset, date_filter):
    today = datetime.now().date()

    if date_filter == "today":
        queryset = queryset.filter(date=today)
    elif date_filter == "yesterday":
        yesterday = today - timedelta(days=1)
        queryset = queryset.filter(date=yesterday)
    elif date_filter == "this_week":
        start_week = today - timedelta(days=today.weekday())
        queryset = queryset.filter(date__gte=start_week, date__lte=today)
    elif date_filter == "this_month":
        start_month = today.replace(day=1)
        queryset = queryset.filter(date__gte=start_month, date__lte=today)
    elif "to" in date_filter:
        try:
            start_date_str, end_date_str = date_filter.split('to')
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

            queryset = queryset.filter(date__gte=start_date, date__lte=end_date)

        except ValueError as val_err:
            raise ValueError("Invalid date format: Extpected 'YYYY-MM-DDtoYYYY-MM-DD'")
    elif date_filter == 'all':
        queryset = queryset
    else:
        raise ValueError("Invalid options: Expected options 'today', 'yesterday', 'this_week', 'this_month' and 'YYYY-MM-DDtoYYYY-MM-DD'")
    
    return queryset


def sort_filtering(queryset, sort_by_filter):
    if sort_by_filter == "newest":
        queryset = queryset.order_by('-date', '-updated_at')
    elif sort_by_filter == "oldest":
        queryset = queryset.order_by('date', 'updated_at')
    elif sort_by_filter == 'reset':
        queryset = queryset
    else:
        raise ValueError("Invalid option: Expected options are 'newest' and 'oldest'")
    return queryset
    
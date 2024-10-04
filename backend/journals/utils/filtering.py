from datetime import timedelta, datetime
from django.db import models


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
        queryset = queryset.order_by('-date', '-created_at')
    elif sort_by_filter == "oldest":
        queryset = queryset.order_by('date', 'created_at')
    elif sort_by_filter == 'reset':
        queryset = queryset
    else:
        raise ValueError("Invalid option: Expected options are 'newest' and 'oldest'")
    return queryset


def due_days_filtering(queryset, due_days_filter):
    today = datetime.now().date()
    if due_days_filter == 'all':
        queryset = queryset
    else:
        queryset = queryset.filter(models.Q(status="unpaid") | models.Q(status="partially_paid"))

        if due_days_filter == "in_two":
            two_days = today + timedelta(days=2)
            queryset = queryset.filter(due_date__lte=two_days, due_date__gte=today)
        elif due_days_filter == "three_to_seven":
            three_days = today + timedelta(days=3)
            seven_days = today + timedelta(days=7)
            queryset = queryset.filter(due_date__lte=seven_days, due_date__gte=three_days)
        elif due_days_filter == "eight_to_thirty":
            eight_days = today + timedelta(days=8)
            thirty_days = today + timedelta(days=30)
            queryset = queryset.filter(due_date__lte=thirty_days, due_date__gte=eight_days)

        elif due_days_filter == "than_thirty":
            thirty_days = today + timedelta(days=30)
            queryset = queryset.filter(due_date__gte=thirty_days)

        elif due_days_filter == "overdue":
            queryset = queryset.filter(due_date__lte=today)
        
        else:
            raise ValueError("Invalid options: Expected options 'in_two', 'three_to_seven', 'eight_to_thirty', 'than_thirty', 'all' or 'overdue'")
        
    return queryset


def status_filtering(queryset, status_filter):

    try:
        if status_filter not in ["paid", "partially_paid", "unpaid", "all"]:
            raise ValueError("Invalid options: Expected options 'paid', 'unpaid', 'all' or 'partially_paid'")
        elif status_filter == "all":
            queryset = queryset
        else:
            
            queryset = queryset.filter(status=status_filter)

        return queryset
    except Exception as e:
        raise ValueError(str(e))

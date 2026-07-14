from datetime import datetime


def is_positive_number(value):
    try:
        return float(value) > 0
    except (TypeError, ValueError):
        return False


def is_valid_date(date_string):
    try:
        datetime.strptime(date_string, "%Y-%m-%d")
        return True
    except (TypeError, ValueError):
        return False


def is_non_empty_string(value):
    return isinstance(value, str) and value.strip() != ""
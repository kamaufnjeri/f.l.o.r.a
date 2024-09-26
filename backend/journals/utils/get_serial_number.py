def get_serial_number(items, initial_name, items_length):
    number = items_length + 1
    serial_number = f'{initial_name}-{number}'
    for item in items:
        if item.serial_number == serial_number:
            serial_number = get_serial_number(items, initial_name, items_length + 1)
    return serial_number
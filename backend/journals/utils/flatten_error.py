def flatten_errors(errors):
    flattened_errors = {}
    print(errors)
    if isinstance(errors, dict):
        for field, error_list in errors.items():
            if isinstance(error_list, list):
                error_items = []
                for error in error_list:
                    if isinstance(error, dict):
                        for sub_field, sub_errors in error.items():
                            if isinstance(sub_errors, list):
                                for error in sub_errors:
                                    flattened_errors[f"{field}.{sub_field}"] = error
                            else:
                                flattened_errors[f"{field}.{sub_field}"] = sub_errors
                    else:
                        error_items.append(error)
                if error_items:
                    flattened_errors[f"{field}"] = ", ".join(error_items)
                
           
            elif isinstance(error_list, dict):
                for sub_field, sub_errors in error_list.items():
                    if isinstance(sub_errors, list):
                        for error in sub_errors:
                            flattened_errors[f"{field}.{sub_field}"] = error
                    else:
                        flattened_errors[f"{field}.{sub_field}"] = sub_errors
            else:
                flattened_errors[field] = str(error_list)
    elif isinstance(errors, list):
        flattened_errors['Errors'] = ', '.join(errors)
    else:
        flattened_errors['Errors'] = str(errors)
    return flattened_errors
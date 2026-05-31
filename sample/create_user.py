#!/usr/bin/python3
"""sample usage of user"""
from config import get_db, Base, engine
from models import User

Base.metadata.create_all(engine)


data = {"first_nam": "flo", "last_name": "Kamau", "email": "flokama@gmail.com", "password_hash": "123456"}
with get_db() as db:
    try:
        if not User.validate_email(data.get('email')):
            raise ValueError(f'Invalid email')
        if User.email_exist(db, data.get('email')):
            raise ValueError(f'User with email already exists')
        
        new_user = User.create(db, **data)

        print(new_user.email)
        db.commit()
    except Exception as e:
        print(f'Error: {str(e)}')

with get_db() as db:
    try:
        users = User.get_all(db)
        user_list = []
        for user in users:
            user_list.append(user.first_name)
        print(user_list)
        user = User.get_by_column(db, "email", "flokamau@gmail.com", True)
        delete_user = User.delete(db, 1)
        if not delete_user:
            print('No user with id 1 found')
        deleted_user = User.delete(db, "97b4742e-ca4e-48bd-a776-c76ca6898997")
        update_data = {"first_name": "flozzy"}
        update_user = User.update(db, "c73a06ba-6125-426b-9f10-2c6bcf1355ae", **update_data)
        if update_user:
            print(f"User updated successfully {update_user.first_name}")
        else:
            print("Error updating user")
        db.commit()
        if deleted_user:
            print('user deleted')
        print(user.first_name)
    except Exception as e:
        print(f'Error: {str(e)}')
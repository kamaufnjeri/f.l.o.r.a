#!/usr/bin/python3
"""User model"""
from config import BaseModel
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship, backref
import re


class User(BaseModel):
    __tablename__ = "users"
    first_name = Column(String(128), nullable=False)
    last_name = Column(String(128), nullable=False)
    email = Column(String(128), nullable=False, unique=True)
    is_verified = Column(Boolean, default=False)
    password_hash = Column(String(128), nullable=False)
    phone_number = Column(String(15))


    @staticmethod
    def validate_email(email):
        """Verify email is valid"""
        email_regex = re.compile(r'^[0-9A-Za-z]+@[a-z]{2,}\.[a-z]{2,}$')
        return email_regex.match(email)
    
    @staticmethod
    def email_exist(session, email):
        user = session.query(User).filter_by(email=email).first()
        if user:
            return True
        else:
            return False


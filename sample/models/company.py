#!/usr/bin/python3
"""Model for the company"""
from sqlalchemy import Column, String
from config import BaseModel
from sqlalchemy.orm import relationship, backref



class Company(BaseModel):
    __tablename__ = "companies"
    name = Column(String(128),nullable=False)
    email = Column(String(128), nullable=False, unique=True)
    country = Column(String(128))
    currency = Column(String(128))
    accounts = relationship('Account', backref=backref('company', lazy='dynamic'))


    @staticmethod
    def email_exists(session, email):
        company = session.query(Company).filter_by(email=email).first()
        if company:
            return True
        else:
            return False

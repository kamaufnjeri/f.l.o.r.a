#!/usr/bin/python3
"""Model for suppliers and customers of the company"""
from config import BaseModel
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship


class Person(BaseModel):
    __tablename__ = "persons"
    account_id = Column(String, ForeignKey('accounts.id'))
    name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String)
    """category can either be customer or supplier"""
    category = Column(String, nullable=False)

    account = relationship('Account', back_ref='owner', lazy='dynamic')
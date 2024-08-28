#!/usr/bin/python3
"""Model for journals to be made"""

from sqlalchemy import Column, String, ForeignKey, Text, Date
from sqlalchemy.orm import relationship, backref
from config import BaseModel


class Journal(BaseModel):
    __tablename__ = 'journals'
    date = Column(Date, nullable=False)
    description = Column(Text)
    user_id = Column(String, ForeignKey('users.id'))
    company_id = Column(String, ForeignKey('companies.id'))

    user = relationship("User", backref=backref('journals', lazy='dynamic'))
    company = relationship("Company", backref=backref('journals', lazy='dynamic'))

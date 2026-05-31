#!/usr/bin/python3
"""Account model"""

from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship, backref
from config import BaseModel

class Account(BaseModel):
    __tablename__ = 'accounts'
    name = Column(String, nullable=False)
    """can either be asset, liability, capital, income or expense"""
    category = Column(String, nullable=False)
    """category can be divided to sub categories eg asset current and non current"""
    sub_category = Column(String, nullable=False)
    debit_total = Column(Float, default=0.0)
    credit_total = Column(Float, default=0.0)
    user_id = Column(String(36), ForeignKey('users.id'))
    company_id = Column(String(36), ForeignKey('companies.id'))
    user = relationship('User', backref=backref('accounts', lazy='dynamic'))


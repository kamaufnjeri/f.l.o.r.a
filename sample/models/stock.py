#!/usr/bin/python3
"""Model for stocks offered by a company"""

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm  import relationship, backref
from config import BaseModel



class Stock(BaseModel):
    __tablename__ = "stocks"
    name = Column(String, nullable=False)
    total_quantity = Column(Integer, default=0)
    user_id = Column(String, ForeignKey('users.id'))
    company_id = Column(String, ForeignKey('companies.id'))
    """eg kilograms"""
    unit_name = Column(String)
    """eg kgs"""
    unit_alias = Column(String)

    user = relationship("User", backref=backref('stocks', lazy='dynamic'))
    company = relationship("Company", backref=backref('stocks', lazy='dynamic'))

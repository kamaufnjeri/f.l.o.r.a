#!/usr/bin/python3
"""sales entries model for a stock"""
from sqlalchemy import Column, Integer, Float, ForeignKey, String
from sqlalchemy.orm import relationship, backref
from config import BaseModel


class SalesEntry(BaseModel):
    __tablename__ = 'sales_entries'
    journal_id = Column(String, ForeignKey('journals.id'))
    stock_id = Column(String, ForeignKey('stocks.id'))
    quantity = Column(Integer)
    price = Column(Float)
    cogs = Column(Float)

    journal = relationship("Journal", backref=backref('sales_entries', lazy='dynamic'))
    stock = relationship("Stock", backref=backref('sales_entries', lazy='dynamic'))

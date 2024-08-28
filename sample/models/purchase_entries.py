#!/usr/bin/python3
"""Purchase entries model for a stock"""
from sqlalchemy import Column, Integer, Float, ForeignKey, String
from sqlalchemy.orm import relationship, backref
from config import BaseModel


class PurchaseEntry(BaseModel):
    __tablename__ = 'purchase_entries'
    journal_id = Column(String, ForeignKey('journals.id'))
    stock_id = Column(String, ForeignKey('stocks.id'))
    quantity = Column(Integer)
    """incase of a sale the remaining quantity"""
    rem_quantity = Column(Integer)
    price = Column(Float)
    cogs = Column(Float)

    journal = relationship("Journal", backref=backref('purchase_entries', lazy='dynamic'))
    stock = relationship("Stock", backref=backref('purchase_entries', lazy='dynamic'))

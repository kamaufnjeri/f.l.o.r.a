#!/usr/bin/python3
"""returns entries model for a stock"""
from sqlalchemy import Column, Integer, Float, ForeignKey, String
from sqlalchemy.orm import relationship, backref
from config import BaseModel


class ReturnsEntry(BaseModel):
    __tablename__ = 'returns_entries'
    journal_id = Column(String, ForeignKey('journals.id'))
    purchase_id = Column(String, ForeignKey('puchase_entries.id'))
    sales_id = Column(String, ForeignKey('sales_entries.id'))
    quantity = Column(Integer)
    """incase of a return can be purchase return or sales return"""
    category = Column(String)
    price = Column(Float)
    cogs = Column(Float)

    journal = relationship("Journal", backref=backref('returns_entries', lazy='dynamic'))
    purchase_entry = relationship("PurchaseEntry", backref=backref('returns_entries', lazy='dynamic'))
    sales_entry = relationship('SalesEntry', backref=backref('return_entries', lazy='dynamic'))

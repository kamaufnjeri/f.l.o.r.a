#!/usr/bin/python3
"""Models that show the purchase prices of an item sold"""
from sqlalchemy import Float, Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship, backref
from config import BaseModel


class SalesPurchasePrice(BaseModel):
    __tablename__ = 'sales_purchase_prices'
    purchase_price = Column(Float)
    sales_price = Column(Float)
    quantity = Column(Integer)
    purchase_id = Column(String, ForeignKey('purchase_entries.id'))
    sales_id = Column(String, ForeignKey('sales_entries.id'))

    purchase_entry = relationship("PurchaseEntry", backref=backref('sales_purchase_prices', lazy='dynamic'))
    sales_entry = relationship("SalesEntry", backref=backref('sales_purchase_prices', lazy='dynamic'))

#!/usr/bin/python3
"""Model for invoices """

from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship, backref
from config import BaseModel


class Invoice(BaseModel):
    __tablename__ = 'invoices'
    journal_id = Column(String, ForeignKey('journals.id'))
    """status can be not paid, partially paid or fully paid"""
    status = Column(String, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    amount_paid = Column(Float, default=0.0, nullable=False)

    journal = relationship("Journal", backref=backref('invoice', lazy='dynamic'))
#!/usr/bin/python3
"""Model that shows all entries of a journal"""

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship, backref, Float
from config import BaseModel


class JournalEntry(BaseModel):
    __tablename__ = "journal_entries"
    journal_id = Column(String, ForeignKey('journals.id'))
    amount = Column(Float, nullable=False)
    """can either be debit or credit"""
    debit_credit = Column(String)
    account_id = Column(String, ForeignKey('accounts.id'))

    journal = relationship("Journal", backref=backref('journal_entries', lazy='dynamic'))
    account = relationship("Account", backref=backref('journal_entries', lazy='dynamic'))
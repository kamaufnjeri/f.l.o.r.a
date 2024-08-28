#!/usr/bin/python3
"""Messages table that show messages being sent"""
from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship, backref
from config import BaseModel


class Message(BaseModel):
    __tablename__ = 'messages'
    sender_id = Column(String, ForeignKey('users.id'))
    receiver_id = Column(String, ForeignKey('users.id'), nullable=True)
    company_id = Column(String, ForeignKey('company.id'), nullable=True)
    content = Column(Text)
    sender = relationship("User", foreign_keys=[sender_id], backref=backref('sent_messages', lazy='dynamic'))
    receiver = relationship("User", foreign_keys=[receiver_id], backref=backref('received_messages', lazy='dynamic'))
    company = relationship("Company", backref=backref('messages', lazy='dynamic'))
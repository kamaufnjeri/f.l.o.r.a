#!/usr/bin/python3
"""Model for the notifications to be sent to the users"""
from sqlalchemy import Column, String, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship, backref
from config import BaseModel


class Notifications(BaseModel):
    __tablename__ = 'notifications'
    user_id = Column(String, ForeignKey('users.id'))
    content = Column(Text)
    read = Column(Boolean, default=False)

    user = relationship("User", backref=backref('notifications', lazy='dynamic'))

#!/usr/bin/python3
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship, backref
from config import BaseModel



class UserCompany(BaseModel):
    __tablename__ = "users_companies"
    user_id = Column(String(36), ForeignKey('users.id'))
    company_id = Column(String(36), ForeignKey('companies.id'))
    role = Column(String(128), nullable=False)

    users = relationship('User', backref=backref("user_companies", lazy='dynamic'))
    companies = relationship('Company', backref=backref("company_users", lazy='dynamic'))    


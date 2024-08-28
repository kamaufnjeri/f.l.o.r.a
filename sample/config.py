#!/usr/bin/python3
from sqlalchemy import create_engine, Column, DateTime, func, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from uuid import uuid4 as uuidv4
from contextlib import contextmanager


base_dir = os.path.abspath(os.path.dirname(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(base_dir, 'balance_buddy.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False)

Base = declarative_base()


class BaseModel(Base):
    """BaseModel class to be used on all other models"""
    id = Column(String, primary_key=True, default=lambda: str(uuidv4()), nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True),  default=func.now(), server_default=func.now(), onupdate=func.now(), nullable=False)

    """ensure this class is not created as a table in database"""
    __abstract__ = True

    @classmethod
    def get_all(cls, session):
        """Get all records."""
        return session.query(cls).all()
    
    @classmethod
    def get_by_id(cls, session, id):
        """get an item by their id"""
        return session.query(cls).filter_by(id=id).first()
    
    @classmethod
    def get_by_column(cls, session, column_name, value, single=False):
        """get an item or items by column"""
        column = getattr(cls, column_name, None)

        if column is None:
            raise ValueError(f"Column '{column_name}' does not exist in model '{cls.__name__}'")
        
        query = session.query(cls).filter( column == value)
        return query.first() if single else query.all()
    

    @classmethod
    def delete(cls, session, id):
        """delete an record by its id"""
        record = cls.get_by_id(session, id)
        if record:
            session.delete(record)
            return True
        return False
    
    @classmethod
    def update(cls, session, id, **kwargs):
        """updating record in database by id"""
        valid_args = {key: value for key, value in kwargs.items() if hasattr(cls, key)}

        attributes = [col.name for col in cls.__table__.columns if col.server_default is None and col.name != "id"]
        if not valid_args:
            raise ValueError(f"The attributes needed are: {', '.join(attributes)}")

        
        record = cls.get_by_id(session, id)
        if record:
            for key, value in kwargs.items():
                setattr(record, key, value)
            return record
        return None
    
    @classmethod
    def create(cls, session, **kwargs):
        """create a new record to database"""
        valid_args = {key: value for key, value in kwargs.items() if hasattr(cls, key)}

        attributes = [col.name for col in cls.__table__.columns if col.server_default is None]
        if not valid_args:
            raise ValueError(f"The attributes needed are: {', '.join(attributes)}")

        
        """get attributes that are required not null and have no default"""
        required_attrs = [col.name for col in cls.__table__.columns if col.default is None and not col.nullable]

        if any(attr not in valid_args for attr in required_attrs):
            missing_attrs = [attr for attr in required_attrs if attr not in valid_args]
            raise ValueError(f"Missing required attributes: {', '.join(missing_attrs)}")
        
        new_record = cls(**kwargs)
        session.add(new_record)
        return new_record
        
@contextmanager 
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
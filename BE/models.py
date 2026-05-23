from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

class FinanceRecord(Base):
    __tablename__ = "finance_records"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True) # "income" or "expense"
    amount = Column(Float)
    description = Column(String, default="")
    date = Column(Date)

class HarvestRecord(Base):
    __tablename__ = "harvest_records"
    id = Column(Integer, primary_key=True, index=True)
    block_name = Column(String, index=True)
    tonnage = Column(Float)
    estimated_income = Column(Float)
    date = Column(Date)

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    current_stock = Column(Float)
    unit = Column(String)

class PlantationBlock(Base):
    __tablename__ = "plantation_blocks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    area_size = Column(Float)
    status = Column(String)
    coordinates = Column(String) # JSON string
    plant_age = Column(Integer, default=0)

class TbsPrice(Base):
    __tablename__ = "tbs_prices"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True)
    price = Column(Float)

class News(Base):
    __tablename__ = "news"
    id = Column(Integer, primary_key=True, index=True)
    headline = Column(String)
    summary = Column(String)
    date = Column(Date)

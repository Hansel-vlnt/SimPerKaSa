from pydantic import BaseModel
from datetime import date
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class FinanceRecordBase(BaseModel):
    type: str
    amount: float
    description: str = ""
    date: date

class FinanceRecordCreate(FinanceRecordBase):
    pass

class FinanceRecord(FinanceRecordBase):
    id: str

    class Config:
        from_attributes = True


class HarvestRecordBase(BaseModel):
    block_name: str
    tonnage: float
    estimated_income: float
    date: date

class HarvestRecordCreate(HarvestRecordBase):
    pass

class HarvestRecord(HarvestRecordBase):
    id: str

    class Config:
        from_attributes = True


class InventoryBase(BaseModel):
    item_name: str
    current_stock: float
    unit: str

class InventoryCreate(InventoryBase):
    pass

class Inventory(InventoryBase):
    id: str

    class Config:
        from_attributes = True


class PlantationBlockBase(BaseModel):
    name: str
    area_size: float
    status: str
    coordinates: str
    plant_age: int = 0

class PlantationBlockCreate(PlantationBlockBase):
    pass

class PlantationBlock(PlantationBlockBase):
    id: str

    class Config:
        from_attributes = True

class TbsPriceBase(BaseModel):
    date: date
    price: float

class TbsPriceCreate(TbsPriceBase):
    pass

class TbsPrice(TbsPriceBase):
    id: str

    class Config:
        from_attributes = True

class NewsBase(BaseModel):
    headline: str
    summary: str
    date: date

class NewsCreate(NewsBase):
    pass

class News(NewsBase):
    id: str

    class Config:
        from_attributes = True

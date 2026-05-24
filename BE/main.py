from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from bson.errors import InvalidId

import schemas
from database import get_db

app = FastAPI(title="SimPerKaSa API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def serialize_doc(doc):
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc

def get_query_id(id_str: str):
    try:
        return {"$in": [id_str, ObjectId(id_str)]}
    except InvalidId:
        return id_str

# --- Auth / Login ---

@app.post("/api/login")
async def login_admin(req: schemas.LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    admin = await db["admins"].find_one({"username": req.username})
    if not admin or admin.get("password") != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {"ok": True, "token": "dummy_token_for_now", "username": admin["username"]}

# --- Finance Records ---

@app.get("/api/finances", response_model=List[schemas.FinanceRecord])
async def read_finances(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db["finances"].find()
    docs = await cursor.to_list(length=1000)
    return [serialize_doc(doc) for doc in docs]

@app.post("/api/finances", response_model=schemas.FinanceRecord)
async def create_finance(finance: schemas.FinanceRecordCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = finance.model_dump()
    # convert date to datetime
    if "date" in doc:
        doc["date"] = str(doc["date"])
    res = await db["finances"].insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)

@app.delete("/api/finances/{finance_id}")
async def delete_finance(finance_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    res = await db["finances"].delete_one({"_id": get_query_id(finance_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"ok": True}

# --- Harvest Records ---

@app.get("/api/harvests", response_model=List[schemas.HarvestRecord])
async def read_harvests(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db["harvests"].find()
    docs = await cursor.to_list(length=1000)
    return [serialize_doc(doc) for doc in docs]

@app.post("/api/harvests", response_model=schemas.HarvestRecord)
async def create_harvest(harvest: schemas.HarvestRecordCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = harvest.model_dump()
    if "date" in doc:
        doc["date"] = str(doc["date"])
    res = await db["harvests"].insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)

@app.delete("/api/harvests/{harvest_id}")
async def delete_harvest(harvest_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    res = await db["harvests"].delete_one({"_id": get_query_id(harvest_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"ok": True}

# --- Inventory ---

@app.get("/api/inventory", response_model=List[schemas.Inventory])
async def read_inventory(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db["inventory"].find()
    docs = await cursor.to_list(length=1000)
    return [serialize_doc(doc) for doc in docs]

@app.post("/api/inventory", response_model=schemas.Inventory)
async def create_inventory(item: schemas.InventoryCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = item.model_dump()
    res = await db["inventory"].insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)

@app.delete("/api/inventory/{item_id}")
async def delete_inventory(item_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    res = await db["inventory"].delete_one({"_id": get_query_id(item_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True}

# --- Plantation Blocks ---

@app.get("/api/blocks", response_model=List[schemas.PlantationBlock])
async def read_blocks(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db["blocks"].find()
    docs = await cursor.to_list(length=1000)
    return [serialize_doc(doc) for doc in docs]

@app.post("/api/blocks", response_model=schemas.PlantationBlock)
async def create_block(block: schemas.PlantationBlockCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = block.model_dump()
    res = await db["blocks"].insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)

@app.delete("/api/blocks/{block_id}")
async def delete_block(block_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    res = await db["blocks"].delete_one({"_id": get_query_id(block_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Block not found")
    return {"ok": True}

# --- TBS Prices ---

@app.get("/api/tbs_prices", response_model=List[schemas.TbsPrice])
async def read_tbs_prices(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db["tbs_prices"].find().sort("date", 1)
    docs = await cursor.to_list(length=1000)
    return [serialize_doc(doc) for doc in docs]

@app.post("/api/tbs_prices", response_model=schemas.TbsPrice)
async def create_tbs_price(price: schemas.TbsPriceCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = price.model_dump()
    if "date" in doc:
        doc["date"] = str(doc["date"])
    res = await db["tbs_prices"].insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)

@app.delete("/api/tbs_prices/{price_id}")
async def delete_tbs_price(price_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    res = await db["tbs_prices"].delete_one({"_id": get_query_id(price_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Price not found")
    return {"ok": True}

# --- News ---

@app.get("/api/news", response_model=List[schemas.News])
async def read_news(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db["news"].find().sort("date", -1)
    docs = await cursor.to_list(length=1000)
    return [serialize_doc(doc) for doc in docs]

@app.post("/api/news", response_model=schemas.News)
async def create_news(news: schemas.NewsCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = news.model_dump()
    if "date" in doc:
        doc["date"] = str(doc["date"])
    res = await db["news"].insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)

@app.delete("/api/news/{news_id}")
async def delete_news(news_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    res = await db["news"].delete_one({"_id": get_query_id(news_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="News not found")
    return {"ok": True}

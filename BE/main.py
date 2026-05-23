from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SimPerKaSa API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth / Login ---

@app.post("/api/login")
def login_admin(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.username == req.username).first()
    if not admin or admin.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {"ok": True, "token": "dummy_token_for_now", "username": admin.username}

# --- Finance Records ---

@app.get("/api/finances", response_model=List[schemas.FinanceRecord])
def read_finances(db: Session = Depends(get_db)):
    return db.query(models.FinanceRecord).all()

@app.post("/api/finances", response_model=schemas.FinanceRecord)
def create_finance(finance: schemas.FinanceRecordCreate, db: Session = Depends(get_db)):
    db_finance = models.FinanceRecord(**finance.dict())
    db.add(db_finance)
    db.commit()
    db.refresh(db_finance)
    return db_finance

@app.delete("/api/finances/{finance_id}")
def delete_finance(finance_id: int, db: Session = Depends(get_db)):
    db_finance = db.query(models.FinanceRecord).filter(models.FinanceRecord.id == finance_id).first()
    if not db_finance:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(db_finance)
    db.commit()
    return {"ok": True}

# --- Harvest Records ---

@app.get("/api/harvests", response_model=List[schemas.HarvestRecord])
def read_harvests(db: Session = Depends(get_db)):
    return db.query(models.HarvestRecord).all()

@app.post("/api/harvests", response_model=schemas.HarvestRecord)
def create_harvest(harvest: schemas.HarvestRecordCreate, db: Session = Depends(get_db)):
    db_harvest = models.HarvestRecord(**harvest.dict())
    db.add(db_harvest)
    db.commit()
    db.refresh(db_harvest)
    return db_harvest

@app.delete("/api/harvests/{harvest_id}")
def delete_harvest(harvest_id: int, db: Session = Depends(get_db)):
    db_harvest = db.query(models.HarvestRecord).filter(models.HarvestRecord.id == harvest_id).first()
    if not db_harvest:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(db_harvest)
    db.commit()
    return {"ok": True}

# --- Inventory ---

@app.get("/api/inventory", response_model=List[schemas.Inventory])
def read_inventory(db: Session = Depends(get_db)):
    return db.query(models.Inventory).all()

@app.post("/api/inventory", response_model=schemas.Inventory)
def create_inventory(item: schemas.InventoryCreate, db: Session = Depends(get_db)):
    db_item = models.Inventory(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/inventory/{item_id}")
def delete_inventory(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Inventory).filter(models.Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}

# --- Plantation Blocks ---

@app.get("/api/blocks", response_model=List[schemas.PlantationBlock])
def read_blocks(db: Session = Depends(get_db)):
    return db.query(models.PlantationBlock).all()

@app.post("/api/blocks", response_model=schemas.PlantationBlock)
def create_block(block: schemas.PlantationBlockCreate, db: Session = Depends(get_db)):
    db_block = models.PlantationBlock(**block.dict())
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block

@app.delete("/api/blocks/{block_id}")
def delete_block(block_id: int, db: Session = Depends(get_db)):
    db_block = db.query(models.PlantationBlock).filter(models.PlantationBlock.id == block_id).first()
    if not db_block:
        raise HTTPException(status_code=404, detail="Block not found")
    db.delete(db_block)
    db.commit()
    return {"ok": True}

# --- TBS Prices ---

@app.get("/api/tbs_prices", response_model=List[schemas.TbsPrice])
def read_tbs_prices(db: Session = Depends(get_db)):
    return db.query(models.TbsPrice).order_by(models.TbsPrice.date.asc()).all()

@app.post("/api/tbs_prices", response_model=schemas.TbsPrice)
def create_tbs_price(price: schemas.TbsPriceCreate, db: Session = Depends(get_db)):
    db_price = models.TbsPrice(**price.dict())
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price

@app.delete("/api/tbs_prices/{price_id}")
def delete_tbs_price(price_id: int, db: Session = Depends(get_db)):
    db_price = db.query(models.TbsPrice).filter(models.TbsPrice.id == price_id).first()
    if not db_price:
        raise HTTPException(status_code=404, detail="Price not found")
    db.delete(db_price)
    db.commit()
    return {"ok": True}

# --- News ---

@app.get("/api/news", response_model=List[schemas.News])
def read_news(db: Session = Depends(get_db)):
    return db.query(models.News).order_by(models.News.date.desc()).all()

@app.post("/api/news", response_model=schemas.News)
def create_news(news: schemas.NewsCreate, db: Session = Depends(get_db)):
    db_news = models.News(**news.dict())
    db.add(db_news)
    db.commit()
    db.refresh(db_news)
    return db_news

@app.delete("/api/news/{news_id}")
def delete_news(news_id: int, db: Session = Depends(get_db)):
    db_news = db.query(models.News).filter(models.News.id == news_id).first()
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    db.delete(db_news)
    db.commit()
    return {"ok": True}

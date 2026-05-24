import sqlite3
from pymongo import MongoClient
import os

MONGODB_URL = "mongodb+srv://hanseldragon557_db_user:hanselSIMPERKASA@cluster0.4dsqt74.mongodb.net/?appName=Cluster0"

def migrate():
    # Connect to MongoDB
    client = MongoClient(MONGODB_URL)
    db_mongo = client["simperkasa"]
    
    # Drop existing collections to ensure clean migration if run multiple times
    for coll in ["finances", "harvests", "inventory", "blocks", "tbs_prices", "news", "admins"]:
        db_mongo[coll].drop()

    # Connect to SQLite
    conn = sqlite3.connect('simperkasa.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Define mapping between SQLite tables and MongoDB collections
    tables = {
        "finance_records": "finances",
        "harvest_records": "harvests",
        "inventory": "inventory",
        "plantation_blocks": "blocks",
        "tbs_prices": "tbs_prices",
        "news": "news",
        "admins": "admins"
    }

    total_migrated = 0

    for sqlite_table, mongo_collection in tables.items():
        try:
            cursor.execute(f"SELECT * FROM {sqlite_table}")
            rows = cursor.fetchall()
            if not rows:
                print(f"Skipping {sqlite_table}, no data found.")
                continue
            
            documents = []
            for row in rows:
                doc = dict(row)
                # Keep the original SQLite integer ID as the MongoDB _id
                # This prevents ID changes and simplifies new record insertion
                # by letting us query max(_id) if we want to continue using integers,
                # but for now we'll just store it as a string to match the updated schemas.
                doc["_id"] = str(doc.pop("id"))
                documents.append(doc)
            
            db_mongo[mongo_collection].insert_many(documents)
            print(f"Migrated {len(documents)} records from {sqlite_table} to {mongo_collection}.")
            total_migrated += len(documents)
        except sqlite3.OperationalError as e:
            print(f"Table {sqlite_table} might not exist in SQLite: {e}")

    conn.close()
    client.close()
    print(f"Migration completed successfully. Total records migrated: {total_migrated}")

if __name__ == "__main__":
    migrate()

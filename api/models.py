import sys, os 
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, ForeignKey, Index
from datetime import datetime

class Base(DeclarativeBase):
    pass

class Product(Base):
    __tablename__= "products"
    product_id: Mapped[str] = mapped_column(String(255), primary_key = True)
    category_id: Mapped[str]  = mapped_column(String(50))

class BrowseHistory(Base):
    __tablename__= "browse_history"
    messageid: Mapped[str] = mapped_column(String(255), primary_key=True)
    userid: Mapped[str] = mapped_column(String(255), index=True) 
    productid: Mapped[str] = mapped_column(ForeignKey("products.product_id"))
    event: Mapped[str] = mapped_column(String(50))
    source: Mapped[str] = mapped_column(String(100))
    timestamp: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    is_active: Mapped[int] = mapped_column(default=1)

class GenBestSeller(Base):
    __tablename__= "gen_best_seller"
    rank: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(String(50))
    unique_buyers: Mapped[int] = mapped_column(Integer)

    __table_args__= ( 
        Index("idx_gen_buyers", "unique_buyers"),
    )

class CatBestSeller(Base):
    __tablename__ = "cat_best_seller"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category_id: Mapped[str] = mapped_column(String(50))
    product_id: Mapped[str] = mapped_column(String(50))
    unique_buyers: Mapped[int] = mapped_column(Integer)

    __table_args__ = (
        Index("idx_cat_buyers", "category_id", "unique_buyers"),
    )

class Order(Base):
    __tablename__ = "orders"
    order_id: Mapped[str] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255))
    

class OrderItem(Base):
    __tablename__ = "order_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True) 
    order_id: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[str] = mapped_column(Integer)
    product_id: Mapped[str] = mapped_column(String(255))
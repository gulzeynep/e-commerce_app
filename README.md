# 🚀 Real-Time E-Commerce Recommendation Engine

Bu proje, kullanıcı hareketlerini Kafka üzerinden takip eden, verileri Postgres üzerinde işleyen ve FastAPI ile kişiselleştirilmiş ürün önerileri sunan uçtan uca bir veri boru hattıdır.

## 🛠 Teknolojiler
- **Backend:** Python (FastAPI, SQLAlchemy, SQLModel)
- **Frontend:** React + TypeScript + Tailwind CSS
- **Veri Hattı:** Apache Kafka (Real-time events)
- **Veritabanı & Cache:** PostgreSQL & Redis
- **Orkestrasyon:** Docker & Docker Compose

## 🏗 Proje Yapısı
- `api/`: Öneri motoru ve geçmiş verilerini sunan FastAPI servisleri.
- `etl/`: Sipariş verilerini işleyip "En Çok Satanlar" listesini hazırlayan asenkron süreç.
- `kafka_services/`: Kullanıcı tıklamalarını dinleyen ve DB'ye yazan Consumer.
- `frontend/`: TypeScript ile yazılmış modern dashboard arayüzü.

## 🚀 Kurulum ve Çalıştırma

Projeyi başka bir bilgisayarda çalıştırmak için sadece Docker'ın kurulu olması yeterlidir:

1. Projeyi clonelayın:
   ```bash
   git clone <repo-url>
   cd e-commerce_app
```

2. Docker ile tüm sistemi ayağa kaldırın:
```bash
docker-compose up --build
```

3. Uygulamalara erişin:
Frontend: http://localhost:5173

API Docs: http://localhost:8000/docs

Notlar
Veritabanı tabloları ETL veya API ilk çalıştığında otomatik olarak oluşturulur.

Kafka Cluster ID hataları yaşarsanız docker-compose down -v komutuyla hacimleri temizleyip yeniden başlatın.


---

**Sıradaki Adım:** GitHub hesabında yeni bir repo oluşturup bu dosyaları oraya gönderdikten sonra, yeni bilgisayara geçtiğinde Docker ile tek komutta çalıştırmayı deneyebilirsin. Yeni bilgisayara geçtiğinde tekrar takıldığın bir yer olursa ben buralardayım!


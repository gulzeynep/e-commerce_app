# Real-Time E-Commerce Analytics Platform 

A full-stack, fully containerized real-time data processing and analytics platform. This system is designed to capture, process, and visualize e-commerce events (such as product views) in real-time using a modern microservices architecture.



## Architecture & Tech Stack

This project is built with scalability and performance in mind, separating concerns across distinct, isolated services:

* **Frontend:** React, Vite, Tailwind CSS, TypeScript
* **Backend API:** FastAPI (Python), Uvicorn
* **Message Broker:** Apache Kafka (KRaft mode - Zookeeperless)
* **Database & Caching:** PostgreSQL, Redis
* **Background Workers:** 
   * **Kafka Consumer:** Reads real-time streams from Kafka topics and writes to the database.
    * **ETL Worker:** Periodically cleans, transforms, and aggregates data.
    * **Kafka Producer:** Seeds initial data and simulates incoming traffic.
* **Infrastructure:** Docker & Docker Compose

##  Getting Started

Follow these steps to get the entire ecosystem running on your local machine.

### Prerequisites
* [Docker](https://www.docker.com/) and Docker Compose installed on your machine.
* Git installed.

### 1. Clone the Repository
```bash
git clone [https://github.com/gulzeynep/e-commerce_app](https://github.com/gulzeynep/e-commerce_app)
cd e-commerce_app
```
### 2. Environment Variables
This project requires environment variables to securely connect services. We have provided a template for you.
Copy the .env.example file and rename it to .env:
```bash
cp .env.example .env
```

### 3. Build and Run the Ecosystem
Start all services in the background using Docker Compose:
```bash
docker-compose up --build -d
```
Docker will pull the necessary images, build the Python and Node.js environments, and start the services in the correct dependency order (Database/Kafka first, then Workers/API, then Frontend).

### 4. Verify Services & Access Points
Once the containers are up and healthy, you can access the applications via your browser:
* Frontend Dashboard: http://localhost:5173
* FastAPI Swagger UI (Docs): http://localhost:8000/docs

### Project Structure
```bash
e-commerce_app/
├── api/                  # FastAPI backend
├── etl/                  # Extract, Transform, Load worker
├── frontend/             # React/Vite web application
├── kafka_services/       # Kafka Producer and Consumer scripts
├── docker-compose.yml    # Orchestration of all services
├── Dockerfile.python     # Shared Dockerfile for Python services
├── config.py             # Environment configuration manager
└── README.md
```

### Useful Docker Commands
* Stop the application: docker-compose down
* Stop and wipe all data (Reset Database & Kafka): docker-compose down -v
* Check logs of a specific service: docker logs <container_name> (e.g., docker logs fastapi-backend)

*** 
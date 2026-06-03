# 3DEXPERIENCE Observability & Log Monitoring Platform

## Overview
This project is an end-to-end log management and observability system designed specifically for the 3DEXPERIENCE platform. It provides real-time log ingestion, processing, and visualization for complex enterprise architectures, ensuring system health and rapid troubleshooting. 

The pipeline handles raw logs from Apache and TomEE, streams them reliably through a Kafka broker, processes them via Logstash, and exposes the data through a secure custom Python backend to a React frontend, alongside a dedicated Prometheus and Grafana monitoring stack.

## System Architecture

The system is divided into three distinct operational zones:

### 1. Data Acquisition Zone
*   **Admin Platform:** Hosts the 3DEXPERIENCE components (Apache, 3DSpace, 3DSearch, 3DPassport, 3DFCS).
*   **Log Shipper (Filebeat):** Harvests raw logs directly from the Apache and TomEE folders and ships the event stream as JSON.

### 2. Broker & Processing Zone
*   **Message Broker (Kafka):** Receives the event stream into dedicated topics (`apache-logs`, `tomee-logs`), decoupling ingestion from processing and ensuring no data loss during high loads.
*   **Data Processing (Logstash):** Consumes the log queue from Kafka, applies Grok and Mutate filters to structure the JSON data, and prepares it for indexing.

### 3. Observability Stack
*   **Data Store (Elasticsearch):** Receives bulk-indexed JSON from Logstash and serves as the core search and analytics engine (`es.observability.com:9200`).
*   **Backend API (Python/FastAPI):** A secure service (`main.py`) utilizing JWT authentication. It queries logs and traces from Elasticsearch and exposes REST/JSON endpoints (`/trace`, `/logs`, `/metrics`) over HTTPS.
*   **Frontend UI (React):** A custom web interface (`LiveLogs.jsx`, `Dashboard.jsx`) that visualizes the data provided by the backend API.
*   **Local Docker Stack:** Runs Prometheus (9090) and Grafana (3000) for advanced metrics scraping, aggregation, and dashboarding, utilizing Elasticsearch DSL queries.

## Tech Stack

*   **Frontend:** React 
*   **Backend & API:** Python (FastAPI)
*   **Data Pipeline & Broker:** Kafka, Logstash, Filebeat
*   **Search & Analytics:** Elasticsearch
*   **Metrics & Dashboards:** Prometheus, Grafana
*   **Infrastructure:** Docker

## Installation & Setup

*(Provide instructions here on how to spin up the local Docker stack, set up the Kafka topics, and run the Python and React servers.)*

```bash
# Example setup commands
git clone [https://github.com/your-username/3dx-observability-pipeline.git](https://github.com/your-username/3dx-observability-pipeline.git)
cd 3dx-observability-pipeline

# Start the observability infrastructure (ES, Prometheus, Grafana, Kafka)
docker-compose up -d

# Start the Python Backend
cd backend
pip install -r requirements.txt
python main.py

# Start the React Frontend
cd frontend
npm install
npm start

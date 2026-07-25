# AI-Based Student Academic Risk Prediction and Performance Monitoring System

An intelligent web-based platform that predicts students' academic risk using Machine Learning, provides explainable predictions through SHAP, and assists teachers in monitoring student performance through recommendations, notifications, and intervention management.

---

# Overview

The **AI-Based Student Academic Risk Prediction and Performance Monitoring System** is designed to identify students who are at risk of poor academic performance before they fail.

The system combines:

- Machine Learning
- Explainable AI (SHAP)
- Academic Analytics
- Teacher Intervention
- Student Performance Monitoring

to support timely academic decisions.

---

# Key Features

## Authentication

- JWT Authentication
- Secure Password Hashing (bcrypt)
- Role-based Access Control
  - Admin
  - Teacher
  - Student

---

## Student Management

- Student Registration
- Student Profile
- Department Management
- Semester Management

---

## Academic Records

- Attendance
- Internal Marks
- Assignment Scores
- Quiz Scores
- Previous GPA

---

## AI Risk Prediction

- Random Forest Classifier
- Academic Risk Prediction
- Prediction Probability
- Automatic Risk Classification

Risk Levels

- Low Risk
- Medium Risk
- High Risk

---

## Explainable AI

Using SHAP (SHapley Additive exPlanations)

Provides:

- Feature Importance
- Prediction Explanation
- Student-specific explanations

---

## Recommendations

Automatically generated recommendations based on prediction.

Examples:

- Increase attendance
- Improve assignment completion
- Schedule counselling
- Meet course instructor

---

## Notification System

Automatic notifications for:

- Students
- Teachers
- Parents (Email)

---

## Teacher Intervention

Teachers can

- View student profile
- Review predictions
- Add intervention notes
- Track intervention history

---

## Reports & Analytics

- Dashboard Summary
- Department Reports
- Semester Reports
- High Risk Students
- Medium Risk Students
- Low Risk Students
- Latest Predictions
- Intervention Summary

---

# System Architecture

```
Frontend (React + TypeScript)
            │
            │ REST API
            ▼
Backend (FastAPI)
            │
            ├──────── PostgreSQL (Supabase)
            │
            └──────── Machine Learning Module
                        │
                        ├── Random Forest
                        ├── SHAP
                        └── Recommendation Engine
```

---

# Technology Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- Axios
- React Router

---

## Backend

- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- bcrypt

---

## Database

- PostgreSQL
- Supabase

---

## Machine Learning

- Scikit-Learn
- Random Forest
- SHAP
- Pandas
- NumPy

---

## Development Tools

- Git
- GitHub
- VS Code
- Postman

---

# Project Structure

```
student-risk-prediction-system/

├── backend/
│   ├── app/
│   ├── migrations/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── ml/
│   ├── data/
│   ├── models/
│   ├── reports/
│   └── src/
│
└── README.md
```

---

# Installation

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate
# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Machine Learning

```bash
cd ml

pip install -r requirements.txt
```

---

# Authentication

The system supports

- Admin
- Teacher
- Student

using JWT Authentication.

---

# API Documentation

After running FastAPI

Swagger UI

```
http://localhost:8000/docs
```

ReDoc

```
http://localhost:8000/redoc
```

---

# Machine Learning Workflow

```
Student Academic Records

        ↓

Feature Engineering

        ↓

Random Forest Model

        ↓

Risk Prediction

        ↓

SHAP Explanation

        ↓

Recommendation Engine

        ↓

Notification System
```

---

# Team Members

| Member | Responsibility |
|---------|----------------|
| **Bipin Lamsal** | Backend Development, API Design, Database Integration |
| **Kishor Chandra Bhatt** | Machine Learning, Model Training, SHAP Explainability |
| **Aadarsha Subedi** | Frontend Development |
| **Sneha Lamichhane** | Documentation, Testing, UI Support |

---

# Current Project Status

- ✅ Backend APIs Completed
- ✅ Database Integration Completed
- ✅ Authentication Completed
- ✅ Dashboard APIs Completed
- ✅ Reports Module Completed
- ✅ Recommendation System Completed
- ✅ Notification System Completed
- ✅ Intervention Module Completed
- 🔄 Machine Learning Integration (Final Model Pending)
- 🔄 Frontend Integration In Progress

---

# Future Enhancements

- Real-time Prediction Updates
- SMS Notifications
- Advanced Analytics Dashboard
- Deep Learning Models
- Mobile Application
- LMS Integration

---

# License

This project was developed as a **Minor Project** for academic purposes.

---

# Acknowledgements

Special thanks to all project team members for their contributions in backend development, frontend development, machine learning, documentation, and testing.
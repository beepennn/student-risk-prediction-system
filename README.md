# StudentAlert: AI-Based Early Warning System for Identifying At-Risk Students

StudentAlert is a web-based academic monitoring and early-warning system that uses Machine Learning to classify students according to academic risk and Explainable Artificial Intelligence (XAI) to provide interpretable prediction results.

The system is designed to help educational institutions identify students who may require academic attention and support teachers and administrators through academic monitoring, recommendations, notifications, reporting, analytics, and intervention management.

---

## Overview

StudentAlert combines academic data management, machine learning prediction, explainability, and academic-support functionality within a single role-based platform.

The system uses a **Random Forest classifier** to classify students into:

- Low Risk
- Medium Risk
- High Risk

The prediction process is supplemented by **SHAP (SHapley Additive exPlanations)** to show the contribution of individual academic features to a prediction.

The platform provides dedicated interfaces for:

- Administrator
- Teacher
- Student

---

## Key Features

### Authentication and Authorization

- JWT-based authentication
- Password hashing
- Role-based access control
- Administrator, Teacher, and Student roles

### Student and User Management

- Student profile management
- Teacher management
- Department and semester information
- Role-based account access

### Academic Record Management

The system manages academic indicators including:

- Attendance
- Internal Marks
- Assignment Score
- Quiz Score
- Previous GPA
- Semester
- Gender

### AI-Based Risk Prediction

The machine learning component uses a **Random Forest classification model** to generate:

- Academic risk classification
- Risk probabilities
- Confidence information
- Low Risk, Medium Risk, and High Risk classification

### Explainable AI

SHAP is integrated with the Random Forest prediction pipeline to provide:

- Feature-level contributions
- Individual prediction explanations
- Prediction-specific risk-factor information

### Recommendations

The system connects prediction results with academic recommendations.

Examples include:

- Improving attendance
- Improving assignment performance
- Seeking academic guidance
- Consulting the course instructor

### Notifications

The system provides notification functionality for relevant academic and system events.

### Teacher Intervention

Teachers can:

- Search and filter students
- View student profiles
- Review academic records
- Review prediction results
- Inspect SHAP explanations
- Review recommendations
- Record intervention actions and remarks
- Track intervention history

### Reports and Analytics

The platform provides:

- Dashboard summaries
- Academic-risk analytics
- Risk-level monitoring
- Student prediction information
- Intervention information
- Academic reports
- CSV-based data export where applicable

---

# System Architecture

```text
                    USERS
      ┌──────────────┼──────────────┐
      │              │              │
  Administrator    Teacher       Student
      │              │              │
      └──────────────┼──────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │ Frontend                │
        │ React + TypeScript      │
        └────────────┬────────────┘
                     │ REST API
                     ▼
        ┌─────────────────────────┐
        │ Backend                 │
        │ FastAPI + Python        │
        └──────┬──────────┬───────┘
               │          │
               │          ▼
               │   ┌─────────────────┐
               │   │ Machine Learning│
               │   │ Random Forest   │
               │   │ + SHAP          │
               │   └─────────────────┘
               │
               ▼
        ┌─────────────────────────┐
        │ PostgreSQL / Supabase   │
        └─────────────────────────┘
````

---

# Machine Learning Workflow

```text
Student Academic Data
        │
        ▼
Data Preparation
        │
        ▼
Feature Preprocessing
        │
        ▼
Random Forest Classifier
        │
        ▼
Risk Probabilities
        │
        ▼
Risk Classification
        │
        ▼
SHAP Explanation
        │
        ├──────────────► Recommendation
        │
        ├──────────────► Notification
        │
        └──────────────► Teacher Intervention
```

---

# Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* Axios
* React Router
* TanStack React Query
* React Hook Form
* Zod
* Recharts

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* bcrypt

## Database

* PostgreSQL
* Supabase

## Machine Learning and Data Processing

* Python
* Scikit-learn
* Random Forest
* SHAP
* Pandas
* NumPy
* Joblib

## Development Tools

* Git
* GitHub
* Visual Studio Code
* Postman
* Google Chrome / Microsoft Edge

---

# Project Structure

```text
student-risk-prediction-system/
│
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

From the project root:

```bash
cd backend

python -m venv venv
```

### Windows

```powershell
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

---

## Frontend

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

---

## Machine Learning Environment

From the project root:

```bash
cd ml
```

Install the required machine-learning dependencies:

```bash
pip install -r requirements.txt
```

The trained model, evaluation outputs, feature-importance results, fairness results, and SHAP analysis are maintained under the `ml/` directory.

---

# API Documentation

When the FastAPI backend is running:

### Swagger UI

```text
http://localhost:8000/docs
```

### ReDoc

```text
http://localhost:8000/redoc
```

---

# Risk Classification

StudentAlert uses three academic-risk categories:

| Risk Level      | Description                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Low Risk**    | Academic indicators correspond to satisfactory performance.                                    |
| **Medium Risk** | Academic indicators indicate moderate academic concern and monitoring may be required.         |
| **High Risk**   | Academic indicators indicate substantial academic concern and may require timely intervention. |

---

# Model Evaluation

The selected Random Forest model was evaluated using:

* Accuracy
* Balanced Accuracy
* Macro Precision
* Macro Recall
* Macro F1-score
* Confusion Matrix
* Learning Curve
* Training vs. Testing Performance
* Feature Importance
* SHAP Explainability
* Gender Fairness Evaluation
* Gender Sensitivity Testing

The final evaluated model achieved:

```text
Accuracy:           93.38%
Balanced Accuracy:  93.46%
Macro Precision:    92.39%
Macro Recall:       93.46%
Macro F1-Score:     92.91%
```

These values correspond to the independent test dataset used during model evaluation.

---

# Project Status

The major project components have been implemented and integrated, including:

* Backend APIs
* Database integration
* Authentication and authorization
* Student and teacher management
* Academic-record management
* Dashboard functionality
* Machine learning prediction
* SHAP explainability
* Recommendation functionality
* Notification functionality
* Teacher intervention functionality
* Reports and analytics
* Frontend role-based interfaces
* Model evaluation and fairness analysis
* System integration and testing

---

# Limitations

The machine learning model was developed using a publicly available student-performance dataset because the expected departmental dataset was unavailable during the project period.

The dataset was supplemented with balanced synthetic records to support the required three-class classification. Therefore, the model may not fully represent the academic characteristics of a specific institution.

Further validation using real institutional academic records would be required for institution-specific deployment.

---

# Future Enhancement

Future work may focus on:

* Retraining the model using larger institution-specific datasets
* Improving risk-target generation using validated academic outcomes
* Extending model comparison, calibration, and explainability analysis
* Evaluating intervention outcomes and improving personalized recommendations

---

# License

This project was developed as a **Minor Project** for academic purposes.

---

# Acknowledgements

The project team would like to express sincere gratitude to the project supervisor, project coordinator, department leadership, and everyone who provided guidance, feedback, and support throughout the development and documentation of StudentAlert.
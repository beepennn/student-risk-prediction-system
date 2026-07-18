# Authentication Architecture

## Overview

The system uses JWT-based authentication
to identify and authorize users securely.

Supported Roles:

- Admin
- Teacher
- Student

---

## Authentication Workflow

User Login
↓
FastAPI Login Endpoint
↓
Verify Password using bcrypt
↓
Fetch User from PostgreSQL
↓
Generate JWT Access Token
↓
Return JWT Token
↓
Access Protected Routes

---

## Security Components

- FastAPI
- JWT Authentication
- bcrypt Password Hashing
- SQLAlchemy ORM
- PostgreSQL Database

---

## Security Goals

- Secure password storage
- Protected API endpoints
- Role-based authorization
- Secure secret management
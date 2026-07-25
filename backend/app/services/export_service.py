import csv
from io import StringIO

from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.prediction import Prediction
from app.models.intervention import Intervention
from app.models.notification import Notification


def _csv_response(filename: str, output: StringIO):
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        },
    )


def export_students_csv(db: Session):

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Name",
        "Roll Number",
        "Department",
        "Semester",
        "Status",
    ])

    students = db.query(Student).all()

    for student in students:
        writer.writerow([
            student.id,
            student.user.full_name if student.user else "",
            student.roll_number,
            student.department,
            student.semester,
            student.status,
        ])

    return _csv_response(
        "students.csv",
        output,
    )


def export_predictions_csv(db: Session):

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Prediction ID",
        "Student ID",
        "Risk Level",
        "Low Probability",
        "Medium Probability",
        "High Probability",
        "Prediction Date",
    ])

    predictions = db.query(Prediction).all()

    for prediction in predictions:
        writer.writerow([
            prediction.id,
            prediction.student_id,
            prediction.risk_level,
            prediction.low_probability,
            prediction.medium_probability,
            prediction.high_probability,
            prediction.prediction_date,
        ])

    return _csv_response(
        "predictions.csv",
        output,
    )


def export_interventions_csv(db: Session):

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Intervention ID",
        "Student ID",
        "Teacher ID",
        "Action",
        "Remarks",
        "Date",
    ])

    interventions = db.query(Intervention).all()

    for intervention in interventions:
        writer.writerow([
            intervention.id,
            intervention.student_id,
            intervention.teacher_id,
            intervention.action_taken,
            intervention.remarks,
            intervention.intervention_date,
        ])

    return _csv_response(
        "interventions.csv",
        output,
    )


def export_notifications_csv(db: Session):

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Notification ID",
        "Student ID",
        "Title",
        "Type",
        "Sent",
        "Read",
        "Created",
    ])

    notifications = db.query(Notification).all()

    for notification in notifications:
        writer.writerow([
            notification.id,
            notification.student_id,
            notification.title,
            notification.notification_type,
            notification.is_sent,
            notification.is_read,
            notification.created_at,
        ])

    return _csv_response(
        "notifications.csv",
        output,
    )
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.prediction import Prediction
from app.models.student import Student
from app.models.academic_record import AcademicRecord

from app.schemas.prediction import PredictionCreate
from app.schemas.prediction import PredictionResponse

from app.services.audit_service import create_audit_log
from app.core.api_response import success_response

from app.services.ml_service import predict_student_risk
from app.services.academic_service import get_latest_academic_record
from app.services.recommendation_service import generate_recommendation
from app.services.notification_service import generate_notification
from app.services.shap_service import save_shap_explanations


def get_predictions(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    risk_level: str | None = None,
    sort_order: str = "desc",
):
    query = db.query(Prediction)

    if risk_level:
        query = query.filter(
            Prediction.risk_level == risk_level
        )

    if sort_order.lower() == "asc":
        query = query.order_by(
            Prediction.prediction_date.asc()
        )
    else:
        query = query.order_by(
            Prediction.prediction_date.desc()
        )

    return (
        query.offset(skip)
        .limit(limit)
        .all()
    )


def get_prediction(
    db: Session,
    prediction_id: int,
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if prediction is None:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found.",
        )

    return prediction


def create_prediction(
    db: Session,
    prediction: PredictionCreate,
):
    db_prediction = Prediction(
        **prediction.model_dump()
    )

    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    return db_prediction


def save_prediction(
    db: Session,
    student_id: int,
    prediction_data: dict,
):
    prediction = Prediction(
        student_id=student_id,
        risk_level=prediction_data["risk_level"],
        low_probability=prediction_data["low_probability"],
        medium_probability=prediction_data["medium_probability"],
        high_probability=prediction_data["high_probability"],
        confidence=prediction_data["confidence"],
        confidence_percentage=prediction_data["confidence_percentage"],
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction


def get_latest_prediction(
    db: Session,
    student_id: int,
):
    return (
        db.query(Prediction)
        .filter(Prediction.student_id == student_id)
        .order_by(Prediction.prediction_date.desc())
        .first()
    )


def get_student_predictions(
    db: Session,
    student_id: int,
):
    return (
        db.query(Prediction)
        .filter(
            Prediction.student_id == student_id
        )
        .order_by(
            Prediction.id.desc()
        )
        .all()
    )


def get_admin_predictions(
    db: Session,
    risk_level: str | None = None,
    semester: int | None = None,
    department: str | None = None,
    skip: int = 0,
    limit: int = 20,
    sort_order: str = "desc",
):
    query = (
        db.query(Prediction)
        .join(
            Student,
            Prediction.student_id == Student.id,
        )
    )

    if risk_level:
        query = query.filter(
            Prediction.risk_level == risk_level
        )

    if semester is not None:
        query = query.filter(
            Student.semester == semester
        )

    if department:
        query = query.filter(
            Student.department.ilike(
                f"%{department}%"
            )
        )

    if sort_order.lower() == "asc":
        query = query.order_by(
            Prediction.prediction_date.asc()
        )
    else:
        query = query.order_by(
            Prediction.prediction_date.desc()
        )

    return (
        query.offset(skip)
        .limit(limit)
        .all()
    )


def delete_prediction(
    db: Session,
    prediction_id: int,
    admin_id: int,
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if prediction is None:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found.",
        )

    db.delete(prediction)
    db.commit()

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="DELETE",
        entity="Prediction",
        entity_id=prediction_id,
    )

    return success_response(
        message="Prediction deleted successfully."
    )

def is_prediction_required(
    latest_prediction,
    latest_record,
):
    """
    Returns True if a new prediction should be generated.

    For now we simply compare timestamps.

    If the academic record was updated after the latest prediction,
    generate a new prediction.
    """

    if latest_prediction is None:
        return True

    if latest_record.created_at > latest_prediction.prediction_date:
        return True

    return False

def generate_prediction_for_student(
    db: Session,
    student_id: int,
):
    academic = get_latest_academic_record(
        db,
        student_id,
    )

    print("Academic:", academic)

    student_features = {
        "attendance": academic.attendance,
        "internal_marks": academic.internal_marks,
        "assignment_score": academic.assignment_score,
        "quiz_score": academic.quiz_score,
        "previous_gpa": academic.previous_gpa,
        "semester": academic.semester,
        "gender": academic.gender,
    }

    print("Student Features:", student_features)

    prediction = predict_student_risk(
        student_features
    )

    print("Prediction:", prediction)

    latest_prediction = get_latest_prediction(
        db,
        student_id,
    )

    if latest_prediction:
        if (
            latest_prediction.risk_level == prediction["risk_level"]
            and latest_prediction.low_probability == prediction["low_probability"]
            and latest_prediction.medium_probability == prediction["medium_probability"]
            and latest_prediction.high_probability == prediction["high_probability"]
        ):
            print("No academic changes detected.")
            print("Returning existing prediction.")

            return PredictionResponse.model_validate(
                latest_prediction
            )

    saved_prediction = save_prediction(
        db,
        student_id,
        prediction,
    )

    save_shap_explanations(
        db=db,
        prediction_id=saved_prediction.id,
        shap_values=prediction.get("shap_values", {}),
    )

    print("Saved Prediction:", saved_prediction)

    recommendation = generate_recommendation(
        db,
        saved_prediction,
    )

    print("Recommendation:", recommendation)

    notification = generate_notification(
        db,
        student_id,
        recommendation,
    )

    print("Notification:", notification)

    return PredictionResponse.model_validate(
        saved_prediction
    )
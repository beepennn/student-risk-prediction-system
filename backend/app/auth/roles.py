from fastapi import Depends, HTTPException, status

from app.auth.dependencies import get_current_user


class Roles:
    ADMIN = "Admin"
    TEACHER = "Teacher"
    STUDENT = "Student"


def require_admin(current_user=Depends(get_current_user)):
    if current_user.role != Roles.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def require_teacher(current_user=Depends(get_current_user)):
    if current_user.role != Roles.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher access required",
        )
    return current_user


def require_student(current_user=Depends(get_current_user)):
    if current_user.role != Roles.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required",
        )
    return current_user
import re

from pydantic import (
    BaseModel,
    field_validator,
    model_validator,
)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(
        cls,
        value: str,
    ) -> str:
        normalized_email = (
            value.strip().lower()
        )

        email_pattern = (
            r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
        )

        if not re.match(
            email_pattern,
            normalized_email,
        ):
            raise ValueError(
                "Enter a valid email address."
            )

        return normalized_email


class PasswordResetTokenRequest(
    BaseModel
):
    token: str

    @field_validator("token")
    @classmethod
    def validate_token(
        cls,
        value: str,
    ) -> str:
        cleaned_token = value.strip()

        if not cleaned_token:
            raise ValueError(
                "Password reset token is required."
            )

        return cleaned_token


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

    @field_validator("token")
    @classmethod
    def validate_token(
        cls,
        value: str,
    ) -> str:
        cleaned_token = value.strip()

        if not cleaned_token:
            raise ValueError(
                "Password reset token is required."
            )

        return cleaned_token

    @field_validator("new_password")
    @classmethod
    def validate_new_password(
        cls,
        value: str,
    ) -> str:
        if len(value) < 8:
            raise ValueError(
                "Password must contain at least "
                "8 characters."
            )

        if not any(
            character.islower()
            for character in value
        ):
            raise ValueError(
                "Password must contain at least "
                "one lowercase letter."
            )

        if not any(
            character.isupper()
            for character in value
        ):
            raise ValueError(
                "Password must contain at least "
                "one uppercase letter."
            )

        if not any(
            character.isdigit()
            for character in value
        ):
            raise ValueError(
                "Password must contain at least "
                "one number."
            )

        return value

    @model_validator(mode="after")
    def validate_password_confirmation(
        self,
    ):
        if (
            self.new_password
            != self.confirm_password
        ):
            raise ValueError(
                "Password confirmation does "
                "not match."
            )

        return self


class GenericMessageResponse(BaseModel):
    message: str
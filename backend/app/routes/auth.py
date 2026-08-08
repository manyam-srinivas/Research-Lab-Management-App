import secrets
from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from app.extensions import db, bcrypt
from app.models.user import User
from app.services.mail_service import send_verification_email

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    requested_role = data.get("requested_role")

    if not all([full_name, email, password, requested_role]):
        return {
            "status": "error",
            "message": "All fields are required"
        }, 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return {
            "status": "error",
            "message": "Email already exists"
        }, 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    # Generate a verification token so the user can confirm their email.
    verification_token = secrets.token_urlsafe(32)

    new_user = User(
    full_name=full_name,
    email=email,
    password_hash=hashed_password,
    requested_role=requested_role,
    role=None,
    status="Pending",
    email_verification_token=verification_token
)

    db.session.add(new_user)
    db.session.commit()

    # Attempt to email the verification link; in demo mode (no SMTP
    # configured) the link is returned so the frontend can show it.
    mail_result = send_verification_email(
        new_user,
        verification_token
    )

    return {
        "status": "success",
        "message": "Registration submitted successfully. Please wait for administrator approval.",
        "verification_link": mail_result.get("link"),
        "email_sent": mail_result.get("sent", False)
    }, 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {
            "status": "error",
            "message": "Email and password required"
        }, 400

    user = User.query.filter_by(email=email).first()

    if user is None:
        return {
            "status": "error",
            "message": "Invalid credentials"
        }, 401

    # Deleted accounts are blocked even when their stored password hash
    # is malformed, so the check runs before bcrypt.
    if user.is_deleted:
        return {
            "status": "error",
            "message": "Your account has been deleted."
        }, 403

    try:
        valid_password = bcrypt.check_password_hash(
            user.password_hash,
            password
        )
    except ValueError:
        valid_password = False

    if not valid_password:
        return {
            "status": "error",
            "message": "Invalid credentials"
        }, 401
    
    if user.status == "Pending":
     return {
        "status": "error",
        "message": "Your account is awaiting administrator approval."
    }, 403

    if user.status == "Rejected":
     return {
        "status": "error",
        "message": "Your registration request has been rejected."
    }, 403

    if user.status == "Inactive":
     return {
        "status": "error",
        "message": "Your account has been deactivated."
    }, 403

    token = create_access_token(identity=str(user.id))

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }, 200

@auth_bp.route("/verify-email/<token>", methods=["GET"])
def verify_email(token):

    user = User.query.filter_by(
        email_verification_token=token
    ).first()

    if not user:
        return {
            "status": "error",
            "message": "Invalid or expired verification link"
        }, 400

    if user.email_verified:
        return {
            "status": "success",
            "message": "Email already verified"
        }, 200

    user.email_verified = True
    user.email_verified_at = datetime.utcnow()
    user.email_verification_token = None

    db.session.commit()

    return {
        "status": "success",
        "message": "Email verified successfully"
    }, 200


@auth_bp.route("/resend-verification", methods=["POST"])
@jwt_required()
def resend_verification():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if user.email_verified:
        return {
            "status": "error",
            "message": "Email already verified"
        }, 400

    user.email_verification_token = secrets.token_urlsafe(32)
    db.session.commit()

    mail_result = send_verification_email(
        user,
        user.email_verification_token
    )

    return {
        "status": "success",
        "message": "Verification email sent.",
        "verification_link": mail_result.get("link"),
        "email_sent": mail_result.get("sent", False)
    }, 200


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    from app.models.departments import Department

    department = None
    if user.department_id:
        department = Department.query.get(user.department_id)

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "department_id": user.department_id,
            "department_name": (
                department.name if department else None
            ),
            "designation": user.designation,
            "research_interests": user.research_interests,
            "phone": user.phone,
            "student_employee_id": user.student_employee_id,
            "profile_image": user.profile_image,
            "email_verified": user.email_verified,
            "created_at": str(user.created_at)
            if user.created_at else None
        }
    }, 200


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    data = request.get_json() or {}

    # Guard against values longer than the column limits so MySQL
    # strict mode cannot turn a profile save into a 500 error.
    if data.get("full_name"):
        user.full_name = str(data["full_name"])[:100]

    if "phone" in data:
        user.phone = str(data["phone"] or "")[:20]

    if "designation" in data:
        user.designation = str(data["designation"] or "")[:100]

    if "research_interests" in data:
        user.research_interests = data["research_interests"] or None

    if "student_employee_id" in data:
        user.student_employee_id = (
            str(data["student_employee_id"] or "")[:50]
        )

    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return {
            "status": "error",
            "message": f"Failed to save profile: {exc}"
        }, 400

    return {
        "status": "success",
        "message": "Profile updated successfully"
    }, 200


@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    data = request.get_json() or {}

    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return {
            "status": "error",
            "message": "Current and new password are required"
        }, 400

    if len(new_password) < 6:
        return {
            "status": "error",
            "message": "New password must be at least 6 characters"
        }, 400

    if not bcrypt.check_password_hash(
        user.password_hash,
        old_password
    ):
        return {
            "status": "error",
            "message": "Current password is incorrect"
        }, 400

    user.password_hash = bcrypt.generate_password_hash(
        new_password
    ).decode("utf-8")

    db.session.commit()

    return {
        "status": "success",
        "message": "Password changed successfully"
    }, 200
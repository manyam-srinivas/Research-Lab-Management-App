from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from app.extensions import db, bcrypt
from app.models.user import User

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

    new_user = User(
    full_name=full_name,
    email=email,
    password_hash=hashed_password,
    requested_role=requested_role,
    role=None,
    status="Pending"
)

    db.session.add(new_user)
    db.session.commit()

    return {
        "status": "success",
        "message": "Registration submitted successfully. Please wait for administrator approval."
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

    if not bcrypt.check_password_hash(user.password_hash, password):
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

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }, 200
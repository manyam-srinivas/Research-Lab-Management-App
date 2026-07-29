from flask import Blueprint, request
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
from app.services.activity_log_service import ActivityLogService
from app.services.user_service import UserService
from app.utils.auth import admin_required

user_bp = Blueprint("users", __name__)


@user_bp.route("/", methods=["GET"])
@jwt_required()
def get_users():

    users = UserService.get_all_users()

    return {
        "status": "success",
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "department_id": user.department_id,
                "status": user.status
            }
            for user in users
        ]
    }, 200
@user_bp.route("/pending", methods=["GET"])
@jwt_required()
def get_pending_users():

    users = UserService.get_pending_users()

    return {
        "status": "success",
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "requested_role": user.requested_role,
                "status": user.status,
                "created_at": user.created_at
            }
            for user in users
        ]
    }, 200
@user_bp.route("/approve/<int:user_id>", methods=["PUT"])
@jwt_required()
@admin_required
def approve_user(user_id):

    current_user_id = int(get_jwt_identity())

    user = UserService.get_user(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if user.status != "Pending":
        return {
            "status": "error",
            "message": "User is not awaiting approval"
        }, 400

    data = request.get_json()

    role = data.get("role")

    if not role:
        return {
            "status": "error",
            "message": "Role is required"
        }, 400

    user = UserService.approve_user(
        user,
        role,
        current_user_id
    )

    ActivityLogService.log_activity(
        user_id=current_user_id,
        action="Approved User",
        entity_type="User",
        entity_id=user.id,
        ip_address=request.remote_addr
    )

    return {
        "status": "success",
        "message": "User approved successfully"
    }, 200
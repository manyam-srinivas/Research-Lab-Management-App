from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.services.user_service import UserService


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
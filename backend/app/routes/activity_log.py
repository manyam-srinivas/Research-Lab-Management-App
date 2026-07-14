from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.services.activity_log_service import ActivityLogService


activity_log_bp = Blueprint(
    "activity_logs",
    __name__
)


def log_to_dict(log):

    return {
        "id": log.id,
        "user_id": log.user_id,
        "action": log.action,
        "entity_type": log.entity_type,
        "entity_id": log.entity_id,
        "ip_address": log.ip_address,
        "created_at": str(log.created_at)
        if log.created_at else None
    }


@activity_log_bp.route("/", methods=["POST"])
@jwt_required()
def create_log():

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can create activity logs."
        }, 403

    data = request.get_json()

    data["ip_address"] = request.remote_addr
    data["user_id"] = current_user_id

    log = ActivityLogService.create_log(data)

    return {
        "status": "success",
        "log_id": log.id
    }, 201


@activity_log_bp.route("/", methods=["GET"])
@jwt_required()
def get_logs():

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can view activity logs."
        }, 403

    logs = ActivityLogService.get_all_logs()

    return {
        "status": "success",
        "count": len(logs),
        "logs": [
            log_to_dict(log)
            for log in logs
        ]
    }, 200


@activity_log_bp.route("/<int:log_id>", methods=["GET"])
@jwt_required()
def get_log(log_id):

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can view activity logs."
        }, 403

    log = ActivityLogService.get_log(log_id)

    if not log:
        return {
            "status": "error",
            "message": "Activity log not found"
        }, 404

    return {
        "status": "success",
        "log": log_to_dict(log)
    }, 200


@activity_log_bp.route("/<int:log_id>", methods=["DELETE"])
@jwt_required()
def delete_log(log_id):

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can delete activity logs."
        }, 403

    log = ActivityLogService.get_log(log_id)

    if not log:
        return {
            "status": "error",
            "message": "Activity log not found"
        }, 404

    ActivityLogService.delete_log(log)

    return {
        "status": "success",
        "message": "Activity log deleted successfully"
    }, 200
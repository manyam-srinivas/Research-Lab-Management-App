from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.services.research_group_service import ResearchGroupService
from app.services.activity_log_service import ActivityLogService

research_group_bp = Blueprint(
    "research_groups",
    __name__
)


@research_group_bp.route("/", methods=["POST"])
@jwt_required()
def create_group():

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if user.role not in ["Admin", "Faculty"]:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    data = request.get_json()

    if not data.get("name") or not data.get("department_id"):
        return {
            "status": "error",
            "message": "Name and department_id are required"
        }, 400

    group = ResearchGroupService.create_group(
        data,
        current_user_id
    )
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Created",
    entity_type="Research Group",
    entity_id=group.id,
    ip_address=request.remote_addr
    )
    return {
        "status": "success",
        "message": "Research group created successfully",
        "group_id": group.id
    }, 201


@research_group_bp.route("/", methods=["GET"])
@jwt_required()
def get_groups():

    groups = ResearchGroupService.get_all_groups()

    return {
        "status": "success",
        "count": len(groups),
        "groups": [
            {
                "id": group.id,
                "name": group.name,
                "description": group.description,
                "department_id": group.department_id,
                "created_by": group.created_by
            }
            for group in groups
        ]
    }, 200


@research_group_bp.route("/<int:group_id>", methods=["GET"])
@jwt_required()
def get_group(group_id):

    group = ResearchGroupService.get_group(group_id)

    if not group:
        return {
            "status": "error",
            "message": "Research group not found"
        }, 404

    return {
        "status": "success",
        "group": {
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "department_id": group.department_id,
            "created_by": group.created_by
        }
    }, 200


@research_group_bp.route("/<int:group_id>", methods=["PUT"])
@jwt_required()
def update_group(group_id):

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)
    group = ResearchGroupService.get_group(group_id)

    if not group:
        return {
            "status": "error",
            "message": "Research group not found"
        }, 404

    if user.role != "Admin" and group.created_by != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    group = ResearchGroupService.update_group(
        group,
        request.get_json()
    )
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Updated",
    entity_type="Research Group",
    entity_id=group.id,
    ip_address=request.remote_addr
)
    return {
        "status": "success",
        "message": "Research group updated successfully",
        "group_id": group.id
    }, 200


@research_group_bp.route("/<int:group_id>", methods=["DELETE"])
@jwt_required()
def delete_group(group_id):

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)
    group = ResearchGroupService.get_group(group_id)

    if not group:
        return {
            "status": "error",
            "message": "Research group not found"
        }, 404

    if user.role != "Admin" and group.created_by != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    ResearchGroupService.delete_group(group)
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Deleted",
    entity_type="Research Group",
    entity_id=group.id,
    ip_address=request.remote_addr
)
    return {
        "status": "success",
        "message": "Research group deleted successfully"
    }, 200
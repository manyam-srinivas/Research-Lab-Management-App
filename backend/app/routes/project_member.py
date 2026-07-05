from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.project import Project
from app.services.project_member_service import ProjectMemberService


project_member_bp = Blueprint(
    "project_members",
    __name__
)


@project_member_bp.route("/", methods=["POST"])
@jwt_required()
def add_member():

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    data = request.get_json()

    if not all([
        data.get("project_id"),
        data.get("user_id"),
        data.get("member_type")
    ]):
        return {
            "status": "error",
            "message": "project_id, user_id and member_type are required"
        }, 400

    project = Project.query.filter_by(
        id=data.get("project_id"),
        is_deleted=False
    ).first()

    if not project:
        return {
            "status": "error",
            "message": "Project not found"
        }, 404

    if user.role != "Admin" and project.created_by != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    existing_member = ProjectMemberService.get_project_members(
        data.get("project_id")
    )

    for member in existing_member:
        if member.user_id == data.get("user_id"):
            return {
                "status": "error",
                "message": "User is already a member of this project"
            }, 400

    member = ProjectMemberService.add_member(data)

    return {
        "status": "success",
        "message": "Project member added successfully",
        "member_id": member.id
    }, 201


@project_member_bp.route("/project/<int:project_id>", methods=["GET"])
@jwt_required()
def get_project_members(project_id):

    members = ProjectMemberService.get_project_members(project_id)

    return {
        "status": "success",
        "count": len(members),
        "members": [
            {
                "id": member.id,
                "project_id": member.project_id,
                "user_id": member.user_id,
                "member_type": member.member_type,
                "joined_at": str(member.joined_at)
                if member.joined_at else None
            }
            for member in members
        ]
    }, 200


@project_member_bp.route("/<int:member_id>", methods=["PUT"])
@jwt_required()
def update_member(member_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    member = ProjectMemberService.get_member(member_id)

    if not member:
        return {
            "status": "error",
            "message": "Project member not found"
        }, 404

    project = Project.query.filter_by(
        id=member.project_id,
        is_deleted=False
    ).first()

    if user.role != "Admin" and project.created_by != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    member = ProjectMemberService.update_member(
        member,
        request.get_json()
    )

    return {
        "status": "success",
        "message": "Project member updated successfully",
        "member_id": member.id
    }, 200


@project_member_bp.route("/<int:member_id>", methods=["DELETE"])
@jwt_required()
def remove_member(member_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    member = ProjectMemberService.get_member(member_id)

    if not member:
        return {
            "status": "error",
            "message": "Project member not found"
        }, 404

    project = Project.query.filter_by(
        id=member.project_id,
        is_deleted=False
    ).first()

    if user.role != "Admin" and project.created_by != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    ProjectMemberService.remove_member(member)

    return {
        "status": "success",
        "message": "Project member removed successfully"
    }, 200
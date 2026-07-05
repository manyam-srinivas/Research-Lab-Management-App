from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.project import Project
from app.services.milestone_service import MilestoneService


milestone_bp = Blueprint("milestones", __name__)


@milestone_bp.route("/", methods=["POST"])
@jwt_required()
def create_milestone():

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    data = request.get_json()

    if not data.get("project_id") or not data.get("title"):
        return {
            "status": "error",
            "message": "project_id and title are required"
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

    milestone = MilestoneService.create_milestone(data)

    return {
        "status": "success",
        "message": "Milestone created successfully",
        "milestone_id": milestone.id
    }, 201


@milestone_bp.route("/project/<int:project_id>", methods=["GET"])
@jwt_required()
def get_project_milestones(project_id):

    milestones = MilestoneService.get_project_milestones(
        project_id
    )

    return {
        "status": "success",
        "count": len(milestones),
        "milestones": [
            {
                "id": milestone.id,
                "project_id": milestone.project_id,
                "title": milestone.title,
                "description": milestone.description,
                "due_date": str(milestone.due_date)
                if milestone.due_date else None,
                "status": milestone.status,
                "completion_percentage":
                    milestone.completion_percentage
            }
            for milestone in milestones
        ]
    }, 200


@milestone_bp.route("/<int:milestone_id>", methods=["GET"])
@jwt_required()
def get_milestone(milestone_id):

    milestone = MilestoneService.get_milestone(milestone_id)

    if not milestone:
        return {
            "status": "error",
            "message": "Milestone not found"
        }, 404

    return {
        "status": "success",
        "milestone": {
            "id": milestone.id,
            "project_id": milestone.project_id,
            "title": milestone.title,
            "description": milestone.description,
            "due_date": str(milestone.due_date)
            if milestone.due_date else None,
            "status": milestone.status,
            "completion_percentage":
                milestone.completion_percentage
        }
    }, 200


@milestone_bp.route("/<int:milestone_id>", methods=["PUT"])
@jwt_required()
def update_milestone(milestone_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    milestone = MilestoneService.get_milestone(milestone_id)

    if not milestone:
        return {
            "status": "error",
            "message": "Milestone not found"
        }, 404

    project = Project.query.filter_by(
        id=milestone.project_id,
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

    milestone = MilestoneService.update_milestone(
        milestone,
        request.get_json()
    )

    return {
        "status": "success",
        "message": "Milestone updated successfully",
        "milestone_id": milestone.id
    }, 200


@milestone_bp.route("/<int:milestone_id>", methods=["DELETE"])
@jwt_required()
def delete_milestone(milestone_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    milestone = MilestoneService.get_milestone(milestone_id)

    if not milestone:
        return {
            "status": "error",
            "message": "Milestone not found"
        }, 404

    project = Project.query.filter_by(
        id=milestone.project_id,
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

    MilestoneService.delete_milestone(milestone)

    return {
        "status": "success",
        "message": "Milestone deleted successfully"
    }, 200
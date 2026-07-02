from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.project_service import ProjectService


from app.models.user import User

project_bp = Blueprint("projects", __name__)


@project_bp.route("/", methods=["POST"])
@jwt_required()
def create_project():

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    allowed_roles = [
        "Admin",
        "Faculty",
        "Research Scholar"
    ]

    if user.role not in allowed_roles:
        return {
            "status": "error",
            "message": "You are not authorized to create projects."
        }, 403

    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    priority = data.get("priority", "Medium")
    visibility = data.get("visibility", "Private")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    research_group_id = data.get("research_group_id")

    if not title:
        return {
            "status": "error",
            "message": "Project title is required."
        }, 400

    project = ProjectService.create_project(
        data,
        current_user_id
    )

    return {
        "status": "success",
        "message": "Project created successfully",
        "project_id": project.id
    }, 201


@project_bp.route("/", methods=["GET"])
@jwt_required()
def get_projects():

    projects = ProjectService.get_all_projects()

    project_list = []

    for project in projects:
        project_list.append({
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "priority": project.priority,
            "visibility": project.visibility,
            "status": project.status,
            "start_date": str(project.start_date) if project.start_date else None,
            "end_date": str(project.end_date) if project.end_date else None,
            "created_by": project.created_by
        })

    return {
        "status": "success",
        "count": len(project_list),
        "projects": project_list
    }, 200

@project_bp.route("/<int:project_id>", methods=["GET"])
@jwt_required()
def get_project(project_id):

    project = ProjectService.get_project(project_id)

    if not project:
        return {
            "status": "error",
            "message": "Project not found"
        }, 404

    return {
        "status": "success",
        "project": {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "priority": project.priority,
            "visibility": project.visibility,
            "status": project.status,
            "start_date": str(project.start_date) if project.start_date else None,
            "end_date": str(project.end_date) if project.end_date else None,
            "created_by": project.created_by
        }
    }, 200
@project_bp.route("/<int:project_id>", methods=["PUT"])
@jwt_required()
def update_project(project_id):

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    project = ProjectService.get_project(project_id)

    if not project:
        return {
            "status": "error",
            "message": "Project not found"
        }, 404

    # Only creator or Admin can edit
    if user.role != "Admin" and project.created_by != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    data = request.get_json()

    project = ProjectService.update_project(project, data)

    return {
        "status": "success",
        "message": "Project updated successfully",
        "project": {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "priority": project.priority,
            "visibility": project.visibility,
            "status": project.status
        }
    }, 200

@project_bp.route("/<int:project_id>", methods=["DELETE"])
@jwt_required()
def delete_project(project_id):

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    project = ProjectService.get_project(project_id)

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

    ProjectService.delete_project(project)

    return {
        "status": "success",
        "message": "Project deleted successfully"
    }, 200
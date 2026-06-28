from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.project import Project
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

    project = Project(
        title=title,
        description=description,
        priority=priority,
        visibility=visibility,
        start_date=start_date,
        end_date=end_date,
        research_group_id=research_group_id,
        created_by=current_user_id
    )

    db.session.add(project)
    db.session.commit()

    return {
        "status": "success",
        "message": "Project created successfully",
        "project_id": project.id
    }, 201
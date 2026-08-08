from sqlalchemy import or_

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.project import Project
from app.models.user import User
from app.models.equipment import Equipment
from app.models.research_group import ResearchGroup
from app.models.departments import Department

search_bp = Blueprint("search", __name__)


@search_bp.route("/", methods=["GET"])
@jwt_required()
def global_search():

    q = (request.args.get("q") or "").strip()

    if len(q) < 2:
        return {
            "status": "success",
            "projects": [],
            "users": [],
            "equipment": [],
            "research_groups": [],
            "departments": []
        }, 200

    like = f"%{q}%"

    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    is_admin = bool(current_user and current_user.role == "Admin")

    projects_query = Project.query.filter(
        Project.is_deleted.is_(False),
        Project.title.ilike(like)
    )

    # Respect project visibility: non-admins only see public / department
    # projects plus their own private ones.
    if not is_admin:
        projects_query = projects_query.filter(
            or_(
                Project.visibility != "Private",
                Project.created_by == current_user_id
            )
        )

    projects = (
        projects_query.order_by(Project.created_at.desc())
        .limit(5)
        .all()
    )

    users = (
        User.query.filter(
            User.status == "Active",
            User.full_name.ilike(like) | User.email.ilike(like)
        )
        .limit(5)
        .all()
    )

    equipment = (
        Equipment.query.filter(Equipment.name.ilike(like))
        .limit(5)
        .all()
    )

    groups = (
        ResearchGroup.query.filter(ResearchGroup.name.ilike(like))
        .limit(5)
        .all()
    )

    departments = (
        Department.query.filter(Department.name.ilike(like))
        .limit(5)
        .all()
    )

    return {
        "status": "success",
        "projects": [
            {"id": p.id, "title": p.title, "status": p.status}
            for p in projects
        ],
        "users": [
            {
                "id": u.id,
                "full_name": u.full_name,
                "role": u.role
            }
            for u in users
        ],
        "equipment": [
            {"id": e.id, "name": e.name, "status": e.status}
            for e in equipment
        ],
        "research_groups": [
            {"id": g.id, "name": g.name}
            for g in groups
        ],
        "departments": [
            {"id": d.id, "name": d.name}
            for d in departments
        ]
    }, 200

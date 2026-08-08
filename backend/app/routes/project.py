from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.services.project_service import ProjectService
from app.services.activity_log_service import ActivityLogService
from app.services.budget_service import BudgetService
from app.services.expense_service import ExpenseService
from app.services.procurement_service import ProcurementService
from app.models.user import User
from app.models.departments import Department
from app.models.research_group import ResearchGroup

project_bp = Blueprint("projects", __name__)


def _validate_project_budget(department_id, budget, exclude_project_id=None):
    """Return an error message if the budget cannot be allocated to the
    department, else None. A budget is only allowed when it fits inside
    the department's available (uncommitted) budget pool."""
    if budget is None or budget <= 0:
        return None

    if not department_id:
        return (
            "Please select a department to allocate a project budget."
        )

    department = Department.query.get(department_id)

    if not department:
        return "Selected department does not exist."

    availability = BudgetService.get_department_availability(
        department_id,
        exclude_project_id=exclude_project_id
    )

    if budget > availability["available"]:
        return (
            f"Project budget ₹{budget:,.2f} exceeds the department's "
            f"available budget of ₹{availability['available']:,.2f} "
            f"(department total ₹{availability['total']:,.2f}, "
            f"already allocated ₹{availability['committed']:,.2f})."
        )

    return None


def project_to_dict(project):
    """Shared serializer used by list endpoints."""
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "priority": project.priority,
        "visibility": project.visibility,
        "status": project.status,
        "start_date": str(project.start_date)
        if project.start_date else None,
        "end_date": str(project.end_date)
        if project.end_date else None,
        "created_by": project.created_by,
        "department_id": project.department_id,
        "budget": ProjectService.get_project_budget(project.id)
    }


def _parse_budget(data):
    """Return (budget, department_id, error_message)."""
    try:
        budget = float(data.get("budget") or 0)
    except (TypeError, ValueError):
        return None, None, "Budget must be a number."

    if budget < 0:
        return None, None, "Budget cannot be negative."

    department_id = data.get("department_id")

    if department_id in (None, ""):
        department_id = None
    else:
        try:
            department_id = int(department_id)
        except (TypeError, ValueError):
            return None, None, "Department must be a valid id."

    return budget, department_id, None


def _finance_for_project(project_id):
    """Aggregate budgets, expenses and procurement for a project."""
    budgets = BudgetService.get_all_budgets(
        project_id=project_id
    )
    expenses = ExpenseService.get_all_expenses(
        project_id=project_id
    )
    procurement = ProcurementService.get_all_requests(
        project_id=project_id
    )

    total_allocated = sum(
        float(b.allocated_amount) for b in budgets
    )
    total_spent = sum(
        float(e.amount) for e in expenses
    )

    return {
        "budgets": [
            {
                "id": b.id,
                "financial_year": b.financial_year,
                "allocated_amount": float(b.allocated_amount),
                "spent_amount": float(b.spent_amount),
                "remaining_amount": float(b.remaining_amount),
            }
            for b in budgets
        ],
        "expenses": [
            {
                "id": e.id,
                "amount": float(e.amount),
                "expense_type": e.expense_type,
                "description": e.description,
                "created_at": str(e.created_at) if e.created_at else None,
            }
            for e in expenses
        ],
        "procurement": [
            {
                "id": p.id,
                "item_name": p.item_name,
                "quantity": p.quantity,
                "estimated_cost": float(p.estimated_cost)
                if p.estimated_cost else None,
                "status": p.status,
                "created_at": str(p.created_at) if p.created_at else None,
            }
            for p in procurement
        ],
        "summary": {
            "total_allocated": total_allocated,
            "total_spent": total_spent,
            "remaining": total_allocated - total_spent,
        },
    }


@project_bp.route("/<int:project_id>/finance", methods=["GET"])
@jwt_required()
def get_project_finance(project_id):

    project = ProjectService.get_project(project_id)

    if not project:
        return {
            "status": "error",
            "message": "Project not found"
        }, 404

    return {
        "status": "success",
        "project_id": project_id,
        "finance": _finance_for_project(project_id)
    }, 200


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

    if not title:
        return {
            "status": "error",
            "message": "Project title is required."
        }, 400

    budget, department_id, budget_error = _parse_budget(data)

    if budget_error:
        return {
            "status": "error",
            "message": budget_error
        }, 400

    # When no department was chosen but a research group was, derive the
    # department from the group so the project always lands in its
    # department (and any budget validates against the right pool).
    if department_id is None and data.get("research_group_id"):
        group = ResearchGroup.query.get(
            data.get("research_group_id")
        )

        if group is not None:
            department_id = group.department_id

    error = _validate_project_budget(
        department_id,
        budget
    )

    if error:
        return {
            "status": "error",
            "message": error
        }, 400

    data["budget"] = budget
    data["department_id"] = department_id

    project = ProjectService.create_project(
        data,
        current_user_id
    )

    ActivityLogService.log_activity(
        user_id=current_user_id,
        action="Created",
        entity_type="Project",
        entity_id=project.id,
        ip_address=request.remote_addr
    )

    return {
        "status": "success",
        "message": "Project created successfully",
        "project_id": project.id
    }, 201


@project_bp.route("/", methods=["GET"])
@jwt_required()
def get_projects():

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    per_page = min(max(per_page, 1), 100)

    projects, total = ProjectService.get_all_projects(
        search=request.args.get("search"),
        status=request.args.get("status"),
        page=page,
        per_page=per_page
    )

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
            "created_by": project.created_by,
            "department_id": project.department_id,
            "budget": ProjectService.get_project_budget(project.id)
        })

    pages = (total + per_page - 1) // per_page if per_page else 1

    return {
        "status": "success",
        "count": len(project_list),
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
        "projects": project_list
    }, 200


@project_bp.route("/my", methods=["GET"])
@jwt_required()
def get_my_projects():
    """Projects the current user belongs to: as a project member, as the
    project creator, or as someone with tasks assigned in the project.
    Students use this to see only the projects they are part of."""
    from sqlalchemy import or_
    from app.models.project import Project
    from app.models.project_member import ProjectMember
    from app.models.task import Task
    from app.models.milestone import Milestone

    current_user_id = int(get_jwt_identity())

    member_project_ids = [
        m.project_id
        for m in ProjectMember.query.filter_by(
            user_id=current_user_id
        ).all()
    ]

    # Projects where the user has tasks assigned, even if they are not
    # listed as a formal project member yet.
    task_project_rows = (
        db.session.query(Project.id)
        .join(Milestone, Milestone.project_id == Project.id)
        .join(Task, Task.milestone_id == Milestone.id)
        .filter(
            Task.assigned_to == current_user_id,
            Project.is_deleted.is_(False)
        )
        .all()
    )

    task_project_ids = [
        row[0] for row in task_project_rows
    ]

    projects = Project.query.filter(
        Project.is_deleted.is_(False),
        or_(
            Project.created_by == current_user_id,
            Project.id.in_(member_project_ids),
            Project.id.in_(task_project_ids)
        )
    ).order_by(Project.created_at.desc()).all()

    return {
        "status": "success",
        "count": len(projects),
        "projects": [
            project_to_dict(p)
            for p in projects
        ]
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
            "created_by": project.created_by,
            "department_id": project.department_id,
            "budget": ProjectService.get_project_budget(project.id)
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

    if user.role != "Admin" and project.created_by != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    data = request.get_json()

    budget, department_id, budget_error = _parse_budget(data)

    if budget_error:
        return {
            "status": "error",
            "message": budget_error
        }, 400

    # Partial updates that only touch the budget keep the project's
    # current department when the payload omits department_id.
    if "department_id" not in data:
        department_id = project.department_id

    error = _validate_project_budget(
        department_id,
        budget,
        exclude_project_id=project_id
    )

    if error:
        return {
            "status": "error",
            "message": error
        }, 400

    # Only touch budget / department when the client sent them, so
    # partial updates never silently clear the project's budget.
    if "budget" in data:
        data["budget"] = budget

    if "department_id" in data:
        data["department_id"] = department_id

    project = ProjectService.update_project(project, data)

    ActivityLogService.log_activity(
        user_id=current_user_id,
        action="Updated",
        entity_type="Project",
        entity_id=project.id,
        ip_address=request.remote_addr
    )

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

    ActivityLogService.log_activity(
        user_id=current_user_id,
        action="Deleted",
        entity_type="Project",
        entity_id=project.id,
        ip_address=request.remote_addr
    )

    return {
        "status": "success",
        "message": "Project deleted successfully"
    }, 200
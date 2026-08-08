from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.department_service import DepartmentService
from app.services.activity_log_service import ActivityLogService
department_bp = Blueprint(
    "departments",
    __name__
)


@department_bp.route("/overview", methods=["GET"])
@jwt_required()
def get_departments_overview():
    """Departments with their budgets and the projects (and project
    budgets) that belong to each department.

    A project belongs to a department through its research group.
    Department-level budgets are stored with department_id set;
    project-level budgets are stored with project_id set.
    """
    from sqlalchemy import or_
    from app.models.budget import Budget
    from app.models.project import Project
    from app.models.research_group import ResearchGroup

    departments = DepartmentService.get_all_departments()

    result = []

    for dept in departments:
        # --- Department-level budget (the "100" in your example) ---
        # Only rows without a project link, so project budgets are never
        # counted here (they appear under their project instead).
        dept_budgets = Budget.query.filter(
            Budget.department_id == dept.id,
            Budget.project_id.is_(None)
        ).all()

        dept_allocated = sum(
            float(b.allocated_amount) for b in dept_budgets
        )
        dept_spent = sum(
            float(b.spent_amount) for b in dept_budgets
        )

        dept_records = [
            {
                "id": b.id,
                "financial_year": b.financial_year,
                "allocated": float(b.allocated_amount),
                "spent": float(b.spent_amount),
                "remaining": float(b.remaining_amount),
            }
            for b in dept_budgets
        ]

        # --- Projects in this department (direct link or via research
        # groups) ---
        group_ids = [
            g.id
            for g in ResearchGroup.query.filter_by(
                department_id=dept.id
            ).all()
        ]

        filters = [Project.department_id == dept.id]

        if group_ids:
            filters.append(
                Project.research_group_id.in_(group_ids)
            )

        dept_projects = Project.query.filter(
            Project.is_deleted.is_(False),
            or_(*filters)
        ).all()

        projects = []
        for proj in dept_projects:
            proj_budgets = Budget.query.filter_by(
                project_id=proj.id
            ).all()

            projects.append({
                "id": proj.id,
                "title": proj.title,
                "status": proj.status,
                "priority": proj.priority,
                "budget": {
                    "allocated": sum(
                        float(b.allocated_amount)
                        for b in proj_budgets
                    ),
                    "spent": sum(
                        float(b.spent_amount)
                        for b in proj_budgets
                    ),
                    "remaining": sum(
                        float(b.remaining_amount)
                        for b in proj_budgets
                    ),
                },
                "budget_records": [
                    {
                        "id": b.id,
                        "financial_year": b.financial_year,
                        "allocated": float(b.allocated_amount),
                        "spent": float(b.spent_amount),
                        "remaining": float(b.remaining_amount),
                    }
                    for b in proj_budgets
                ],
            })

        # Amount already committed to the department's projects (the
        # department budget is the pool its projects draw from).
        project_ids = [proj.id for proj in dept_projects]

        committed = 0.0

        if project_ids:
            committed = sum(
                float(b.allocated_amount)
                for b in Budget.query.filter(
                    Budget.project_id.in_(project_ids)
                ).all()
            )

        result.append({
            "id": dept.id,
            "name": dept.name,
            "description": dept.description,
            "project_count": len(projects),
            "budget": {
                "allocated": dept_allocated,
                "spent": dept_spent,
                "committed": committed,
                "remaining": round(
                    dept_allocated - dept_spent - committed,
                    2
                ),
            },
            "budget_records": dept_records,
            "projects": projects,
        })

    return {
        "status": "success",
        "count": len(result),
        "departments": result
    }, 200


@department_bp.route("/", methods=["GET"])
@jwt_required()
def get_departments():

    departments = DepartmentService.get_all_departments()

    return {
        "status": "success",
        "count": len(departments),
        "departments": [
            {
                "id": department.id,
                "name": department.name,
                "description": department.description
            }
            for department in departments
        ]
    }, 200


@department_bp.route("/", methods=["POST"])
@jwt_required()
def create_department():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data.get("name"):
        return {
            "status": "error",
            "message": "Department name is required"
        }, 400

    department = DepartmentService.create_department(data)
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Created",
    entity_type="Department",
    entity_id=department.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Department created successfully",
        "department_id": department.id
    }, 201


@department_bp.route("/<int:department_id>", methods=["PUT"])
@jwt_required()
def update_department(department_id):

    current_user_id = int(get_jwt_identity())

    department = DepartmentService.get_department(department_id)

    if not department:
        return {
            "status": "error",
            "message": "Department not found"
        }, 404

    DepartmentService.update_department(
        department,
        request.get_json()
    )
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Updated",
    entity_type="Department",
    entity_id=department.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Department updated successfully"
    }, 200


@department_bp.route("/<int:department_id>", methods=["DELETE"])
@jwt_required()
def delete_department(department_id):

    current_user_id = int(get_jwt_identity())
    department = DepartmentService.get_department(department_id)

    if not department:
        return {
            "status": "error",
            "message": "Department not found"
        }, 404

    DepartmentService.delete_department(department)
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Deleted",
    entity_type="Department",
    entity_id=department.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Department deleted successfully"
    }, 200
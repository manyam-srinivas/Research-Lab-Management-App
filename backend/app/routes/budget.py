import csv
import io

from flask import Blueprint, request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.departments import Department
from app.services.budget_service import BudgetService
from app.services.activity_log_service import ActivityLogService

budget_bp = Blueprint(
    "budgets",
    __name__
)


def _project_department(project):
    """Department a project belongs to (direct link or research group)."""
    if project.department_id:
        return project.department_id

    if project.research_group_id:
        from app.models.research_group import ResearchGroup
        group = ResearchGroup.query.get(project.research_group_id)

        if group is not None:
            return group.department_id

    return None


def _parse_allocated_amount(data):
    try:
        amount = float(data.get("allocated_amount") or 0)
    except (TypeError, ValueError):
        return None, "Allocated amount must be a number."

    if amount <= 0:
        return None, "Allocated amount must be greater than zero."

    return amount, None


def _validate_budget_data(data, exclude_budget_id=None):
    """Return an error message if the budget data is invalid, else None.

    Department budgets need a department. Project budgets need a project
    that belongs to a department, and the amount must fit inside the
    department's available (uncommitted) pool.
    """
    from app.models.project import Project

    amount, amount_error = _parse_allocated_amount(data)

    if amount_error:
        return amount_error

    financial_year = data.get("financial_year")

    if financial_year and len(str(financial_year)) > 20:
        return "Financial year must be 20 characters or fewer."

    project_id = data.get("project_id")

    if project_id not in (None, ""):
        try:
            project_id = int(project_id)
        except (TypeError, ValueError):
            return "Project must be a valid id."

        project = Project.query.get(project_id)

        if not project or project.is_deleted:
            return "Selected project does not exist."

        department_id = _project_department(project)

        if department_id is None:
            return (
                "This project has no department yet. "
                "Set the project's department first."
            )

        availability = BudgetService.get_department_availability(
            department_id,
            exclude_budget_id=exclude_budget_id
        )

        if amount > availability["available"]:
            return (
                f"Budget ₹{amount:,.2f} exceeds the department's available "
                f"budget of ₹{availability['available']:,.2f} "
                f"(department total ₹{availability['total']:,.2f}, already "
                f"allocated to projects ₹{availability['committed']:,.2f})."
            )

        return None

    # Department-level budget
    department_id = data.get("department_id")

    if department_id in (None, ""):
        return "Please select a department."

    try:
        department_id = int(department_id)
    except (TypeError, ValueError):
        return "Department must be a valid id."

    department = Department.query.get(department_id)

    if not department:
        return "Selected department does not exist."

    return None


def budget_to_dict(budget):

    return {
        "id": budget.id,
        "department_id": budget.department_id,
        "project_id": budget.project_id,
        "financial_year": budget.financial_year,
        "allocated_amount": float(
            budget.allocated_amount
        ),
        "spent_amount": float(
            budget.spent_amount
        ),
        "remaining_amount": float(
            budget.remaining_amount
        )
    }


@budget_bp.route("/export", methods=["GET"])
@jwt_required()
def export_budgets_csv():

    budgets = BudgetService.get_all_budgets(
        search=request.args.get("search"),
        project_id=request.args.get("project_id", type=int)
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Department ID", "Project ID", "Financial Year",
        "Allocated", "Spent", "Remaining"
    ])

    for b in budgets:
        writer.writerow([
            b.id, b.department_id or "", b.project_id or "",
            b.financial_year or "",
            b.allocated_amount, b.spent_amount, b.remaining_amount
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": (
                "attachment; filename=budgets.csv"
            )
        }
    )


@budget_bp.route("/availability", methods=["GET"])
@jwt_required()
def budget_availability():
    """Department budget pool: total, committed to projects and the
    amount still available for new project budgets."""
    department_id = request.args.get("department_id", type=int)
    exclude_project_id = request.args.get(
        "exclude_project_id",
        type=int
    )
    exclude_budget_id = request.args.get(
        "exclude_budget_id",
        type=int
    )

    if not department_id:
        return {
            "status": "error",
            "message": "department_id is required"
        }, 400

    return {
        "status": "success",
        "availability": BudgetService.get_department_availability(
            department_id,
            exclude_project_id=exclude_project_id,
            exclude_budget_id=exclude_budget_id
        )
    }, 200


@budget_bp.route("/", methods=["POST"])
@jwt_required()
def create_budget():

    current_user_id = int(
        get_jwt_identity()
    )

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can create budgets."
        }, 403

    data = request.get_json() or {}

    error = _validate_budget_data(data)

    if error:
        return {
            "status": "error",
            "message": error
        }, 400

    budget = BudgetService.create_budget(
        data
    )
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Created",
    entity_type="Budget",
    entity_id=budget.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "budget_id": budget.id
    }, 201


@budget_bp.route("/", methods=["GET"])
@jwt_required()
def get_budgets():

    budgets = BudgetService.get_all_budgets(
        search=request.args.get("search"),
        project_id=request.args.get("project_id",
            type=int)
    )

    return {
        "status": "success",
        "count": len(budgets),
        "budgets": [
            budget_to_dict(b)
            for b in budgets
        ]
    }, 200


@budget_bp.route("/<int:budget_id>", methods=["GET"])
@jwt_required()
def get_budget(budget_id):

    budget = BudgetService.get_budget(
        budget_id
    )

    if not budget:
        return {
            "status": "error",
            "message": "Budget not found"
        }, 404

    return {
        "status": "success",
        "budget": budget_to_dict(
            budget
        )
    }, 200


@budget_bp.route(
    "/<int:budget_id>",
    methods=["PUT"]
)
@jwt_required()
def update_budget(budget_id):

    current_user_id = int(
        get_jwt_identity()
    )

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can update budgets."
        }, 403

    budget = BudgetService.get_budget(
        budget_id
    )

    if not budget:
        return {
            "status": "error",
            "message": "Budget not found"
        }, 404

    data = request.get_json() or {}

    error = _validate_budget_data(
        data,
        exclude_budget_id=budget.id
    )

    if error:
        return {
            "status": "error",
            "message": error
        }, 400

    budget = BudgetService.update_budget(
        budget,
        data
    )
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Updated",
    entity_type="Budget",
    entity_id=budget.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Budget updated successfully"
    }, 200


@budget_bp.route(
    "/<int:budget_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_budget(budget_id):

    current_user_id = int(
        get_jwt_identity()
    )

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can delete budgets."
        }, 403

    budget = BudgetService.get_budget(
        budget_id
    )

    if not budget:
        return {
            "status": "error",
            "message": "Budget not found"
        }, 404

    BudgetService.delete_budget(
        budget
    )
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Deleted",
    entity_type="Budget",
    entity_id=budget.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Budget deleted successfully"
    }, 200
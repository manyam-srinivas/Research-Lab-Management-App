from flask import Blueprint
from flask_jwt_extended import jwt_required

dashboard_bp = Blueprint(
    "dashboard",
    __name__
)
from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.services.dashboard_service import DashboardService

dashboard_bp = Blueprint(
    "dashboard",
    __name__
)


@dashboard_bp.route("/summary", methods=["GET"])
@jwt_required()
def dashboard_summary():

    return {
        "status": "success",
        "summary": DashboardService.get_summary()
    }, 200


@dashboard_bp.route("/finance", methods=["GET"])
@jwt_required()
def finance_dashboard():

    from app.models.budget import Budget
    from app.models.expense import Expense

    budgets = Budget.query.all()
    expenses = Expense.query.all()

    total_budget = sum(
        float(b.allocated_amount)
        for b in budgets
    )

    total_spent = sum(
        float(b.spent_amount)
        for b in budgets
    )

    total_remaining = sum(
        float(b.remaining_amount)
        for b in budgets
    )

    return {
        "status": "success",
        "finance": {
            "total_budget": total_budget,
            "total_spent": total_spent,
            "remaining_budget": total_remaining,
            "total_expenses": len(expenses)
        }
    }, 200


@dashboard_bp.route("/equipment", methods=["GET"])
@jwt_required()
def equipment_dashboard():

    from app.models.equipment import Equipment

    return {
        "status": "success",
        "equipment": {
            "total": Equipment.query.count(),
            "available":
                Equipment.query.filter_by(
                    status="Available"
                ).count(),
            "booked":
                Equipment.query.filter_by(
                    status="Booked"
                ).count(),
            "maintenance":
                Equipment.query.filter_by(
                    status="Under Maintenance"
                ).count()
        }
    }, 200


@dashboard_bp.route("/tasks", methods=["GET"])
@jwt_required()
def task_dashboard():

    from app.models.task import Task

    return {
        "status": "success",
        "tasks": {
            "total": Task.query.count(),
            "completed":
                Task.query.filter_by(
                    status="Completed"
                ).count(),
            "pending":
                Task.query.filter_by(
                    status="Pending"
                ).count(),
            "in_progress":
                Task.query.filter_by(
                    status="In Progress"
                ).count()
        }
    }, 200
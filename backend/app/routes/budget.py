from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.services.budget_service import BudgetService


budget_bp = Blueprint(
    "budgets",
    __name__
)


def budget_to_dict(budget):

    return {
        "id": budget.id,
        "department_id": budget.department_id,
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

    data = request.get_json()

    budget = BudgetService.create_budget(
        data
    )

    return {
        "status": "success",
        "budget_id": budget.id
    }, 201


@budget_bp.route("/", methods=["GET"])
@jwt_required()
def get_budgets():

    budgets = BudgetService.get_all_budgets()

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

    budget = BudgetService.update_budget(
        budget,
        request.get_json()
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

    return {
        "status": "success",
        "message": "Budget deleted successfully"
    }, 200
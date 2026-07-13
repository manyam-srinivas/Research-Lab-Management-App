from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.budget import Budget
from app.services.expense_service import ExpenseService


expense_bp = Blueprint(
    "expenses",
    __name__
)


def expense_to_dict(expense):

    return {
        "id": expense.id,
        "budget_id": expense.budget_id,
        "procurement_request_id": expense.procurement_request_id,
        "amount": float(expense.amount),
        "expense_type": expense.expense_type,
        "description": expense.description,
        "created_at": str(expense.created_at)
        if expense.created_at else None
    }


@expense_bp.route("/", methods=["POST"])
@jwt_required()
def create_expense():

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can create expenses."
        }, 403

    data = request.get_json()

    budget = Budget.query.get(
        data.get("budget_id")
    )

    if not budget:
        return {
            "status": "error",
            "message": "Budget not found."
        }, 404

    expense = ExpenseService.create_expense(data)

    return {
        "status": "success",
        "expense_id": expense.id
    }, 201


@expense_bp.route("/", methods=["GET"])
@jwt_required()
def get_expenses():

    expenses = ExpenseService.get_all_expenses()

    return {
        "status": "success",
        "count": len(expenses),
        "expenses": [
            expense_to_dict(expense)
            for expense in expenses
        ]
    }, 200


@expense_bp.route("/<int:expense_id>", methods=["GET"])
@jwt_required()
def get_expense(expense_id):

    expense = ExpenseService.get_expense(
        expense_id
    )

    if not expense:
        return {
            "status": "error",
            "message": "Expense not found"
        }, 404

    return {
        "status": "success",
        "expense": expense_to_dict(expense)
    }, 200


@expense_bp.route(
    "/<int:expense_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_expense(expense_id):

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can delete expenses."
        }, 403

    expense = ExpenseService.get_expense(
        expense_id
    )

    if not expense:
        return {
            "status": "error",
            "message": "Expense not found"
        }, 404

    ExpenseService.delete_expense(
        expense
    )

    return {
        "status": "success",
        "message": "Expense deleted successfully"
    }, 200
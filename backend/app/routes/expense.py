import csv
import io

from flask import Blueprint, request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user import User
from app.models.budget import Budget
from app.services.expense_service import ExpenseService
from app.services.activity_log_service import ActivityLogService

expense_bp = Blueprint(
    "expenses",
    __name__
)


def expense_to_dict(expense):

    return {
        "id": expense.id,
        "budget_id": expense.budget_id,
        "project_id": expense.project_id,
        "procurement_request_id": expense.procurement_request_id,
        "amount": float(expense.amount),
        "expense_type": expense.expense_type,
        "description": expense.description,
        "created_at": str(expense.created_at)
        if expense.created_at else None
    }


@expense_bp.route("/export", methods=["GET"])
@jwt_required()
def export_expenses_csv():

    expenses = ExpenseService.get_all_expenses(
        project_id=request.args.get("project_id", type=int),
        search=request.args.get("search")
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Budget ID", "Project ID", "Amount", "Type",
        "Description", "Created At"
    ])

    for e in expenses:
        writer.writerow([
            e.id, e.budget_id, e.project_id or "",
            e.amount, e.expense_type or "",
            e.description or "",
            str(e.created_at) if e.created_at else ""
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": (
                "attachment; filename=expenses.csv"
            )
        }
    )


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

    try:
        expense = ExpenseService.create_expense(data)
    except ValueError as e:
        db.session.rollback()
        return {
            "status": "error",
            "message": str(e)
        }, 400

    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Created",
    entity_type="Expense",
    entity_id=expense.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "expense_id": expense.id
    }, 201


@expense_bp.route("/", methods=["GET"])
@jwt_required()
def get_expenses():

    expenses = ExpenseService.get_all_expenses(
        project_id=request.args.get("project_id",
            type=int),
        search=request.args.get("search")
    )

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
    methods=["PUT"]
)
@jwt_required()
def update_expense(expense_id):

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can update expenses."
        }, 403

    expense = ExpenseService.get_expense(expense_id)

    if not expense:
        return {
            "status": "error",
            "message": "Expense not found"
        }, 404

    data = request.get_json()

    budget = Budget.query.get(data.get("budget_id"))

    if not budget:
        return {
            "status": "error",
            "message": "Budget not found."
        }, 404

    try:
        ExpenseService.update_expense(
            expense,
            data
        )
    except ValueError as e:
        db.session.rollback()
        return {
            "status": "error",
            "message": str(e)
        }, 400

    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Updated",
    entity_type="Expense",
    entity_id=expense.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Expense updated successfully"
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
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Deleted",
    entity_type="Expense",
    entity_id=expense.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Expense deleted successfully"
    }, 200
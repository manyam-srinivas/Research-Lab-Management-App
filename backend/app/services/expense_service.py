from app.extensions import db
from app.models.expense import Expense
from app.models.budget import Budget
from app.services.budget_service import BudgetService
from decimal import Decimal, InvalidOperation


class ExpenseService:

    @staticmethod
    def _derive_project_id(budget, data):
        """Link the expense to the budget's project when the client did
        not send one explicitly."""
        project_id = data.get("project_id")

        if project_id in (None, ""):
            return budget.project_id

        try:
            return int(project_id)
        except (TypeError, ValueError):
            return budget.project_id

    @staticmethod
    def _parse_amount(data):
        try:
            amount = Decimal(str(data.get("amount")))
        except (InvalidOperation, TypeError, ValueError):
            raise ValueError("Amount must be a valid number.")

        if amount <= 0:
            raise ValueError("Amount must be greater than zero.")

        return amount

    @staticmethod
    def _check_remaining(budget, amount):
        remaining = Decimal(budget.remaining_amount or 0)

        # A department-level budget is also the pool its projects draw
        # from: the amount still spendable is the department's remaining
        # minus what is already committed to the department's projects.
        if budget.project_id is None and budget.department_id:
            availability = BudgetService.get_department_availability(
                budget.department_id
            )
            remaining = Decimal(str(availability["available"]))

        if amount > remaining:
            raise ValueError(
                f"Amount ₹{amount:,.2f} exceeds the budget's remaining "
                f"amount of ₹{remaining:,.2f}."
            )

    @staticmethod
    def create_expense(data):
        budget = Budget.query.get(data.get("budget_id"))

        amount = ExpenseService._parse_amount(data)
        ExpenseService._check_remaining(budget, amount)

        budget.spent_amount = (
            Decimal(budget.spent_amount or 0) + amount
        )
        budget.remaining_amount = (
            Decimal(budget.remaining_amount or 0) - amount
        )

        expense = Expense(
            budget_id=data.get("budget_id"),
            project_id=ExpenseService._derive_project_id(budget, data),
            procurement_request_id=data.get(
                "procurement_request_id"
            ),
            amount=amount,
            expense_type=data.get("expense_type"),
            description=data.get("description")
        )

        db.session.add(expense)
        db.session.commit()

        return expense

    @staticmethod
    def get_all_expenses(project_id=None, search=None):
        query = Expense.query

        if project_id:
            query = query.filter_by(project_id=project_id)

        if search:
            like = f"%{search}%"
            query = query.filter(
                Expense.description.ilike(like)
            )

        return query.all()

    @staticmethod
    def get_expense(expense_id):
        return Expense.query.get(expense_id)

    @staticmethod
    def update_expense(expense, data):
        old_budget = Budget.query.get(expense.budget_id)
        new_budget = Budget.query.get(data.get("budget_id"))

        amount = ExpenseService._parse_amount(data)

        # Release the old amount first, so editing an expense against
        # its own budget validates against the refreshed remaining.
        old_budget.spent_amount = (
            Decimal(old_budget.spent_amount or 0) - expense.amount
        )
        old_budget.remaining_amount = (
            Decimal(old_budget.remaining_amount or 0) + expense.amount
        )

        ExpenseService._check_remaining(new_budget, amount)

        new_budget.spent_amount = (
            Decimal(new_budget.spent_amount or 0) + amount
        )
        new_budget.remaining_amount = (
            Decimal(new_budget.remaining_amount or 0) - amount
        )

        expense.budget_id = data.get("budget_id")
        expense.project_id = ExpenseService._derive_project_id(
            new_budget, data
        )
        expense.procurement_request_id = data.get(
            "procurement_request_id"
        )
        expense.amount = amount
        expense.expense_type = data.get("expense_type")
        expense.description = data.get("description")

        db.session.commit()

        return expense

    @staticmethod
    def delete_expense(expense):
        budget = Budget.query.get(expense.budget_id)

        budget.spent_amount = (
            Decimal(budget.spent_amount or 0) - expense.amount
        )
        budget.remaining_amount = (
            Decimal(budget.remaining_amount or 0) + expense.amount
        )

        db.session.delete(expense)
        db.session.commit()
from app.extensions import db
from app.models.expense import Expense
from app.models.budget import Budget
from decimal import Decimal

class ExpenseService:

    @staticmethod
    def create_expense(data):

        budget = Budget.query.get(
            data.get("budget_id")
        )

        amount = Decimal(str(data.get("amount")))

        budget.spent_amount += amount
        budget.remaining_amount -= amount

        expense = Expense(
            budget_id=data.get("budget_id"),
            procurement_request_id=data.get(
                "procurement_request_id"
            ),
            amount=amount,
            expense_type=data.get(
                "expense_type"
            ),
            description=data.get(
                "description"
            )
        )

        db.session.add(expense)
        db.session.commit()

        return expense

    @staticmethod
    def get_all_expenses():
        return Expense.query.all()

    @staticmethod
    def get_expense(expense_id):
        return Expense.query.get(expense_id)

    @staticmethod
    def delete_expense(expense):

     budget = Budget.query.get(expense.budget_id)

     budget.spent_amount -= expense.amount
     budget.remaining_amount += expense.amount

     db.session.delete(expense)
     db.session.commit()
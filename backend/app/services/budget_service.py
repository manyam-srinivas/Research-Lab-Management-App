from app.extensions import db
from app.models.budget import Budget


class BudgetService:

    @staticmethod
    def create_budget(data):

        allocated = float(
            data.get("allocated_amount", 0)
        )

        budget = Budget(
            department_id=data.get("department_id"),
            financial_year=data.get("financial_year"),
            allocated_amount=allocated,
            spent_amount=0,
            remaining_amount=allocated
        )

        db.session.add(budget)
        db.session.commit()

        return budget

    @staticmethod
    def get_all_budgets():
        return Budget.query.all()

    @staticmethod
    def get_budget(budget_id):
        return Budget.query.get(budget_id)

    @staticmethod
    def update_budget(budget, data):

        budget.financial_year = data.get(
            "financial_year",
            budget.financial_year
        )

        if "allocated_amount" in data:

            allocated = float(
                data["allocated_amount"]
            )

            budget.allocated_amount = allocated

            budget.remaining_amount = (
                allocated - float(budget.spent_amount)
            )

        db.session.commit()

        return budget

    @staticmethod
    def delete_budget(budget):

        db.session.delete(budget)
        db.session.commit()
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
            project_id=data.get("project_id"),
            financial_year=data.get("financial_year"),
            allocated_amount=allocated,
            spent_amount=0,
            remaining_amount=allocated
        )

        db.session.add(budget)
        db.session.commit()

        return budget

    @staticmethod
    def get_all_budgets(search=None, project_id=None):
        query = Budget.query

        if project_id:
            query = query.filter_by(project_id=project_id)

        if search:
            like = f"%{search}%"
            query = query.filter(
                Budget.financial_year.ilike(like)
            )

        return query.all()

    @staticmethod
    def get_budget(budget_id):
        return Budget.query.get(budget_id)

    @staticmethod
    def get_department_availability(
        department_id,
        exclude_project_id=None,
        exclude_budget_id=None
    ):
        """Return the department's budget pool split into total,
        committed (already allocated to projects) and available.

        ``total`` is the sum of the department-level budgets only
        (rows with department_id set and no project link), so the
        department card never double-counts project budgets.

        ``committed`` is the sum of every budget row belonging to a
        project of this department (a project belongs to a department
        through a direct link or through its research group).

        ``exclude_project_id`` lets a project edit ignore all of that
        project's budgets so an unchanged budget stays valid.
        ``exclude_budget_id`` lets a budget-row edit ignore only the
        row being edited.
        """
        from sqlalchemy import or_
        from app.models.project import Project
        from app.models.research_group import ResearchGroup

        pool = Budget.query.filter(
            Budget.department_id == department_id,
            Budget.project_id.is_(None)
        ).all()

        total = sum(
            float(b.allocated_amount) for b in pool
        )

        # Projects belonging to this department (direct link or via a
        # research group) - mirrors the departments overview logic.
        group_ids = [
            g.id
            for g in ResearchGroup.query.filter_by(
                department_id=department_id
            ).all()
        ]

        filters = [Project.department_id == department_id]

        if group_ids:
            filters.append(
                Project.research_group_id.in_(group_ids)
            )

        project_ids = [
            p.id
            for p in Project.query.filter(
                Project.is_deleted.is_(False),
                or_(*filters)
            ).all()
        ]

        committed = 0.0

        if project_ids:
            rows = Budget.query.filter(
                Budget.project_id.in_(project_ids)
            ).all()

            for b in rows:
                if (
                    exclude_project_id
                    and b.project_id == exclude_project_id
                ):
                    continue

                if (
                    exclude_budget_id
                    and b.id == exclude_budget_id
                ):
                    continue

                committed += float(b.allocated_amount)

        spent = sum(
            float(b.spent_amount) for b in pool
        )

        return {
            "total": round(total, 2),
            "spent": round(spent, 2),
            "committed": round(committed, 2),
            "available": round(total - spent - committed, 2)
        }

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
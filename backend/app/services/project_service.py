from datetime import datetime

from app.extensions import db
from app.models.project import Project
from app.models.budget import Budget


def current_financial_year():
    year = datetime.now().year
    return f"{year}-{year + 1}"


class ProjectService:

    @staticmethod
    def _attach_budget(project, department_id, allocated):
        """Create (or update) the single budget row linked to a project."""
        existing = Budget.query.filter_by(
            project_id=project.id
        ).first()

        if existing:
            existing.allocated_amount = allocated
            existing.remaining_amount = (
                allocated - float(existing.spent_amount)
            )

            if department_id is not None:
                existing.department_id = department_id

            return existing

        budget = Budget(
            department_id=department_id,
            project_id=project.id,
            financial_year=current_financial_year(),
            allocated_amount=allocated,
            spent_amount=0,
            remaining_amount=allocated
        )

        db.session.add(budget)

        return budget

    @staticmethod
    def create_project(data, current_user_id):
        project = Project(
            title=data.get("title"),
            description=data.get("description"),
            priority=data.get("priority", "Medium"),
            visibility=data.get("visibility", "Private"),
            status="Draft",
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            research_group_id=data.get("research_group_id"),
            department_id=data.get("department_id"),
            created_by=current_user_id
        )

        db.session.add(project)
        db.session.flush()

        allocated = float(data.get("budget") or 0)

        if allocated > 0:
            ProjectService._attach_budget(
                project,
                data.get("department_id"),
                allocated
            )

        db.session.commit()

        return project

    @staticmethod
    def get_all_projects(search=None, status=None, page=None, per_page=None):
        query = Project.query.filter_by(
            is_deleted=False
        )

        if status:
            query = query.filter_by(status=status)

        if search:
            like = f"%{search}%"
            query = query.filter(
                Project.title.ilike(like) |
                Project.description.ilike(like)
            )

        total = query.count()

        if page and per_page:
            query = (
                query
                .order_by(Project.created_at.desc())
                .offset((page - 1) * per_page)
                .limit(per_page)
            )

        return query.all(), total

    @staticmethod
    def get_project(project_id):
        return Project.query.filter_by(
            id=project_id,
            is_deleted=False
        ).first()

    @staticmethod
    def update_project(project, data):
        project.title = data.get("title", project.title)
        project.description = data.get("description", project.description)
        project.priority = data.get("priority", project.priority)
        project.visibility = data.get("visibility", project.visibility)
        project.status = data.get("status", project.status)
        project.start_date = data.get("start_date", project.start_date)
        project.end_date = data.get("end_date", project.end_date)

        if "department_id" in data:
            project.department_id = data.get("department_id")

            # Keep linked budget rows in sync with the project's
            # department so an existing budget stays committed against
            # the department the project actually belongs to.
            for b in Budget.query.filter_by(
                project_id=project.id
            ).all():
                b.department_id = project.department_id

        # Budget handling: "budget" absent -> leave untouched;
        # "budget" > 0 -> create/update linked budget row;
        # "budget" == 0 -> remove the linked budget row.
        if "budget" in data:
            allocated = float(data.get("budget") or 0)

            if allocated > 0:
                ProjectService._attach_budget(
                    project,
                    project.department_id,
                    allocated
                )
            else:
                existing = Budget.query.filter_by(
                    project_id=project.id
                ).all()

                for b in existing:
                    db.session.delete(b)

        db.session.commit()

        return project

    @staticmethod
    def delete_project(project):
        project.is_deleted = True

        db.session.commit()

        return True

    @staticmethod
    def get_project_budget(project_id):
        """Sum of the project's linked budget rows, or 0."""
        budgets = Budget.query.filter_by(
            project_id=project_id
        ).all()

        return sum(
            float(b.allocated_amount) for b in budgets
        )

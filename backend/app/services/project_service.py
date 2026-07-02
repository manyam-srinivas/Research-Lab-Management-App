from app.extensions import db
from app.models.project import Project


class ProjectService:

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
            created_by=current_user_id
        )

        db.session.add(project)
        db.session.commit()

        return project

    @staticmethod
    def get_all_projects():
        return Project.query.filter_by(
            is_deleted=False
        ).all()

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

        db.session.commit()

        return project

    @staticmethod
    def delete_project(project):
        project.is_deleted = True

        db.session.commit()

        return True
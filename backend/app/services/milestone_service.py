from app.extensions import db
from app.models.milestone import Milestone


class MilestoneService:

    @staticmethod
    def create_milestone(data):
        milestone = Milestone(
            project_id=data.get("project_id"),
            title=data.get("title"),
            description=data.get("description"),
            due_date=data.get("due_date"),
            status=data.get("status", "Pending"),
            completion_percentage=data.get(
                "completion_percentage",
                0
            )
        )

        db.session.add(milestone)
        db.session.commit()

        return milestone

    @staticmethod
    def get_project_milestones(project_id):
        return Milestone.query.filter_by(
            project_id=project_id
        ).all()

    @staticmethod
    def get_milestone(milestone_id):
        return Milestone.query.get(milestone_id)

    @staticmethod
    def update_milestone(milestone, data):
        milestone.title = data.get(
            "title",
            milestone.title
        )
        milestone.description = data.get(
            "description",
            milestone.description
        )
        milestone.due_date = data.get(
            "due_date",
            milestone.due_date
        )
        milestone.status = data.get(
            "status",
            milestone.status
        )
        milestone.completion_percentage = data.get(
            "completion_percentage",
            milestone.completion_percentage
        )

        db.session.commit()

        return milestone

    @staticmethod
    def delete_milestone(milestone):
        db.session.delete(milestone)
        db.session.commit()
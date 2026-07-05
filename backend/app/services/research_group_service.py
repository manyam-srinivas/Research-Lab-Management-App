from app.extensions import db
from app.models.research_group import ResearchGroup


class ResearchGroupService:

    @staticmethod
    def create_group(data, current_user_id):
        group = ResearchGroup(
            name=data.get("name"),
            description=data.get("description"),
            department_id=data.get("department_id"),
            created_by=current_user_id
        )

        db.session.add(group)
        db.session.commit()

        return group

    @staticmethod
    def get_all_groups():
        return ResearchGroup.query.all()

    @staticmethod
    def get_group(group_id):
        return ResearchGroup.query.get(group_id)

    @staticmethod
    def update_group(group, data):
        group.name = data.get("name", group.name)
        group.description = data.get(
            "description",
            group.description
        )
        group.department_id = data.get(
            "department_id",
            group.department_id
        )

        db.session.commit()

        return group

    @staticmethod
    def delete_group(group):
        db.session.delete(group)
        db.session.commit()
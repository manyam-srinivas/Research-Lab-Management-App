from app.extensions import db
from app.models.project_member import ProjectMember


class ProjectMemberService:

    @staticmethod
    def add_member(data):
        member = ProjectMember(
            project_id=data.get("project_id"),
            user_id=data.get("user_id"),
            member_type=data.get("member_type")
        )

        db.session.add(member)
        db.session.commit()

        return member

    @staticmethod
    def get_project_members(project_id):
        return ProjectMember.query.filter_by(
            project_id=project_id
        ).all()

    @staticmethod
    def get_member(member_id):
        return ProjectMember.query.get(member_id)

    @staticmethod
    def update_member(member, data):
        member.member_type = data.get(
            "member_type",
            member.member_type
        )

        db.session.commit()

        return member

    @staticmethod
    def remove_member(member):
        db.session.delete(member)
        db.session.commit()
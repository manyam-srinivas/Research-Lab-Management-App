from app.extensions import db


class ProjectMember(db.Model):
    __tablename__ = "project_members"

    id = db.Column(db.Integer, primary_key=True)

    project_id = db.Column(
        db.Integer,
        db.ForeignKey("projects.id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    member_type = db.Column(
        db.Enum(
            "Student",
            "Research Scholar",
            "Lab Staff"
        ),
        nullable=False
    )

    joined_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
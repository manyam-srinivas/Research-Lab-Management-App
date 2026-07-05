from app.extensions import db


class Milestone(db.Model):
    __tablename__ = "milestones"

    id = db.Column(db.Integer, primary_key=True)

    project_id = db.Column(
        db.Integer,
        db.ForeignKey("projects.id"),
        nullable=False
    )

    title = db.Column(db.String(255), nullable=False)

    description = db.Column(db.Text)

    due_date = db.Column(db.Date)

    status = db.Column(
        db.Enum(
            "Pending",
            "In Progress",
            "Completed"
        ),
        default="Pending"
    )

    completion_percentage = db.Column(
        db.Integer,
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
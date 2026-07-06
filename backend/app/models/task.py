from app.extensions import db


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)

    milestone_id = db.Column(
        db.Integer,
        db.ForeignKey("milestones.id"),
        nullable=False
    )

    assigned_to = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    title = db.Column(db.String(255), nullable=False)

    description = db.Column(db.Text)

    priority = db.Column(
        db.Enum("Low", "Medium", "High", "Critical"),
        default="Medium"
    )

    status = db.Column(
        db.Enum(
            "Pending",
            "In Progress",
            "Completed",
            "Blocked"
        ),
        default="Pending"
    )

    due_date = db.Column(db.Date)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
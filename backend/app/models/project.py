from app.extensions import db


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)

    research_group_id = db.Column(
        db.Integer,
        db.ForeignKey("research_groups.id"),
        nullable=True
    )

    title = db.Column(db.String(255), nullable=False)

    description = db.Column(db.Text)

    priority = db.Column(
        db.Enum(
            "Low",
            "Medium",
            "High",
            "Critical"
        ),
        default="Medium"
    )

    visibility = db.Column(
        db.Enum(
            "Private",
            "Department Only",
            "Public"
        ),
        default="Private"
    )

    status = db.Column(
        db.Enum(
            "Draft",
            "Active",
            "On Hold",
            "Completed",
            "Archived"
        ),
        default="Draft"
    )

    start_date = db.Column(db.Date)

    end_date = db.Column(db.Date)

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    is_deleted = db.Column(
        db.Boolean,
        default=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )
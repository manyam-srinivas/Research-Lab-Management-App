from app.extensions import db


class ResearchGroup(db.Model):
    __tablename__ = "research_groups"

    id = db.Column(db.Integer, primary_key=True)

    department_id = db.Column(
        db.Integer,
        db.ForeignKey("departments.id")
    )

    group_name = db.Column(db.String(255))

    description = db.Column(db.Text)

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id")
    )
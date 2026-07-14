from app.extensions import db


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id")
    )

    action = db.Column(
        db.String(255)
    )

    entity_type = db.Column(
        db.String(100)
    )

    entity_id = db.Column(
        db.Integer
    )

    ip_address = db.Column(
        db.String(50)
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
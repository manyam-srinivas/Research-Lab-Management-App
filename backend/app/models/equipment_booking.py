from app.extensions import db


class EquipmentBooking(db.Model):
    __tablename__ = "equipment_bookings"

    id = db.Column(db.Integer, primary_key=True)

    equipment_id = db.Column(
        db.Integer,
        db.ForeignKey("equipment.id"),
        nullable=False
    )

    requested_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    approved_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    start_time = db.Column(db.DateTime)

    end_time = db.Column(db.DateTime)

    purpose = db.Column(db.Text)

    status = db.Column(
        db.Enum(
            "Pending",
            "Approved",
            "Rejected",
            "Completed"
        ),
        default="Pending"
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
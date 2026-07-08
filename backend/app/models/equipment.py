from app.extensions import db


class Equipment(db.Model):
    __tablename__ = "equipment"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(255),
        nullable=False
    )

    description = db.Column(db.Text)

    category = db.Column(db.String(100))

    serial_number = db.Column(
        db.String(100),
        unique=True
    )

    purchase_date = db.Column(db.Date)

    location = db.Column(db.String(255))

    status = db.Column(
        db.Enum(
            "Available",
            "Booked",
            "Under Maintenance",
            "Retired"
        ),
        default="Available"
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
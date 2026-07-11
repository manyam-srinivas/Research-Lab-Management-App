from app.extensions import db


class Vendor(db.Model):
    __tablename__ = "vendors"

    id = db.Column(db.Integer, primary_key=True)

    vendor_name = db.Column(
        db.String(255),
        nullable=False
    )

    contact_person = db.Column(
        db.String(255)
    )

    phone = db.Column(
        db.String(20)
    )

    email = db.Column(
        db.String(100)
    )

    address = db.Column(
        db.Text
    )

    rating = db.Column(
        db.Numeric(2, 1)
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
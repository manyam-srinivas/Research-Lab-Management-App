from app.extensions import db


class ProcurementRequest(db.Model):
    __tablename__ = "procurement_requests"

    id = db.Column(db.Integer, primary_key=True)

    requested_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    vendor_id = db.Column(
        db.Integer,
        db.ForeignKey("vendors.id"),
        nullable=True
    )

    item_name = db.Column(
        db.String(255),
        nullable=False
    )

    quantity = db.Column(db.Integer)

    estimated_cost = db.Column(
        db.Numeric(12, 2)
    )

    justification = db.Column(db.Text)

    approved_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    status = db.Column(
        db.Enum(
            "Pending",
            "Approved",
            "Rejected",
            "Purchased"
        ),
        default="Pending"
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
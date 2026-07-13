from app.extensions import db


class Budget(db.Model):
    __tablename__ = "budgets"

    id = db.Column(db.Integer, primary_key=True)

    department_id = db.Column(
        db.Integer,
        db.ForeignKey("departments.id"),
        nullable=False
    )

    financial_year = db.Column(db.String(20))

    allocated_amount = db.Column(
        db.Numeric(12, 2),
        default=0
    )

    spent_amount = db.Column(
        db.Numeric(12, 2),
        default=0
    )

    remaining_amount = db.Column(
        db.Numeric(12, 2),
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
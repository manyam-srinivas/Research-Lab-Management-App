from app.extensions import db


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)

    budget_id = db.Column(
        db.Integer,
        db.ForeignKey("budgets.id"),
        nullable=False
    )

    procurement_request_id = db.Column(
        db.Integer,
        db.ForeignKey("procurement_requests.id"),
        nullable=True
    )

    amount = db.Column(
        db.Numeric(12, 2)
    )

    expense_type = db.Column(
        db.Enum(
            "Recurring",
            "Non-Recurring"
        )
    )

    description = db.Column(
        db.Text
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
from app.extensions import db


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)

    project_id = db.Column(
        db.Integer,
        db.ForeignKey("projects.id"),
        nullable=False
    )

    uploaded_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    file_name = db.Column(
        db.String(255),
        nullable=False
    )

    file_path = db.Column(
        db.String(500),
        nullable=False
    )

    file_type = db.Column(db.String(50))

    file_size = db.Column(db.BigInteger)

    version = db.Column(
        db.String(20),
        default="1.0"
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
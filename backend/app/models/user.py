from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(100), unique=True, nullable=False)

    password_hash = db.Column(db.String(255), nullable=False)

    role = db.Column(
        db.Enum(
            "Admin",
            "Faculty",
            "Research Scholar",
            "Student",
            "Lab Staff",
            name="role_enum"
        ),
        nullable=False
    )

    department_id = db.Column(
        db.Integer,
        db.ForeignKey("departments.id")
    )

    student_employee_id = db.Column(db.String(50))

    designation = db.Column(db.String(100))

    research_interests = db.Column(db.Text)

    phone = db.Column(db.String(20))

    profile_image = db.Column(db.String(255))

    status = db.Column(
        db.Enum(
            "Active",
            "Inactive",
            "Pending",
            name="status_enum"
        ),
        default="Pending"
    )

    email_verified = db.Column(
        db.Boolean,
        default=False
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
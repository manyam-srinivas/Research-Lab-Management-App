from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, bcrypt

# Import models
from app.models.user import User
from app.models.departments import Department
from app.models.research_group import ResearchGroup
from app.models.project import Project
from app.routes.research_group import research_group_bp
from app.models.project_member import ProjectMember
from app.routes.project_member import project_member_bp
from app.models.milestone import Milestone
from app.routes.milestone import milestone_bp
from app.models.task import Task
from app.routes.task import task_bp
from app.models.document import Document
from app.routes.document import document_bp
from app.models.equipment import Equipment
from app.routes.equipment import equipment_bp
from app.models.equipment_booking import EquipmentBooking
from app.routes.equipment_booking import equipment_booking_bp
from app.models.vendor import Vendor
from app.routes.vendor import vendor_bp
from app.models.procurement_request import ProcurementRequest
from app.routes.procurement import procurement_bp
from app.models.budget import Budget
from app.routes.budget import budget_bp
from app.models.expense import Expense
from app.routes.expense import expense_bp

# Import blueprints
from app.routes.auth import auth_bp
from app.routes.project import project_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    CORS(app)

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth"
    )

    app.register_blueprint(
        project_bp,
        url_prefix="/api/projects"
    )

    app.register_blueprint(
    research_group_bp,
    url_prefix="/api/research-groups"
    )

    app.register_blueprint(
    project_member_bp,
    url_prefix="/api/project-members"
    )

    app.register_blueprint(
    milestone_bp,
    url_prefix="/api/milestones"
    )
    app.register_blueprint(
    task_bp,
    url_prefix="/api/tasks"
    )
    app.register_blueprint(
    document_bp,
    url_prefix="/api/documents"
    )
    app.register_blueprint(
    equipment_bp,
    url_prefix="/api/equipment"
    )
    app.register_blueprint(
    equipment_booking_bp,
    url_prefix="/api/equipment-bookings"
    )
    app.register_blueprint(
    vendor_bp,
    url_prefix="/api/vendors"
    )
    app.register_blueprint(
    procurement_bp,
    url_prefix="/api/procurement"
    )
    app.register_blueprint(
    budget_bp,
    url_prefix="/api/budgets"
    )
    app.register_blueprint(
    expense_bp,
    url_prefix="/api/expenses"
   )

    @app.route("/")
    def home():
        return {
            "status": "success",
            "message": "Research Lab Management Backend Running"
        }

    @app.route("/test-db")
    def test_db():
        try:
            db.session.execute(db.text("SELECT 1"))
            return {
                "status": "success",
                "message": "Database connected successfully"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }

    return app

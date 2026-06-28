from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, bcrypt
from app.models.project import Project
from app.routes.project import project_bp

def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    CORS(app)

    # Import models
    from app.models.user import User
    from app.models.departments import Department

    # Import Blueprints
    from app.routes.auth import auth_bp

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth"
    )
    app.register_blueprint(
    project_bp,
    url_prefix="/api/projects"
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
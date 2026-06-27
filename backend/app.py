from flask import Flask
from flask_cors import CORS

from config import Config
from extensions import db, jwt, bcrypt

from models.user import User
from models.departments import Department

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)
jwt.init_app(app)
bcrypt.init_app(app)

CORS(app)

# Import routes AFTER app creation
from routes.auth import auth_bp

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
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
    
print(app.url_map)

if __name__ == "__main__":
    app.run(debug=True)

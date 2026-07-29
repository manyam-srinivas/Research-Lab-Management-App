from functools import wraps

from flask_jwt_extended import get_jwt_identity
from app.models.user import User

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)

def admin_required(fn):

    @wraps(fn)
    def wrapper(*args, **kwargs):

        user = get_current_user()

        if not user or user.role != "Admin":
            return {
                "status": "error",
                "message": "Admin access required"
            }, 403

        return fn(*args, **kwargs)

    return wrapper
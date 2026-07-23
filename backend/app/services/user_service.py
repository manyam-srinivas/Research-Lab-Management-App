from app.models.user import User


class UserService:

    @staticmethod
    def get_all_users():
        return User.query.filter_by(
            is_deleted=False
        ).all()

    @staticmethod
    def get_user(user_id):
        return User.query.get(user_id)
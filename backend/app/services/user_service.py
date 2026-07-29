from datetime import datetime

from app.extensions import db
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
    @staticmethod
    def get_pending_users():
     return User.query.filter_by(
        status="Pending",
        is_deleted=False
    ).all()
    @staticmethod
    def approve_user(user, role, approved_by):

     user.role = role
     user.status = "Active"
     user.approved_by = approved_by
     user.approved_at = datetime.utcnow()

     db.session.commit()

     return user
    @staticmethod
    def reject_user(user, approved_by):

     user.status = "Rejected"
     user.approved_by = approved_by
     user.approved_at = datetime.utcnow()

     db.session.commit()

     return user 

    @staticmethod
    def change_role(user, role):

     user.role = role

     db.session.commit()

     return user   

    @staticmethod
    def activate_user(user):

     user.status = "Active"
     db.session.commit()

     return user


    @staticmethod
    def deactivate_user(user):

     user.status = "Inactive"

     db.session.commit()

     return user
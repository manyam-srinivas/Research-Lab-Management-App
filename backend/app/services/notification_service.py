from app.extensions import db
from app.models.notification import Notification


class NotificationService:

    @staticmethod
    def create_notification(data):

        notification = Notification(
            user_id=data.get("user_id"),
            title=data.get("title"),
            message=data.get("message"),
            type=data.get("type"),
            is_read=False
        )

        db.session.add(notification)
        db.session.commit()

        return notification

    @staticmethod
    def get_user_notifications(user_id):

        return Notification.query.filter_by(
            user_id=user_id
        ).all()

    @staticmethod
    def get_notification(notification_id):

        return Notification.query.get(notification_id)

    @staticmethod
    def mark_as_read(notification):

        notification.is_read = True

        db.session.commit()

        return notification

    @staticmethod
    def delete_notification(notification):

        db.session.delete(notification)
        db.session.commit()
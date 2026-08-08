from app.extensions import db
from app.models.notification import Notification


class NotificationService:

    @staticmethod
    def notify(user_id, title, message, type="System"):
        """Convenience helper to create a notification for a user."""
        return NotificationService.create_notification({
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": type
        })

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

        return (
            Notification.query.filter_by(user_id=user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )

    @staticmethod
    def get_unread_count(user_id):

        return Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).count()

    @staticmethod
    def mark_all_read(user_id):

        Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).update({"is_read": True})

        db.session.commit()

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
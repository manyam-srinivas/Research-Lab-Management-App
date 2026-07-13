from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.services.notification_service import NotificationService


notification_bp = Blueprint(
    "notifications",
    __name__
)


def notification_to_dict(notification):

    return {
        "id": notification.id,
        "user_id": notification.user_id,
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "is_read": notification.is_read,
        "created_at": str(notification.created_at)
        if notification.created_at else None
    }


@notification_bp.route("/", methods=["POST"])
@jwt_required()
def create_notification():

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can create notifications."
        }, 403

    data = request.get_json()

    notification = NotificationService.create_notification(data)

    return {
        "status": "success",
        "notification_id": notification.id
    }, 201


@notification_bp.route("/", methods=["GET"])
@jwt_required()
def get_my_notifications():

    current_user_id = int(get_jwt_identity())

    notifications = NotificationService.get_user_notifications(
        current_user_id
    )

    return {
        "status": "success",
        "count": len(notifications),
        "notifications": [
            notification_to_dict(n)
            for n in notifications
        ]
    }, 200


@notification_bp.route(
    "/<int:notification_id>/read",
    methods=["PUT"]
)
@jwt_required()
def mark_as_read(notification_id):

    current_user_id = int(get_jwt_identity())

    notification = NotificationService.get_notification(
        notification_id
    )

    if not notification:
        return {
            "status": "error",
            "message": "Notification not found"
        }, 404

    if notification.user_id != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    NotificationService.mark_as_read(notification)

    return {
        "status": "success",
        "message": "Notification marked as read"
    }, 200


@notification_bp.route(
    "/<int:notification_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_notification(notification_id):

    current_user_id = int(get_jwt_identity())

    notification = NotificationService.get_notification(
        notification_id
    )

    if not notification:
        return {
            "status": "error",
            "message": "Notification not found"
        }, 404

    if notification.user_id != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    NotificationService.delete_notification(
        notification
    )

    return {
        "status": "success",
        "message": "Notification deleted successfully"
    }, 200
from app.extensions import db
from app.models.activity_log import ActivityLog


class ActivityLogService:

    @staticmethod
    def create_log(data):

        log = ActivityLog(
            user_id=data.get("user_id"),
            action=data.get("action"),
            entity_type=data.get("entity_type"),
            entity_id=data.get("entity_id"),
            ip_address=data.get("ip_address")
        )

        db.session.add(log)
        db.session.commit()

        return log

    @staticmethod
    def get_all_logs():
        return ActivityLog.query.all()

    @staticmethod
    def get_log(log_id):
        return ActivityLog.query.get(log_id)

    @staticmethod
    def delete_log(log):

        db.session.delete(log)
        db.session.commit()
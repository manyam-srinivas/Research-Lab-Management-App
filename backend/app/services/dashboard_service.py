from app.models.project import Project

class DashboardService:

    @staticmethod
    def get_summary():

        print("TOTAL:", Project.query.count())
        print("ACTIVE:", Project.query.filter_by(is_deleted=False).count())

        return {
            "total_projects":
    Project.query.count(),

"active_projects":
    Project.query.filter_by(
        status="Active"
    ).count(),

            "total_research_groups":
                ResearchGroup.query.count(),

            "total_documents":
                Document.query.count(),

            "total_tasks":
                Task.query.count(),

            "completed_tasks":
                Task.query.filter_by(
                    status="Completed"
                ).count(),

            "total_equipment":
                Equipment.query.count(),

            "available_equipment":
                Equipment.query.filter_by(
                    status="Available"
                ).count(),

            "pending_procurements":
                ProcurementRequest.query.filter_by(
                    status="Pending"
                ).count(),

            "unread_notifications":
                Notification.query.filter_by(
                    is_read=False
                ).count()
        }
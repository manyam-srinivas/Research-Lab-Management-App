from app.models.project import Project
from app.models.research_group import ResearchGroup
from app.models.document import Document
from app.models.task import Task
from app.models.equipment import Equipment
from app.models.procurement_request import ProcurementRequest
from app.models.notification import Notification
from app.models.budget import Budget
from app.models.expense import Expense

class DashboardService:

    @staticmethod
    def get_summary():

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
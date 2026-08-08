from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.dashboard_service import DashboardService

dashboard_bp = Blueprint(
    "dashboard",
    __name__
)

@dashboard_bp.route("/", methods=["GET"])
@jwt_required()
def dashboard():

    from app.models.budget import Budget
    from app.models.expense import Expense
    from app.models.equipment import Equipment
    from app.models.task import Task

    budgets = Budget.query.all()
    expenses = Expense.query.all()

    total_budget = sum(
        float(b.allocated_amount)
        for b in budgets
    )

    total_spent = sum(
        float(b.spent_amount)
        for b in budgets
    )

    total_remaining = sum(
        float(b.remaining_amount)
        for b in budgets
    )

    return {
        "status": "success",

        "summary": DashboardService.get_summary(),

        "finance": {
            "total_budget": total_budget,
            "total_spent": total_spent,
            "remaining_budget": total_remaining,
            "total_expenses": len(expenses)
        },

        "equipment": {
            "total": Equipment.query.count(),
            "available":
                Equipment.query.filter_by(
                    status="Available"
                ).count(),
            "booked":
                Equipment.query.filter_by(
                    status="Booked"
                ).count(),
            "maintenance":
                Equipment.query.filter_by(
                    status="Under Maintenance"
                ).count()
        },

        "tasks": {
            "total": Task.query.count(),
            "completed":
                Task.query.filter_by(
                    status="Completed"
                ).count(),
            "pending":
                Task.query.filter_by(
                    status="Pending"
                ).count(),
            "in_progress":
                Task.query.filter_by(
                    status="In Progress"
                ).count()
        }
    }, 200

@dashboard_bp.route("/recent", methods=["GET"])
@jwt_required()
def recent_activity():
    """A mixed feed of the latest projects, tasks, milestones, bookings
    and the current user's notifications. Admin-only: the activity feed
    is not shown to other roles."""
    from app.models.project import Project
    from app.models.task import Task
    from app.models.milestone import Milestone
    from app.models.equipment_booking import EquipmentBooking
    from app.models.notification import Notification
    from app.models.user import User

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if user is None or user.role != "Admin":
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    projects = Project.query.filter_by(
        is_deleted=False
    ).order_by(Project.created_at.desc()).limit(5).all()
    tasks = Task.query.order_by(
        Task.created_at.desc()
    ).limit(5).all()
    milestones = Milestone.query.order_by(
        Milestone.created_at.desc()
    ).limit(5).all()
    bookings = EquipmentBooking.query.order_by(
        EquipmentBooking.created_at.desc()
    ).limit(5).all()
    notifications = Notification.query.filter_by(
        user_id=current_user_id
    ).order_by(Notification.created_at.desc()).limit(3).all()

    items = []

    for p in projects:
        items.append({
            "id": p.id,
            "type": "Project",
            "title": p.title,
            "subtitle": None,
            "status": p.status,
            "created_at": str(p.created_at)
            if p.created_at else None,
            "link": "/projects"
        })

    for t in tasks:
        items.append({
            "id": t.id,
            "type": "Task",
            "title": t.title,
            "subtitle": None,
            "status": t.status,
            "created_at": str(t.created_at)
            if t.created_at else None,
            "link": "/Tasks"
        })

    for m in milestones:
        items.append({
            "id": m.id,
            "type": "Milestone",
            "title": m.title,
            "subtitle": None,
            "status": m.status,
            "created_at": str(m.created_at)
            if m.created_at else None,
            "link": "/Milestones"
        })

    for b in bookings:
        items.append({
            "id": b.id,
            "type": "Equipment Booking",
            "title": f"Booking #{b.id}",
            "subtitle": b.purpose,
            "status": b.status,
            "created_at": str(b.created_at)
            if b.created_at else None,
            "link": "/equipment-bookings"
        })

    for n in notifications:
        items.append({
            "id": n.id,
            "type": "Notification",
            "title": n.title,
            "subtitle": n.message,
            "status": None,
            "created_at": str(n.created_at)
            if n.created_at else None,
            "link": "/notifications"
        })

    items.sort(
        key=lambda x: x["created_at"] or "",
        reverse=True
    )

    unread = Notification.query.filter_by(
        user_id=current_user_id,
        is_read=False
    ).count()

    return {
        "status": "success",
        "unread_notifications": unread,
        "items": items[:10]
    }, 200


@dashboard_bp.route("/summary", methods=["GET"])
@jwt_required()
def dashboard_summary():

    return {
        "status": "success",
        "summary": DashboardService.get_summary()
    }, 200


@dashboard_bp.route("/finance", methods=["GET"])
@jwt_required()
def finance_dashboard():

    from app.models.budget import Budget
    from app.models.expense import Expense

    budgets = Budget.query.all()
    expenses = Expense.query.all()

    total_budget = sum(
        float(b.allocated_amount)
        for b in budgets
    )

    total_spent = sum(
        float(b.spent_amount)
        for b in budgets
    )

    total_remaining = sum(
        float(b.remaining_amount)
        for b in budgets
    )

    return {
        "status": "success",
        "finance": {
            "total_budget": total_budget,
            "total_spent": total_spent,
            "remaining_budget": total_remaining,
            "total_expenses": len(expenses)
        }
    }, 200


@dashboard_bp.route("/equipment", methods=["GET"])
@jwt_required()
def equipment_dashboard():

    from app.models.equipment import Equipment

    return {
        "status": "success",
        "equipment": {
            "total": Equipment.query.count(),
            "available":
                Equipment.query.filter_by(
                    status="Available"
                ).count(),
            "booked":
                Equipment.query.filter_by(
                    status="Booked"
                ).count(),
            "maintenance":
                Equipment.query.filter_by(
                    status="Under Maintenance"
                ).count()
        }
    }, 200


@dashboard_bp.route("/tasks", methods=["GET"])
@jwt_required()
def task_dashboard():

    from app.models.task import Task

    return {
        "status": "success",
        "tasks": {
            "total": Task.query.count(),
            "completed":
                Task.query.filter_by(
                    status="Completed"
                ).count(),
            "pending":
                Task.query.filter_by(
                    status="Pending"
                ).count(),
            "in_progress":
                Task.query.filter_by(
                    status="In Progress"
                ).count()
        }
    }, 200
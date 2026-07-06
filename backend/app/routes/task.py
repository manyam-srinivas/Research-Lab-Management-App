from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.project import Project
from app.models.milestone import Milestone
from app.services.task_service import TaskService


task_bp = Blueprint("tasks", __name__)


def get_task_project(milestone_id):
    milestone = Milestone.query.get(milestone_id)

    if not milestone:
        return None

    return Project.query.filter_by(
        id=milestone.project_id,
        is_deleted=False
    ).first()


@task_bp.route("/", methods=["POST"])
@jwt_required()
def create_task():

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    data = request.get_json()

    if not data.get("milestone_id") or not data.get("title"):
        return {
            "status": "error",
            "message": "milestone_id and title are required"
        }, 400

    project = get_task_project(data.get("milestone_id"))

    if not project:
        return {
            "status": "error",
            "message": "Milestone or project not found"
        }, 404

    if user.role != "Admin" and project.created_by != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    task = TaskService.create_task(data)

    return {
        "status": "success",
        "message": "Task created successfully",
        "task_id": task.id
    }, 201


@task_bp.route("/milestone/<int:milestone_id>", methods=["GET"])
@jwt_required()
def get_milestone_tasks(milestone_id):

    tasks = TaskService.get_milestone_tasks(milestone_id)

    return {
        "status": "success",
        "count": len(tasks),
        "tasks": [
            {
                "id": task.id,
                "milestone_id": task.milestone_id,
                "assigned_to": task.assigned_to,
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "due_date": str(task.due_date)
                if task.due_date else None
            }
            for task in tasks
        ]
    }, 200


@task_bp.route("/<int:task_id>", methods=["GET"])
@jwt_required()
def get_task(task_id):

    task = TaskService.get_task(task_id)

    if not task:
        return {
            "status": "error",
            "message": "Task not found"
        }, 404

    return {
        "status": "success",
        "task": {
            "id": task.id,
            "milestone_id": task.milestone_id,
            "assigned_to": task.assigned_to,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "status": task.status,
            "due_date": str(task.due_date)
            if task.due_date else None
        }
    }, 200


@task_bp.route("/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    task = TaskService.get_task(task_id)

    if not task:
        return {
            "status": "error",
            "message": "Task not found"
        }, 404

    project = get_task_project(task.milestone_id)

    if not project:
        return {
            "status": "error",
            "message": "Project not found"
        }, 404

    if (
        user.role != "Admin"
        and project.created_by != current_user_id
        and task.assigned_to != current_user_id
    ):
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    task = TaskService.update_task(
        task,
        request.get_json()
    )

    return {
        "status": "success",
        "message": "Task updated successfully",
        "task_id": task.id
    }, 200


@task_bp.route("/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    task = TaskService.get_task(task_id)

    if not task:
        return {
            "status": "error",
            "message": "Task not found"
        }, 404

    project = get_task_project(task.milestone_id)

    if not project:
        return {
            "status": "error",
            "message": "Project not found"
        }, 404

    if user.role != "Admin" and project.created_by != current_user_id:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    TaskService.delete_task(task)

    return {
        "status": "success",
        "message": "Task deleted successfully"
    }, 200
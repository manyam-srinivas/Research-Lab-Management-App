from app.extensions import db
from app.models.task import Task


class TaskService:

    @staticmethod
    def create_task(data):
        task = Task(
            milestone_id=data.get("milestone_id"),
            assigned_to=data.get("assigned_to"),
            title=data.get("title"),
            description=data.get("description"),
            priority=data.get("priority", "Medium"),
            status=data.get("status", "Pending"),
            due_date=data.get("due_date")
        )

        db.session.add(task)
        db.session.commit()

        return task

    @staticmethod
    def get_milestone_tasks(milestone_id):
        return Task.query.filter_by(
            milestone_id=milestone_id
        ).all()

    @staticmethod
    def get_task(task_id):
        return Task.query.get(task_id)

    @staticmethod
    def update_task(task, data):
        task.assigned_to = data.get(
            "assigned_to",
            task.assigned_to
        )
        task.title = data.get("title", task.title)
        task.description = data.get(
            "description",
            task.description
        )
        task.priority = data.get("priority", task.priority)
        task.status = data.get("status", task.status)
        task.due_date = data.get("due_date", task.due_date)

        db.session.commit()

        return task

    @staticmethod
    def delete_task(task):
        db.session.delete(task)
        db.session.commit()
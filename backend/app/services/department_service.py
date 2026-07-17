from app.extensions import db
from app.models.departments import Department


class DepartmentService:

    @staticmethod
    def create_department(data):
        department = Department(
            name=data.get("name"),
            description=data.get("description")
        )

        db.session.add(department)
        db.session.commit()

        return department

    @staticmethod
    def get_all_departments():
        return Department.query.all()

    @staticmethod
    def get_department(department_id):
        return Department.query.get(department_id)

    @staticmethod
    def update_department(department, data):
        department.name = data.get("name", department.name)
        department.description = data.get(
            "description",
            department.description
        )

        db.session.commit()

        return department

    @staticmethod
    def delete_department(department):
        db.session.delete(department)
        db.session.commit()
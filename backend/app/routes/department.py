from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from app.services.department_service import DepartmentService

department_bp = Blueprint(
    "departments",
    __name__
)


@department_bp.route("/", methods=["GET"])
@jwt_required()
def get_departments():

    departments = DepartmentService.get_all_departments()

    return {
        "status": "success",
        "count": len(departments),
        "departments": [
            {
                "id": department.id,
                "name": department.name,
                "description": department.description
            }
            for department in departments
        ]
    }, 200


@department_bp.route("/", methods=["POST"])
@jwt_required()
def create_department():

    data = request.get_json()

    if not data.get("name"):
        return {
            "status": "error",
            "message": "Department name is required"
        }, 400

    department = DepartmentService.create_department(data)

    return {
        "status": "success",
        "message": "Department created successfully",
        "department_id": department.id
    }, 201


@department_bp.route("/<int:department_id>", methods=["PUT"])
@jwt_required()
def update_department(department_id):

    department = DepartmentService.get_department(department_id)

    if not department:
        return {
            "status": "error",
            "message": "Department not found"
        }, 404

    DepartmentService.update_department(
        department,
        request.get_json()
    )

    return {
        "status": "success",
        "message": "Department updated successfully"
    }, 200


@department_bp.route("/<int:department_id>", methods=["DELETE"])
@jwt_required()
def delete_department(department_id):

    department = DepartmentService.get_department(department_id)

    if not department:
        return {
            "status": "error",
            "message": "Department not found"
        }, 404

    DepartmentService.delete_department(department)

    return {
        "status": "success",
        "message": "Department deleted successfully"
    }, 200
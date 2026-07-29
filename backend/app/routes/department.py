from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.department_service import DepartmentService
from app.services.activity_log_service import ActivityLogService
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
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data.get("name"):
        return {
            "status": "error",
            "message": "Department name is required"
        }, 400

    department = DepartmentService.create_department(data)
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Created",
    entity_type="Department",
    entity_id=department.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Department created successfully",
        "department_id": department.id
    }, 201


@department_bp.route("/<int:department_id>", methods=["PUT"])
@jwt_required()
def update_department(department_id):

    current_user_id = int(get_jwt_identity())

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
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Updated",
    entity_type="Department",
    entity_id=department.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Department updated successfully"
    }, 200


@department_bp.route("/<int:department_id>", methods=["DELETE"])
@jwt_required()
def delete_department(department_id):

    current_user_id = int(get_jwt_identity())
    department = DepartmentService.get_department(department_id)

    if not department:
        return {
            "status": "error",
            "message": "Department not found"
        }, 404

    DepartmentService.delete_department(department)
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Deleted",
    entity_type="Department",
    entity_id=department.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Department deleted successfully"
    }, 200
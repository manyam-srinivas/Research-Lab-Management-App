import csv
import io

from flask import Blueprint, request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.services.equipment_service import EquipmentService
from app.services.activity_log_service import ActivityLogService

equipment_bp = Blueprint("equipment", __name__)


@equipment_bp.route("/export", methods=["GET"])
@jwt_required()
def export_equipment_csv():

    equipment_list = EquipmentService.get_all_equipment(
        search=request.args.get("search"),
        status=request.args.get("status")
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Name", "Category", "Serial Number",
        "Location", "Status", "Purchase Date"
    ])

    for e in equipment_list:
        writer.writerow([
            e.id, e.name, e.category or "",
            e.serial_number or "", e.location or "",
            e.status,
            str(e.purchase_date) if e.purchase_date else ""
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": (
                "attachment; filename=equipment.csv"
            )
        }
    )


@equipment_bp.route("/", methods=["POST"])
@jwt_required()
def create_equipment():

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user.role not in ["Admin", "Lab Staff"]:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    data = request.get_json()

    if not data.get("name"):
        return {
            "status": "error",
            "message": "Equipment name is required"
        }, 400

    equipment = EquipmentService.create_equipment(data)
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Created",
    entity_type="Equipment",
    entity_id=equipment.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Equipment created successfully",
        "equipment_id": equipment.id
    }, 201


@equipment_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_equipment():

    equipment_list = EquipmentService.get_all_equipment(
        search=request.args.get("search"),
        status=request.args.get("status")
    )

    return {
        "status": "success",
        "count": len(equipment_list),
        "equipment": [
            {
                "id": equipment.id,
                "name": equipment.name,
                "description": equipment.description,
                "category": equipment.category,
                "serial_number": equipment.serial_number,
                "purchase_date": str(equipment.purchase_date)
                if equipment.purchase_date else None,
                "location": equipment.location,
                "status": equipment.status
            }
            for equipment in equipment_list
        ]
    }, 200


@equipment_bp.route("/<int:equipment_id>", methods=["GET"])
@jwt_required()
def get_equipment(equipment_id):

    equipment = EquipmentService.get_equipment(equipment_id)

    if not equipment:
        return {
            "status": "error",
            "message": "Equipment not found"
        }, 404

    return {
        "status": "success",
        "equipment": {
            "id": equipment.id,
            "name": equipment.name,
            "description": equipment.description,
            "category": equipment.category,
            "serial_number": equipment.serial_number,
            "purchase_date": str(equipment.purchase_date)
            if equipment.purchase_date else None,
            "location": equipment.location,
            "status": equipment.status
        }
    }, 200


@equipment_bp.route("/<int:equipment_id>", methods=["PUT"])
@jwt_required()
def update_equipment(equipment_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user.role not in ["Admin", "Lab Staff"]:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    equipment = EquipmentService.get_equipment(equipment_id)

    if not equipment:
        return {
            "status": "error",
            "message": "Equipment not found"
        }, 404

    equipment = EquipmentService.update_equipment(
        equipment,
        request.get_json()
    )
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Updated",
    entity_type="Equipment",
    entity_id=equipment.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Equipment updated successfully",
        "equipment_id": equipment.id
    }, 200


@equipment_bp.route("/<int:equipment_id>", methods=["DELETE"])
@jwt_required()
def delete_equipment(equipment_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can delete equipment"
        }, 403

    equipment = EquipmentService.get_equipment(equipment_id)

    if not equipment:
        return {
            "status": "error",
            "message": "Equipment not found"
        }, 404

    EquipmentService.delete_equipment(equipment)
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Deleted",
    entity_type="Equipment",
    entity_id=equipment.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Equipment deleted successfully"
    }, 200
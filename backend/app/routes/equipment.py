from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.services.equipment_service import EquipmentService


equipment_bp = Blueprint("equipment", __name__)


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

    return {
        "status": "success",
        "message": "Equipment created successfully",
        "equipment_id": equipment.id
    }, 201


@equipment_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_equipment():

    equipment_list = EquipmentService.get_all_equipment()

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

    return {
        "status": "success",
        "message": "Equipment deleted successfully"
    }, 200
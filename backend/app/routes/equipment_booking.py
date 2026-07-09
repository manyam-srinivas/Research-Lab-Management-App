from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.equipment import Equipment
from app.services.equipment_booking_service import EquipmentBookingService


equipment_booking_bp = Blueprint(
    "equipment_bookings",
    __name__
)


def booking_to_dict(booking):
    return {
        "id": booking.id,
        "equipment_id": booking.equipment_id,
        "requested_by": booking.requested_by,
        "approved_by": booking.approved_by,
        "start_time": str(booking.start_time)
        if booking.start_time else None,
        "end_time": str(booking.end_time)
        if booking.end_time else None,
        "purpose": booking.purpose,
        "status": booking.status,
        "created_at": str(booking.created_at)
        if booking.created_at else None
    }


@equipment_booking_bp.route("/", methods=["POST"])
@jwt_required()
def create_booking():

    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    if not all([
        data.get("equipment_id"),
        data.get("start_time"),
        data.get("end_time")
    ]):
        return {
            "status": "error",
            "message": "equipment_id, start_time and end_time are required"
        }, 400

    equipment = Equipment.query.get(
        data.get("equipment_id")
    )

    if not equipment:
        return {
            "status": "error",
            "message": "Equipment not found"
        }, 404

    if equipment.status in [
        "Under Maintenance",
        "Retired"
    ]:
        return {
            "status": "error",
            "message": "Equipment is not available for booking"
        }, 400

    booking = EquipmentBookingService.create_booking(
        data,
        current_user_id
    )

    return {
        "status": "success",
        "message": "Equipment booking requested successfully",
        "booking_id": booking.id
    }, 201


@equipment_booking_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_bookings():

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user.role not in ["Admin", "Lab Staff"]:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    bookings = EquipmentBookingService.get_all_bookings()

    return {
        "status": "success",
        "count": len(bookings),
        "bookings": [
            booking_to_dict(booking)
            for booking in bookings
        ]
    }, 200


@equipment_booking_bp.route("/my", methods=["GET"])
@jwt_required()
def get_my_bookings():

    current_user_id = int(get_jwt_identity())

    bookings = EquipmentBookingService.get_user_bookings(
        current_user_id
    )

    return {
        "status": "success",
        "count": len(bookings),
        "bookings": [
            booking_to_dict(booking)
            for booking in bookings
        ]
    }, 200


@equipment_booking_bp.route(
    "/<int:booking_id>/status",
    methods=["PUT"]
)
@jwt_required()
def update_booking_status(booking_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user.role not in ["Admin", "Lab Staff"]:
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    booking = EquipmentBookingService.get_booking(
        booking_id
    )

    if not booking:
        return {
            "status": "error",
            "message": "Booking not found"
        }, 404

    data = request.get_json()
    new_status = data.get("status")

    allowed_statuses = [
        "Approved",
        "Rejected",
        "Completed"
    ]

    if new_status not in allowed_statuses:
        return {
            "status": "error",
            "message": "Invalid booking status"
        }, 400

    booking = EquipmentBookingService.update_status(
        booking,
        new_status,
        current_user_id
    )

    return {
        "status": "success",
        "message": "Booking status updated successfully",
        "booking": booking_to_dict(booking)
    }, 200


@equipment_booking_bp.route(
    "/<int:booking_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_booking(booking_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    booking = EquipmentBookingService.get_booking(
        booking_id
    )

    if not booking:
        return {
            "status": "error",
            "message": "Booking not found"
        }, 404

    if (
        user.role != "Admin"
        and booking.requested_by != current_user_id
    ):
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    EquipmentBookingService.delete_booking(booking)

    return {
        "status": "success",
        "message": "Booking deleted successfully"
    }, 200
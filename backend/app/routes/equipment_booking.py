from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.equipment import Equipment
from app.services.equipment_booking_service import EquipmentBookingService
from app.services.activity_log_service import ActivityLogService
from app.services.notification_service import NotificationService

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

    # --- Time conflict detection ---
    # The frontend sends datetime-local strings like "2026-08-02T10:00".
    # Normalize them so we can compare against existing bookings.
    try:
        start = datetime.fromisoformat(
            data.get("start_time").replace("Z", "+00:00")
        )
        end = datetime.fromisoformat(
            data.get("end_time").replace("Z", "+00:00")
        )
    except (TypeError, ValueError):
        return {
            "status": "error",
            "message": "Invalid start_time or end_time format"
        }, 400

    # Stored bookings are naive datetimes; strip tzinfo to compare safely.
    if start.tzinfo is not None:
        start = start.replace(tzinfo=None)
    if end.tzinfo is not None:
        end = end.replace(tzinfo=None)

    if end <= start:
        return {
            "status": "error",
            "message": "End time must be after start time"
        }, 400

    conflict = EquipmentBookingService.find_conflict(
        equipment_id=data.get("equipment_id"),
        start=start,
        end=end
    )

    if conflict:
        return {
            "status": "error",
            "message": (
                "This equipment is already booked for the requested "
                "time slot."
            )
        }, 409

    booking = EquipmentBookingService.create_booking(
        data,
        current_user_id
    )
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Created",
    entity_type="Equipment Booking",
    entity_id=booking.id,
    ip_address=request.remote_addr
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
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action=f"Status Changed to {new_status}",
    entity_type="Equipment Booking",
    entity_id=booking.id,
    ip_address=request.remote_addr
)

    # Notify the requester about the booking decision.
    NotificationService.notify(
        user_id=booking.requested_by,
        title="Equipment Booking Updated",
        message=(
            f"Your booking request was {new_status.lower()} by "
            f"{user.full_name}."
        ),
        type="Equipment Booking"
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
    ActivityLogService.log_activity(
    user_id=current_user_id,
    action="Deleted",
    entity_type="Equipment Booking",
    entity_id=booking.id,
    ip_address=request.remote_addr
)

    return {
        "status": "success",
        "message": "Booking deleted successfully"
    }, 200
from app.extensions import db
from app.models.equipment_booking import EquipmentBooking
from app.models.equipment import Equipment


class EquipmentBookingService:

    @staticmethod
    def find_conflict(equipment_id, start, end):
        """Return a conflicting active booking for the same equipment.

        Two bookings overlap when:
            existing.start < requested.end AND existing.end > requested.start
        Only Pending and Approved bookings are considered, since Rejected
        and Completed bookings do not occupy the equipment.
        """
        active = EquipmentBooking.query.filter(
            EquipmentBooking.equipment_id == equipment_id,
            EquipmentBooking.status.in_(["Pending", "Approved"]),
            EquipmentBooking.start_time < end,
            EquipmentBooking.end_time > start,
        ).first()

        return active

    @staticmethod
    def create_booking(data, current_user_id):
        booking = EquipmentBooking(
            equipment_id=data.get("equipment_id"),
            requested_by=current_user_id,
            start_time=data.get("start_time"),
            end_time=data.get("end_time"),
            purpose=data.get("purpose"),
            status="Pending"
        )

        db.session.add(booking)
        db.session.commit()

        return booking

    @staticmethod
    def get_all_bookings():
        return EquipmentBooking.query.all()

    @staticmethod
    def get_booking(booking_id):
        return EquipmentBooking.query.get(booking_id)

    @staticmethod
    def get_user_bookings(user_id):
        return EquipmentBooking.query.filter_by(
            requested_by=user_id
        ).all()

    @staticmethod
    def _refresh_equipment_status(equipment_id, exclude_booking_id=None):
        """Set the equipment back to Available when it has no active
        (Pending or Approved) bookings left."""
        equipment = Equipment.query.get(equipment_id)

        if equipment is None:
            return

        if equipment.status == "Booked":
            active = EquipmentBooking.query.filter(
                EquipmentBooking.equipment_id == equipment_id,
                EquipmentBooking.status.in_(["Pending", "Approved"])
            )

            if exclude_booking_id is not None:
                active = active.filter(
                    EquipmentBooking.id != exclude_booking_id
                )

            if active.first() is None:
                equipment.status = "Available"

    @staticmethod
    def update_status(booking, status, approved_by=None):
        booking.status = status

        if approved_by is not None:
            booking.approved_by = approved_by

        # Keep the equipment's availability in sync with its bookings:
        # an approval books the equipment, a rejection/completion frees
        # it when no other active booking remains.
        equipment = Equipment.query.get(booking.equipment_id)

        if equipment is not None:
            # Only flip Available equipment to Booked; maintenance and
            # retired equipment are never touched by bookings.
            if status == "Approved" and equipment.status == "Available":
                equipment.status = "Booked"
            elif status in ("Rejected", "Completed"):
                EquipmentBookingService._refresh_equipment_status(
                    booking.equipment_id,
                    exclude_booking_id=booking.id
                )

        db.session.commit()

        return booking

    @staticmethod
    def delete_booking(booking):
        equipment_id = booking.equipment_id

        db.session.delete(booking)

        EquipmentBookingService._refresh_equipment_status(
            equipment_id,
            exclude_booking_id=booking.id
        )

        db.session.commit()
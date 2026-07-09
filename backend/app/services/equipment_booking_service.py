from app.extensions import db
from app.models.equipment_booking import EquipmentBooking


class EquipmentBookingService:

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
    def update_status(booking, status, approved_by=None):
        booking.status = status

        if approved_by is not None:
            booking.approved_by = approved_by

        db.session.commit()

        return booking

    @staticmethod
    def delete_booking(booking):
        db.session.delete(booking)
        db.session.commit()
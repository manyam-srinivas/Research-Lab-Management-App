from app.extensions import db
from app.models.procurement_request import ProcurementRequest


class ProcurementService:

    @staticmethod
    def create_request(data, current_user_id):

        request = ProcurementRequest(
            requested_by=current_user_id,
            vendor_id=data.get("vendor_id"),
            item_name=data.get("item_name"),
            quantity=data.get("quantity"),
            estimated_cost=data.get("estimated_cost"),
            justification=data.get("justification"),
            status="Pending"
        )

        db.session.add(request)
        db.session.commit()

        return request

    @staticmethod
    def get_all_requests():
        return ProcurementRequest.query.all()

    @staticmethod
    def get_request(request_id):
        return ProcurementRequest.query.get(request_id)

    @staticmethod
    def update_status(request_obj, status, approved_by):

        request_obj.status = status
        request_obj.approved_by = approved_by

        db.session.commit()

        return request_obj

    @staticmethod
    def delete_request(request_obj):

        db.session.delete(request_obj)
        db.session.commit()
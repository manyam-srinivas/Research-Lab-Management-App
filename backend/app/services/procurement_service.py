from app.extensions import db
from app.models.procurement_request import ProcurementRequest


class ProcurementService:

    @staticmethod
    def create_request(data, current_user_id):

        request = ProcurementRequest(
            requested_by=current_user_id,
            project_id=data.get("project_id"),
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
    def get_all_requests(project_id=None, search=None, status=None):
        query = ProcurementRequest.query

        if project_id:
            query = query.filter_by(project_id=project_id)

        if status:
            query = query.filter_by(status=status)

        if search:
            like = f"%{search}%"
            query = query.filter(
                ProcurementRequest.item_name.ilike(like) |
                ProcurementRequest.justification.ilike(like)
            )

        return query.all()

    @staticmethod
    def get_request(request_id):
        return ProcurementRequest.query.get(request_id)

    @staticmethod
    def update_request(request_obj, data):

     request_obj.vendor_id = data.get("vendor_id")
     request_obj.item_name = data.get("item_name")
     request_obj.quantity = data.get("quantity")
     request_obj.estimated_cost = data.get("estimated_cost")
     request_obj.justification = data.get("justification")

     db.session.commit()

     return request_obj

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
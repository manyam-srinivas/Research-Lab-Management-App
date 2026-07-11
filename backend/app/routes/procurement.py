from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.vendor import Vendor
from app.services.procurement_service import ProcurementService


procurement_bp = Blueprint(
    "procurement",
    __name__
)


def request_to_dict(req):
    return {
        "id": req.id,
        "requested_by": req.requested_by,
        "vendor_id": req.vendor_id,
        "item_name": req.item_name,
        "quantity": req.quantity,
        "estimated_cost": float(req.estimated_cost)
        if req.estimated_cost else None,
        "justification": req.justification,
        "approved_by": req.approved_by,
        "status": req.status,
        "created_at": str(req.created_at)
        if req.created_at else None
    }


@procurement_bp.route("/", methods=["POST"])
@jwt_required()
def create_request():

    current_user_id = int(get_jwt_identity())

    data = request.get_json()

    if not data.get("item_name"):
        return {
            "status": "error",
            "message": "Item name is required."
        }, 400

    vendor_id = data.get("vendor_id")

    if vendor_id:

        vendor = Vendor.query.get(vendor_id)

        if not vendor:
            return {
                "status": "error",
                "message": "Vendor not found."
            }, 404

    procurement = ProcurementService.create_request(
        data,
        current_user_id
    )

    return {
        "status": "success",
        "message": "Procurement request created successfully",
        "request_id": procurement.id
    }, 201


@procurement_bp.route("/", methods=["GET"])
@jwt_required()
def get_requests():

    requests = ProcurementService.get_all_requests()

    return {
        "status": "success",
        "count": len(requests),
        "requests": [
            request_to_dict(req)
            for req in requests
        ]
    }, 200


@procurement_bp.route("/<int:request_id>", methods=["GET"])
@jwt_required()
def get_request(request_id):

    procurement = ProcurementService.get_request(
        request_id
    )

    if not procurement:
        return {
            "status": "error",
            "message": "Request not found"
        }, 404

    return {
        "status": "success",
        "request": request_to_dict(procurement)
    }, 200


@procurement_bp.route(
    "/<int:request_id>/status",
    methods=["PUT"]
)
@jwt_required()
def update_status(request_id):

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can approve requests."
        }, 403

    procurement = ProcurementService.get_request(
        request_id
    )

    if not procurement:
        return {
            "status": "error",
            "message": "Request not found"
        }, 404

    status = request.get_json().get("status")

    if status not in [
        "Approved",
        "Rejected",
        "Purchased"
    ]:
        return {
            "status": "error",
            "message": "Invalid status."
        }, 400

    ProcurementService.update_status(
        procurement,
        status,
        current_user_id
    )

    return {
        "status": "success",
        "message": "Status updated successfully"
    }, 200


@procurement_bp.route(
    "/<int:request_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_request(request_id):

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    procurement = ProcurementService.get_request(
        request_id
    )

    if not procurement:
        return {
            "status": "error",
            "message": "Request not found"
        }, 404

    if (
        user.role != "Admin"
        and procurement.requested_by != current_user_id
    ):
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    ProcurementService.delete_request(
        procurement
    )

    return {
        "status": "success",
        "message": "Request deleted successfully"
    }, 200

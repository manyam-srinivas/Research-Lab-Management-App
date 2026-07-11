from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.services.vendor_service import VendorService


vendor_bp = Blueprint("vendors", __name__)


@vendor_bp.route("/", methods=["POST"])
@jwt_required()
def create_vendor():

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can add vendors."
        }, 403

    data = request.get_json()

    if not data.get("vendor_name"):
        return {
            "status": "error",
            "message": "Vendor name is required."
        }, 400

    vendor = VendorService.create_vendor(data)

    return {
        "status": "success",
        "message": "Vendor created successfully",
        "vendor_id": vendor.id
    }, 201


@vendor_bp.route("/", methods=["GET"])
@jwt_required()
def get_vendors():

    vendors = VendorService.get_all_vendors()

    vendor_list = []

    for vendor in vendors:

        vendor_list.append({
            "id": vendor.id,
            "vendor_name": vendor.vendor_name,
            "contact_person": vendor.contact_person,
            "phone": vendor.phone,
            "email": vendor.email,
            "address": vendor.address,
            "rating": float(vendor.rating) if vendor.rating else None
        })

    return {
        "status": "success",
        "count": len(vendor_list),
        "vendors": vendor_list
    }, 200


@vendor_bp.route("/<int:vendor_id>", methods=["GET"])
@jwt_required()
def get_vendor(vendor_id):

    vendor = VendorService.get_vendor(vendor_id)

    if not vendor:
        return {
            "status": "error",
            "message": "Vendor not found"
        }, 404

    return {
        "status": "success",
        "vendor": {
            "id": vendor.id,
            "vendor_name": vendor.vendor_name,
            "contact_person": vendor.contact_person,
            "phone": vendor.phone,
            "email": vendor.email,
            "address": vendor.address,
            "rating": float(vendor.rating) if vendor.rating else None
        }
    }, 200


@vendor_bp.route("/<int:vendor_id>", methods=["PUT"])
@jwt_required()
def update_vendor(vendor_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can update vendors."
        }, 403

    vendor = VendorService.get_vendor(vendor_id)

    if not vendor:
        return {
            "status": "error",
            "message": "Vendor not found"
        }, 404

    vendor = VendorService.update_vendor(
        vendor,
        request.get_json()
    )

    return {
        "status": "success",
        "message": "Vendor updated successfully"
    }, 200


@vendor_bp.route("/<int:vendor_id>", methods=["DELETE"])
@jwt_required()
def delete_vendor(vendor_id):

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user.role != "Admin":
        return {
            "status": "error",
            "message": "Only Admin can delete vendors."
        }, 403

    vendor = VendorService.get_vendor(vendor_id)

    if not vendor:
        return {
            "status": "error",
            "message": "Vendor not found"
        }, 404

    VendorService.delete_vendor(vendor)

    return {
        "status": "success",
        "message": "Vendor deleted successfully"
    }, 200
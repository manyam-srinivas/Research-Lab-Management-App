from app.extensions import db
from app.models.vendor import Vendor


class VendorService:

    @staticmethod
    def create_vendor(data):

        vendor = Vendor(
            vendor_name=data.get("vendor_name"),
            contact_person=data.get("contact_person"),
            phone=data.get("phone"),
            email=data.get("email"),
            address=data.get("address"),
            rating=data.get("rating")
        )

        db.session.add(vendor)
        db.session.commit()

        return vendor

    @staticmethod
    def get_all_vendors():
        return Vendor.query.all()

    @staticmethod
    def get_vendor(vendor_id):
        return Vendor.query.get(vendor_id)

    @staticmethod
    def update_vendor(vendor, data):

        vendor.vendor_name = data.get(
            "vendor_name",
            vendor.vendor_name
        )

        vendor.contact_person = data.get(
            "contact_person",
            vendor.contact_person
        )

        vendor.phone = data.get(
            "phone",
            vendor.phone
        )

        vendor.email = data.get(
            "email",
            vendor.email
        )

        vendor.address = data.get(
            "address",
            vendor.address
        )

        vendor.rating = data.get(
            "rating",
            vendor.rating
        )

        db.session.commit()

        return vendor

    @staticmethod
    def delete_vendor(vendor):

        db.session.delete(vendor)
        db.session.commit()
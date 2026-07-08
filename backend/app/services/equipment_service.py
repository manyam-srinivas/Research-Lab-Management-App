from app.extensions import db
from app.models.equipment import Equipment


class EquipmentService:

    @staticmethod
    def create_equipment(data):
        equipment = Equipment(
            name=data.get("name"),
            description=data.get("description"),
            category=data.get("category"),
            serial_number=data.get("serial_number"),
            purchase_date=data.get("purchase_date"),
            location=data.get("location"),
            status=data.get("status", "Available")
        )

        db.session.add(equipment)
        db.session.commit()

        return equipment

    @staticmethod
    def get_all_equipment():
        return Equipment.query.all()

    @staticmethod
    def get_equipment(equipment_id):
        return Equipment.query.get(equipment_id)

    @staticmethod
    def update_equipment(equipment, data):
        equipment.name = data.get(
            "name",
            equipment.name
        )
        equipment.description = data.get(
            "description",
            equipment.description
        )
        equipment.category = data.get(
            "category",
            equipment.category
        )
        equipment.serial_number = data.get(
            "serial_number",
            equipment.serial_number
        )
        equipment.purchase_date = data.get(
            "purchase_date",
            equipment.purchase_date
        )
        equipment.location = data.get(
            "location",
            equipment.location
        )
        equipment.status = data.get(
            "status",
            equipment.status
        )

        db.session.commit()

        return equipment

    @staticmethod
    def delete_equipment(equipment):
        db.session.delete(equipment)
        db.session.commit()
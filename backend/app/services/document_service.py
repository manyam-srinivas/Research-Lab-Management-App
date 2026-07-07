from app.extensions import db
from app.models.document import Document


class DocumentService:

    @staticmethod
    def create_document(
        project_id,
        uploaded_by,
        file_name,
        file_path,
        file_type,
        file_size
    ):
        document = Document(
            project_id=project_id,
            uploaded_by=uploaded_by,
            file_name=file_name,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            version="1.0"
        )

        db.session.add(document)
        db.session.commit()

        return document

    @staticmethod
    def get_project_documents(project_id):
        return Document.query.filter_by(
            project_id=project_id
        ).all()

    @staticmethod
    def get_document(document_id):
        return Document.query.get(document_id)

    @staticmethod
    def delete_document(document):
        db.session.delete(document)
        db.session.commit()
import os
from uuid import uuid4

from flask import Blueprint, request, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from app.models.project import Project
from app.services.document_service import DocumentService


document_bp = Blueprint("documents", __name__)


@document_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_document():

    current_user_id = int(get_jwt_identity())

    project_id = request.form.get("project_id")
    file = request.files.get("file")

    if not project_id or not file:
        return {
            "status": "error",
            "message": "project_id and file are required"
        }, 400

    project = Project.query.filter_by(
        id=project_id,
        is_deleted=False
    ).first()

    if not project:
        return {
            "status": "error",
            "message": "Project not found"
        }, 404

    original_name = secure_filename(file.filename)

    unique_name = (
        f"{uuid4().hex}_{original_name}"
    )

    upload_folder = os.path.join(
        current_app.root_path,
        "..",
        "uploads"
    )

    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(
        upload_folder,
        unique_name
    )

    file.save(file_path)

    file_size = os.path.getsize(file_path)

    document = DocumentService.create_document(
        project_id=int(project_id),
        uploaded_by=current_user_id,
        file_name=original_name,
        file_path=file_path,
        file_type=file.content_type,
        file_size=file_size
    )

    return {
        "status": "success",
        "message": "Document uploaded successfully",
        "document_id": document.id
    }, 201


@document_bp.route(
    "/project/<int:project_id>",
    methods=["GET"]
)
@jwt_required()
def get_project_documents(project_id):

    documents = DocumentService.get_project_documents(
        project_id
    )

    return {
        "status": "success",
        "count": len(documents),
        "documents": [
            {
                "id": document.id,
                "project_id": document.project_id,
                "uploaded_by": document.uploaded_by,
                "file_name": document.file_name,
                "file_type": document.file_type,
                "file_size": document.file_size,
                "version": document.version,
                "created_at": str(document.created_at)
            }
            for document in documents
        ]
    }, 200


@document_bp.route(
    "/<int:document_id>/download",
    methods=["GET"]
)
@jwt_required()
def download_document(document_id):

    document = DocumentService.get_document(
        document_id
    )

    if not document:
        return {
            "status": "error",
            "message": "Document not found"
        }, 404

    if not os.path.exists(document.file_path):
        return {
            "status": "error",
            "message": "File not found on server"
        }, 404

    return send_file(
        document.file_path,
        as_attachment=True,
        download_name=document.file_name
    )


@document_bp.route(
    "/<int:document_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_document(document_id):

    current_user_id = int(get_jwt_identity())

    document = DocumentService.get_document(
        document_id
    )

    if not document:
        return {
            "status": "error",
            "message": "Document not found"
        }, 404

    project = Project.query.filter_by(
        id=document.project_id,
        is_deleted=False
    ).first()

    if not project:
        return {
            "status": "error",
            "message": "Project not found"
        }, 404

    if (
        project.created_by != current_user_id
        and document.uploaded_by != current_user_id
    ):
        return {
            "status": "error",
            "message": "Permission denied"
        }, 403

    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    DocumentService.delete_document(document)

    return {
        "status": "success",
        "message": "Document deleted successfully"
    }, 200
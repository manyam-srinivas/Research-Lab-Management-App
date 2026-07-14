from flask import jsonify


def success(message="", data=None, status_code=200):
    return jsonify({
        "status": "success",
        "message": message,
        "data": data or {}
    }), status_code


def error(message="", status_code=400):
    return jsonify({
        "status": "error",
        "message": message
    }), status_code
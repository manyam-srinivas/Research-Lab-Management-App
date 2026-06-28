class Config:
    SQLALCHEMY_DATABASE_URI = (
        "mysql+pymysql://root:srinivas%40sql@localhost/research_lab_management"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = "research_lab_secret_key_2026"
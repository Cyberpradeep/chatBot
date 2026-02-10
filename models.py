from flask_sqlalchemy import SQLAlchemy
db=SQLAlchemy()
class History(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    role=db.Column(db.String(250),nullable=False)
    text=db.Column(db.Text,nullable=False)
    
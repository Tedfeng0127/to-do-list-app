from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
import sys
import os
import pymysql



app = Flask(__name__)
app.config["SECRET_KEY"] = os.urandom(12).hex()
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_CONNECTION_STRING"]
# app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:123456@localhost:3306/to_do_list_testing_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


db = SQLAlchemy(app)

class Note(db.Model):
    __tablename__ = "note"
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String)


@app.route("/", methods=["GET", "POST"])
def homepage():
    """
    待辦事項頁面
    """
    note = Note.query.all()
    note_count = len(note)
    return render_template("to_do_list.html", note=note[::-1], note_count=note_count)


@app.route("/add_note", methods=["POST"])
def add_note():
    """
    新增待辦事項
    """
    content = request.get_json()["new_note"]
    note = Note(content=content)
    db.session.add(note)
    db.session.commit()
    query_note = Note.query.filter_by(content=content).all()[-1]
    return {"note_id":query_note.id}


@app.route("/delete_note", methods=["GET"])
def delete_note():
    """
    刪除待辦事項
    """
    note_id = int(request.args.get("note_id"))
    deleted_note = Note.query.filter_by(id=note_id).first()
    db.session.delete(deleted_note)
    db.session.commit()
    return {}


@app.route("/edit_note", methods=["GET"])
def edit_note():
    """
    修改待辦事項
    """
    note_id = int(request.args.get("note_id"))
    new_content = request.args.get("new_content")
    note = Note.query.filter_by(id=note_id).first()
    note.content = new_content
    db.session.commit()
    return {}


if __name__ == "__main__":
    app.run()
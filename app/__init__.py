from flask import Flask
from config import Config
from flask_mongoengine import MongoEngine
from flask_cors import CORS

db = MongoEngine()

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
CORS(app)

from app import routes, model

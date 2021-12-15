import os

class Config(object):
    MONGODB_SETTINGS = {
        'host': os.environ.get('DATABASE_URL')
    }
    CORS_HEADERS = 'Content-Type'
    SECRET_KEY = os.environ.get('SECRET_KEY')


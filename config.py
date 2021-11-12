import os

class Config(object):
    MONGODB_SETTINGS = {
        'host': os.environ.get('DATABASE_URL')
    }
    CORS_HEADERS = 'Content-Type'


from app import db
from requests import get
from app import model



def populate_collection(collection_name: str):
    collection_class = model.CLASS_DICT[collection_name][0]

    if collection_class.objects.first() != None:
        return

    


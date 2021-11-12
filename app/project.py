from app import app, db
from app import model
from app import routes

@app.shell_context_processor
def make_shell_context():
    return {'db':       db, 
        'routes':       routes, 
        'Race':         model.Race,
        'Spell':        model.Spell,
        '_Class':       model._Class,
        'Background':   model.Background,
        'Feat':         model.Feat,
        'Com':          model.CommonModel
    }
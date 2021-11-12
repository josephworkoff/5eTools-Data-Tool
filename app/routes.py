from app import app
from flask import render_template, jsonify, request
from flask_cors import cross_origin
from app.model import CommonModel, Race, _Class, Spell, Background, Feat


BASE_URL = "https://5e.tools/data/"

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')



@app.route('/races', methods=['GET'])
@cross_origin()
def get_races():
    Race.populate()

    page_num = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 10)

    # print(f'page:{page_num}')


    

    page = CommonModel.get_page_data(Race, page_num, per_page)

    return jsonify(page)
    

@app.route('/race/<int:raceid>', methods=['GET'])
def get_race_by_id(raceid):
    Race.populate()
    return Race.objects(id=raceid).first_or_404().to_dict()



@app.route('/race/field/<string:field>', methods=['GET'])
def get_race_field_values(field):
    Race.populate()

    values = Race.objects.distinct(field)

    unique = []

    for val in values:
        if isinstance(val, dict):
            if "choose" in val.keys():
                unique = unique + list(val['choose']['from'])
            unique = unique + list(val.keys())
        else:
            unique.append(val)

    unique = sorted(filter(lambda x: x not in ["choose", "any", "common", "other"], list(set(unique))))
    return jsonify(unique)


@app.route('/classes', methods=['GET'])
def get_classes():
    return 'hi'
    

@app.route('/class/<int:id>', methods=['GET'])
def get_class_by_id(id):
    return 'hello'


@app.route('/spells', methods=['GET'])
def get_spells():
    Spell.populate()

    page_num = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 10)
    print(f'page:{page_num}')
    page = CommonModel.get_page_data(Spell, page_num, per_page)

    return jsonify(page)
    

@app.route('/spell/<int:spellid>', methods=['GET'])
def get_spell_by_id(spellid):
    Spell.populate()
    spell = Spell.objects(id=spellid).first()
    if spell != None:
        return spell.to_dict()
    return {}


@app.route('/feats', methods=['GET'])
def get_feats():
    Feat.populate()
    all_feats = Feat.objects()
    feats_list = []
    for feat in all_feats:
        feats_list.append(feat.to_dict_collection())
    return feats_list
    

@app.route('/feat/<int:featid>', methods=['GET'])
def get_feat_by_id(featid):
    Feat.populate()
    feat = Spell.objects(id=featid).first()
    if feat != None:
        return feat.to_dict()
    return {}


@app.route('/background', methods=['GET'])
def get_backgrounds():
    Background.populate()
    all_backgrounds = Background.objects()
    backgrounds_list = []
    for background in all_backgrounds:
        backgrounds_list.append(background.to_dict_collection())
    return backgrounds_list
    

@app.route('/background/<int:backgroundid>', methods=['GET'])
def get_background_by_id(backgroundid):
    Background.populate()
    background = Background.objects(id=backgroundid).first()
    if background != None:
        return background.to_dict()
    return {}
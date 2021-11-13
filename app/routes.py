from mongoengine.queryset.visitor import Q
from app import app
from flask import render_template, jsonify, request
from flask_cors import cross_origin
from app.model import CommonModel, Race, _Class, Spell, Background, Feat


EXCLUDE_LIST = ["choose", "any", "common", "other", "anyStandard"]


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')



@app.route('/race/<int:raceid>', methods=['GET'])
def get_race_by_id(raceid):
    Race.populate()
    return Race.objects(id=raceid).first_or_404().to_dict()

@app.route('/races', methods=['GET'])
@cross_origin()
def get_races():
    Race.populate()

    page_num = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 10)

    name = request.args.get('name', None)
    source = request.args.get('source', None)
    size = request.args.get('size', None)
    language = request.args.get('language', None)
    skill = request.args.get('skill', None)
    ability = request.args.get('ability', None)

    print(request.args)
    # query = dict()
    # if name: query['name__istartswith'] = name
    # if source: query['source'] = source
    # if size: query['size'] = size
    # if language: query[f'languageProficiencies__{language}'] = True
    # if skill: query[f'skillProficiencies__{skill}'] = True

    queries = []
    if name: queries.append(Q(name__istartswith=name))
    if source: queries.append(Q(source=source))
    if size: queries.append(Q(size=size))
    if language: queries.append(Q(__raw__={'$or':[{f'languageProficiencies.{language}': True}, {'languageProficiencies.choose.from': language}] }))
    if skill: queries.append(Q(__raw__={'$or':[{f'skillProficiencies.{skill}': True}, {'skillProficiencies.choose.from': skill}] }))
    if ability: queries.append(Q(__raw__={'$or':[{f'ability.{ability}': {"$gt": 0}}, {'ability.choose.from': ability}] }))

    # print(queries)

    if len(queries) > 0: 
        full_query = Q()
        for qu in queries:
            full_query = full_query & qu
            # print("In bg: ", full_query)
    else: 
        full_query = None

    page = CommonModel.get_page_data(Race, page_num, per_page, full_query)

    return jsonify(page)
    
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

    unique = sorted(filter(lambda x: x not in EXCLUDE_LIST, list(set(unique))))
    return jsonify(unique)




@app.route('/classes', methods=['GET'])
def get_classes():
    return 'hi'
    
@app.route('/class/<int:id>', methods=['GET'])
def get_class_by_id(id):
    return 'hello'



@app.route('/spell/<int:spellid>', methods=['GET'])
def get_spell_by_id(spellid):
    Spell.populate()
    return Spell.objects(id=spellid).first_or_404().to_dict()

@app.route('/spells', methods=['GET'])
def get_spells():
    Spell.populate()

    page_num = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 10)

    name = request.args.get('name', None)
    source = request.args.get('source', None)
    duration = request.args.get('duration', None)
    school = request.args.get('school', None)
    level = request.args.get('level', None)

    # if name: query['name__istartswith'] = name
    # if source: query['source'] = source
    # if duration: query[f'duration__type__exact'] = duration
    # if school: query['school'] = school
    # if level: query['level'] = level

    queries = []
    if name: queries.append(Q(name__istartswith=name))
    if source: queries.append(Q(source=source))
    if duration: queries.append(Q(duration__type__exact=duration))
    if school: queries.append(Q(school=school))
    if level: queries.append(Q(level=level))

    # print(queries)

    if len(queries) > 0: 
        full_query = Q()
        for qu in queries:
            full_query = full_query & qu
            # print("In bg: ", full_query)
    else: 
        full_query = None

    page = CommonModel.get_page_data(Spell, page_num, per_page, full_query)

    return jsonify(page)
    
@app.route('/spell/field/<string:field>', methods=['GET'])
def get_spell_field_values(field):
    Spell.populate()

    values = Spell.objects.distinct(field)

    unique = []

    for val in values:
        if isinstance(val, dict):
            if "choose" in val.keys():
                unique = unique + list(val['choose']['from'])
            unique = unique + list(val.keys())
        else:
            unique.append(val)

    unique = sorted(filter(lambda x: x not in EXCLUDE_LIST, list(set(unique))))
    return jsonify(unique)




@app.route('/feat/<int:featid>', methods=['GET'])
def get_feat_by_id(featid):
    Feat.populate()
    return Feat.objects(id=featid).first_or_404().to_dict()

@app.route('/feats', methods=['GET'])
def get_feats():
    Feat.populate()

    page_num = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 10)

    name = request.args.get('name', None)
    source = request.args.get('source', None)
    skill = request.args.get('skill', None)
    ability = request.args.get('ability', None)

    print(request.args)
    queries = []
    if name: queries.append(Q(name__istartswith=name))
    if source: queries.append(Q(source=source))
    if skill: queries.append(Q(__raw__={'$or':[{f'skillProficiencies.{skill}': True}, {'skillProficiencies.choose.from': skill}] }))
    if ability: queries.append(Q(__raw__={'$or':[{f'ability.{ability}': {"$gt": 0}}, {'ability.choose.from': ability}] }))

    if len(queries) > 0: 
        full_query = Q()
        for qu in queries:
            full_query = full_query & qu
            # print("In bg: ", full_query)
    else: 
        full_query = None


    page = CommonModel.get_page_data(Feat, page_num, per_page, full_query)

    return jsonify(page)
    
@app.route('/feat/field/<string:field>', methods=['GET'])
def get_feat_field_values(field):
    Feat.populate()

    values = Feat.objects.distinct(field)

    unique = []

    for val in values:
        if isinstance(val, dict):
            if "choose" in val.keys():
                unique = unique + list(val['choose']['from'])
            unique = unique + list(val.keys())
        else:
            unique.append(val)

    unique = sorted(filter(lambda x: x not in EXCLUDE_LIST, list(set(unique))))
    return jsonify(unique)



@app.route('/background/<int:backgroundid>', methods=['GET'])
def get_background_by_id(backgroundid):
    Background.populate()
    return Background.objects(id=backgroundid).first_or_404().to_dict()

@app.route('/backgrounds', methods=['GET'])
def get_backgrounds():
    Background.populate()

    page_num = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 10)

    name = request.args.get('name', None)
    source = request.args.get('source', None)
    language = request.args.get('language', None)
    skill = request.args.get('skill', None)
    tool = request.args.get('tool', None)

    print(request.args)
    queries = []
    if name: queries.append(Q(name__istartswith=name))
    if source: queries.append(Q(source=source))
    if language: queries.append(Q(__raw__={'$or':[{f'languageProficiencies.{language}': True}, {'languageProficiencies.choose.from': language}] }))
    if skill: queries.append(Q(__raw__={'$or':[{f'skillProficiencies.{skill}': True}, {'skillProficiencies.choose.from': skill}] }))
    if tool: queries.append(Q(__raw__={'$or':[{f'toolProficiencies.{tool}': True}, {'toolProficiencies.choose.from': tool}] }))

    # print(queries)

    if len(queries) > 0: 
        full_query = Q()
        for qu in queries:
            full_query = full_query & qu
            # print("In bg: ", full_query)
    else: 
        full_query = None

    page = CommonModel.get_page_data(Background, page_num, per_page, full_query)

    return jsonify(page)
    
@app.route('/background/field/<string:field>', methods=['GET'])
def get_background_field_values(field):
    Background.populate()

    values = Background.objects.distinct(field)

    unique = []

    for val in values:
        if isinstance(val, dict):
            if "choose" in val.keys():
                unique = unique + list(val['choose']['from'])
            unique = unique + list(val.keys())
        else:
            unique.append(val)

    unique = sorted(filter(lambda x: x not in EXCLUDE_LIST, list(set(unique))))
    return jsonify(unique)
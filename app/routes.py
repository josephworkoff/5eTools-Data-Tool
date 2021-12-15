##@mainpage
# Mainpage text.
#


##@package routes
# Routes module for defining HTTP endpoints.
# 
# @Author: Joseph Workoff
# @Major: CS/SD MS
# @Creation Date: 10/20/2021
# @Due Date: 12/15/2021
# @Course: CSC521
# @Professor Name: Dr. Spiegel
# @Assignment: #3
# @Filename: routes.py
# @Purpose: Define endpoints.



from json import dump
from mongoengine.queryset.visitor import Q
from app import app
from flask import render_template, jsonify, request, url_for
from flask_cors import cross_origin
from app.model import CommonModel, Race, _Class, Spell, Background, Feat


EXCLUDE_LIST = ["choose", "any", "common", "other", "anyStandard", "hidden"]


@app.before_first_request
def before_first_request():
    Race.populate()
    Background.populate()
    Spell.populate()
    Feat.populate()


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/info')
def info():
    return render_template('info.html')



@app.route('/race/<int:raceid>', methods=['GET'])
##
# \fn get_race_by_id
# \param raceid 
# \brief returns full details of a single Race denoted by ID.
# \return JSON containing all fields of a single Race Document
#
def get_race_by_id(raceid):
    Race.populate()
    return Race.objects(id=raceid).first_or_404().to_dict()

@app.route('/races', methods=['GET'])
@cross_origin()
##
# @fn get_races
# @brief Queries for up to 10 Races based on GET parameters
# @return JSON containing abbreviated details of up to 10 races that match the specified parameters.
#
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
    """
    @fn get_race_field_values
    @param field: Document field to retrieve values of 
    @brief Queries for all distinct values of a certain document field.
    @return list of all distinct values.
    """
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




# @app.route('/classes', methods=['GET'])
# def get_classes():
#     return 'hi'
    
# @app.route('/class/<int:id>', methods=['GET'])
# def get_class_by_id(id):
#     return 'hello'



@app.route('/spell/<int:spellid>', methods=['GET'])
def get_spell_by_id(spellid):
    """
    @fn get_spell_by_id
    @param spellid 
    @brief returns full details of a single spell denoted by ID.
    @return JSON containing all fields of a single spell Document
    """
    Spell.populate()
    return Spell.objects(id=spellid).first_or_404().to_dict()

@app.route('/spells', methods=['GET'])
def get_spells():
    """
    @fn get_spells
    @brief Queries for up to 10 spells based on GET parameters
    @return JSON containing abbreviated details of up to 10 spells that match the specified parameters.
    """
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
    """
    @fn get_spell_field_values
    @param field: Document field to retrieve values of 
    @brief Queries for all distinct values of a certain document field.
    @return list of all distinct values.
    """
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
    """
    @fn get_feat_by_id
    @param featid 
    @brief returns full details of a single feat denoted by ID.
    @return JSON containing all fields of a single feat Document
    """
    Feat.populate()
    return Feat.objects(id=featid).first_or_404().to_dict()

@app.route('/feats', methods=['GET'])
def get_feats():
    """
    @fn get_feats
    @brief Queries for up to 10 feats based on GET parameters
    @return JSON containing abbreviated details of up to 10 feats that match the specified parameters.
    """
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
    """
    @fn get_feat_field_values
    @param field: Document field to retrieve values of 
    @brief Queries for all distinct values of a certain document field.
    @return list of all distinct values.
    """
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
    """
    @fn get_background_by_id
    @param backgroundid 
    @brief returns full details of a single background denoted by ID.
    @return JSON containing all fields of a single background Document
    """
    Background.populate()
    return Background.objects(id=backgroundid).first_or_404().to_dict()

@app.route('/backgrounds', methods=['GET'])
def get_backgrounds():
    """
    @fn get_backgrounds
    @brief Queries for up to 10 backgrounds based on GET parameters
    @return JSON containing abbreviated details of up to 10 backgrounds that match the specified parameters.
    """
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
    """
    @fn get_background_field_values
    @param field: Document field to retrieve values of 
    @brief Queries for all distinct values of a certain document field.
    @return list of all distinct values.
    """
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
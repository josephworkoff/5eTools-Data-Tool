##@mainpage
# This program displays data from 5eTools (https://5e.tools/index.html), an open source 
# (https://github.com/TheGiddyLimit/TheGiddyLimit.github.io) rules repository for the game 
# Dungeons & Dragons 5th edition. \n
# The game publishes official rules and content across many books. This site aggregates them into one place. \n
# This program scrapes data contained in JSON files in 5eTools' backend /data directory and allows the user to browse through it. \n
# A brief explanation of the game itself can be found here (https://dnd.wizards.com/basics-play).
# This program provides an interface for browsing the game's character Races, Backgrounds, Feats, and Spells.
# Installing and Running the server: \n
#  - Install Python (https://www.python.org/downloads/)\n
#  - Create a virtual environment in the top level directory\n
#     - $ python3 -m venv venv\n
#  - Activate the virtual environment\n
#     - Windows: $ venv\Scripts\activate\n
#     - Unix: $ source venv/bin/activate\n
#  - Install the requirements into the virtual environment\n
#     - $ python -m pip install -r requirements.txt\n
#  - cd into app directory\n
#  - $ flask run\n
#  - Connect at localhost:5000.\n
#
# The server provides an API for querying the data and returning it as JSON. There are three similar endpoints per data type and one index, for a total of 13 routes. All are accessed through GET alone.\n
# Each data type has the same API options, subsituting the desired data type. Using Race as an example:
# 
# /race/<int:raceid> : Fetches the complete JSON representation of a single race, requested by a numeric ID.  \n
# /races : Bulk query for filtering races through GET parameters. Results are paginated in groups of 10 by default. Returns an abbreviated JSON description of the race containing ID's, Names, and Sources, as well as metainfo on how many total races match those parameters, the page number, how many are in this page, and how many pages worth of results there are. \n
# /race/field/<string:field> : Returns a list of all distinct values that exist in the Collection for that field. \n
#
#Examples:\n
#https://dnd-data-tool.herokuapp.com/race/48 retrieves data on the Dwarf race. \n
#https://dnd-data-tool.herokuapp.com/races?source=PHB queries for races sourced from the Player's Handbook (PHB).\n
#https://dnd-data-tool.herokuapp.com/race/field/source queries for every source material that a race in the database was originally published in. \n
#
#race(s) can be substituted for spell(s), background(s), and feat(s).\n
#


##@package routes
# Routes module for defining HTTP endpoints.
# 
# \b Author: Joseph Workoff\n
# \b Major: CS/SD MS\n
# \b Creation Date: 10/20/2021\n
# \b Due Date: 12/15/2021\n
# \b Course: CSC521\n
# \b Professor Name: Dr. Spiegel\n
# \b Assignment: #3\n
# \b Filename: routes.py\n
# \b Purpose: Define endpoints.\n



from json import dump
from mongoengine.queryset.visitor import Q
from app import app
from flask import render_template, jsonify, request, url_for
from flask_cors import cross_origin
from app.model import CommonModel, Race, Spell, Background, Feat


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
# @fn get_race_by_id
# @param raceid 
# @brief returns full details of a single Race denoted by ID.
# @return JSON containing all fields of a single Race Document
#
def get_race_by_id(raceid):
    Race.populate()
    return Race.objects(id=raceid).first_or_404().to_dict()

@app.route('/races', methods=['GET'])
@cross_origin()
## @fn get_races
# 
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
## @fn get_race_field_values
#@param field: Document field to retrieve values of 
#@brief Queries for all distinct values of a certain document field.
#@return list of all distinct values.
#
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



@app.route('/spell/<int:spellid>', methods=['GET'])
## @fn get_spell_by_id
# 
# @param spellid 
# @brief returns full details of a single spell denoted by ID.
# @return JSON containing all fields of a single spell Document
# 
def get_spell_by_id(spellid):
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
## @fn get_spell_field_values
# @param field: Document field to retrieve values of 
# @brief Queries for all distinct values of a certain document field.
# @return list of all distinct values.
#
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
## @fn get_feat_by_id
# @param featid 
# @brief returns full details of a single feat denoted by ID.
# @return JSON containing all fields of a single feat Document
#
def get_feat_by_id(featid):
    Feat.populate()
    return Feat.objects(id=featid).first_or_404().to_dict()

@app.route('/feats', methods=['GET'])
## @fn get_feats
# @brief Queries for up to 10 feats based on GET parameters
# @return JSON containing abbreviated details of up to 10 feats that match the specified parameters.
#
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
## @fn get_feat_field_values
#@param field: Document field to retrieve values of 
#@brief Queries for all distinct values of a certain document field.
#@return list of all distinct values.
#
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
## @fn get_background_by_id
#@param backgroundid 
#@brief returns full details of a single background denoted by ID.
#@return JSON containing all fields of a single background Document
#
def get_background_by_id(backgroundid):
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
## @fn get_background_field_values
#@param field: Document field to retrieve values of 
#@brief Queries for all distinct values of a certain document field.
#@return list of all distinct values.
#
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
##@package model
# @brief Model module for defining mongoengine DOM classes
# 
# \b Author: Joseph Workoff\n
# \b Creation Date: 10/20/2021\n
# \b Filename: model.py\n
# \b Purpose: Define model classes.\n


import mongoengine
from mongoengine.fields import BooleanField, DictField
from app import db
from flask_mongoengine import Document, Pagination
from requests import get



class CommonModel:
    """CommonModel abstract class for defining operations relevant to all model classes.
    """
    @staticmethod
    ## @fn empty
    # @param model_class: DOM Model class name
    # @brief Empties all documents from the database.
    #
    def empty(model_class):
        model_class.objects.delete()

    @staticmethod
    ##@fn get_page_data
    #
    #@param model_class: 
    #@param page_number: 
    #@param per_page: 
    #@param query: 
    #@brief Performs a query for a page of the specified collection.
    #@return JSON containing abbreviated information on up to 10 documents, and meta page info.
    #
    def get_page_data(model_class, page_number=1, per_page=10, query=None):
        # paginated = Pagination(model_class.objects.filter(**query).order_by('name'), page_number, per_page)
        print(query)
        paginated = Pagination(model_class.objects(query).order_by('name'), page_number, per_page)

        data = {
            '_meta': {
                'page': page_number,
                'per_page': per_page,
                'total_pages': paginated.pages,
                'total_items': paginated.total
            },
            'items': [CommonModel.to_dict_abbrev(item) for item in paginated.items]
        }

        return data

    @staticmethod
    def to_dict_abbrev(model_object):
        return {
            "id":       model_object.id,
            "name":     model_object.name,
            "source":   model_object.source
        }
       


def make_get_attr(item: list):
    def func(attr: str):
        return None if attr not in item.keys() else item[attr]
    return func


class Race(Document):
    """Race DOM class
    """
    meta = {'collection': 'Race'}

    id = db.IntField(primary_key=True)

    name = db.StringField()
    source = db.StringField(unique_with='name')
    size = db.ListField()
    entries = db.ListField()
    speed = db.DictField()
    languageProficiencies = db.DictField()
    ability = db.DictField()
    fluff = db.ListField()
    age = db.DictField()
    skillProficiencies = db.DictField()
    traitTags = db.ListField()


    def to_dict(self):
        return self.to_json()




    @staticmethod
    ## @fn populate
    # 
    # @param force: Clear the database prior to repopulating 
    # @brief Retrieves all race data from the website and uses it to populate the Collection.
    # @return list of all created Race objects.
    # 
    def populate(force:bool=False):
        if force:
            CommonModel.empty(Race)

        if Race.objects().first() != None:
            print("Race table already populated, skipping.")
            return

        race_data = get('https://5e.tools/data/races.json').json()
        fluff_data = get('https://5e.tools/data/fluff-races.json').json()

        race_list = race_data["race"]
        fluff_list = fluff_data["raceFluff"]

        race_objects = []

        idnum = 1

        def parse_entry_list(name, entry, elist):
            if isinstance(entry, list):
                for el in entry:
                    parse_entry_list(name, el, elist)
            elif isinstance(entry, dict):
                if 'name' in entry.keys():
                    name = entry['name']
                if 'entries' in entry.keys():
                    parse_entry_list(name, entry['entries'], elist)
                elif '_copy' in entry.keys():
                    parse_entry_list(name, entry['_copy'], elist)
                elif '_mod' in entry.keys():
                    parse_entry_list(name, entry['_mod'], elist)
                elif 'mode' in entry.keys():
                    parse_entry_list(name, entry['mode'], elist)
            elif isinstance(entry, str):
                for n in elist:
                    if n[0] == name:
                        n[1].append(entry)
                        return
                elist.append( (name, [entry]) )

        def get_fluff(name, source):
            for fluff_object in fluff_list:
                if fluff_object['name'] == name and fluff_object["source"] == source:
                    if "entries" not in fluff_object.keys():
                        return None
                    fluff_entry_list = []
                    parse_entry_list('', fluff_object['entries'], fluff_entry_list)
                    return fluff_entry_list

        for race in race_list:
            get_attr = make_get_attr(race)
            
            attr_map = {'id': idnum}

            for attr in [
                "source",
                'name',
                'size',
                'entries',
                'speed',
                'languageProficiencies',
                'traitTags',
                'age',
                'ability',
                'skillProficiencies'
            ]:
                attr_map[attr] = get_attr(attr)


            if attr_map['entries']:
                entries_list = []
                parse_entry_list('', attr_map['entries'], entries_list)
                attr_map['entries'] = entries_list

            if attr_map['ability']:
                attr_map['ability'] = attr_map['ability'][0]

            if attr_map['languageProficiencies']:
                attr_map['languageProficiencies'] = attr_map['languageProficiencies'][0]
                
            if isinstance(attr_map['speed'], int) or isinstance(attr_map['speed'], str):
                attr_map['speed'] = {'walk': attr_map['speed']}

            if attr_map['skillProficiencies']:
                attr_map['skillProficiencies'] = attr_map['skillProficiencies'][0]

            if get_attr('hasFluff'):
                attr_map['fluff'] = get_fluff(attr_map['name'], attr_map['source'])

            # attr_map = {attr: value for attr, value in attr_map.items() if value is not None}

            # r = Race(**attr_map)
            r = Race()
            for attr in attr_map.keys():
                setattr(r, attr, attr_map[attr])

            print(idnum, attr_map['name'], attr_map['source'])

            race_objects.append(r)

            try:
                r.save()
                race_objects.append(r)
            except:
                print("Ignoring", idnum, attr_map['name'], attr_map['source'])
            finally:
                idnum = idnum + 1


        # Race.objects.insert(race_objects)        
        return race_objects



class Spell(Document):
    """Spell DOM class
    """
    meta = {'collection': 'Spell'}

    id = db.IntField(primary_key=True)
    name = db.StringField()
    source = db.StringField(unique_with='name')
    entries = db.ListField()
    level = db.IntField()
    school = db.StringField()
    time = db.DictField()
    range = db.DictField()
    components = db.DictField()
    duration = db.DictField()
    entries = db.ListField()
    classes = db.DictField()
    conditionInflict = db.ListField()
    savingThrow = db.ListField()


    def to_dict(self):
        return self.to_json()


    @staticmethod
    ## @fn populate
    # @param force: Clear the database prior to repopulating 
    # @brief Retrieves all spell data from the website and uses it to populate the Collection.
    # @return list of all created Spell objects.
    # 
    def populate(force:bool=False):
        if force:
            CommonModel.empty(Spell)

        if Spell.objects().first() != None:
            print("Spell table already populated, skipping.")
            return

        base_url = 'https://5e.tools/data/spells/'

        spells_index_url = base_url + 'index.json'
        index = get(spells_index_url).json()

        spell_objects = []
        idnum = 1

        spells_list = []

        for source_file in index.keys():
            spells_list = spells_list + get(base_url + index[source_file]).json()["spell"]
        # for source_file in index.keys():
        #     spells_list = get(base_url + index[source_file]).json()["spell"]

        for spell in spells_list:
            get_attr = make_get_attr(spell)

            attr_map = {'id': idnum}

            for attr in [
                'source',
                'name',
                'entries',
                'level',
                'school',
                'time',
                'range',
                'components',
                'duration',
                'entries',
                'classes',
                'conditionInflict',
                'savingThrow'
            ]:
                attr_map[attr] = get_attr(attr)

            print(idnum, attr_map['name'], attr_map['source'])


            if attr_map['time']:
                if len(attr_map['time']) != 1:
                    print(f"******{idnum} {attr_map['name']} {attr_map['source']} time list len > 1******")
                attr_map['time'] = attr_map['time'][0]

            if attr_map['duration']:
                if len(attr_map['duration']) != 1:
                    print(f"******{idnum} {attr_map['name']} {attr_map['source']} duration list len > 1******")
                attr_map['duration'] = attr_map['duration'][0]


            s = Spell()
            for attr in attr_map.keys():
                setattr(s, attr, attr_map[attr])

            s.save()
            spell_objects.append(s)
            # idnum = idnum + 1

            try:
                s.save()
                spell_objects.append(s)
            except:
                print("Ignoring", idnum, attr_map['name'], attr_map['source'])
            finally:
                idnum = idnum + 1

        # Spell.objects.insert(spell_objects)
        return spell_objects


class Background(Document):
    """Spell DOM class
    """
    meta = {'collection': 'Background'}

    id = db.IntField(primary_key=True)
    name = db.StringField()
    source = db.StringField(unique_with='name')
    skillProficiencies = db.DictField()
    entries = db.ListField()
    fluff = db.ListField()
    startingEquipment = db.DictField()
    toolProficiencies = db.DictField()
    languageProficiencies = db.DictField()

    def to_dict(self):
        return self.to_json()


    
    @staticmethod
    ## @fn populate
    #
    # @param force: Clear the database prior to repopulating 
    # @brief Retrieves all Background data from the website and uses it to populate the Collection.
    # @return list of all created Background objects.
    #
    def populate(force:bool=False):
        if force:
            CommonModel.empty(Background)
        
        if Background.objects().first() != None:
            print("Background table already populated, skipping.")
            return

        background_data = get('https://5e.tools/data/backgrounds.json').json()
        fluff_data = get('https://5e.tools/data/fluff-backgrounds.json').json()

        background_list = background_data["background"]
        fluff_list = fluff_data["backgroundFluff"]



        def parse_entry_list(name, entry, elist):
            if isinstance(entry, list):
                for el in entry:
                    parse_entry_list(name, el, elist)
            elif isinstance(entry, dict):
                if 'name' in entry.keys():
                    name = entry['name']
                if 'entries' in entry.keys():
                    parse_entry_list(name, entry['entries'], elist)
                elif '_copy' in entry.keys():
                    parse_entry_list(name, entry['_copy'], elist)
                elif '_mod' in entry.keys():
                    parse_entry_list(name, entry['_mod'], elist)
                elif 'mode' in entry.keys():
                    parse_entry_list(name, entry['mode'], elist)
            elif isinstance(entry, str):
                for n in elist:
                    if n[0] == name:
                        n[1].append(entry)
                        return
                elist.append( (name, [entry]) )


        background_objects = []
        idnum = 1

        for background in background_list:
            get_attr = make_get_attr(background)
            attr_map = {'id': idnum}

            for attr in [
                'name',
                'source',
                'entries',
                'skillProficiencies',
                'startingEquipment',
                'toolProficiencies',
                'languageProficiencies',
            ]:
                attr_map[attr] = get_attr(attr)

            print(idnum, attr_map['name'], attr_map['source'])


            def get_fluff(name, source):
                for fluff_object in fluff_list:
                    if fluff_object['name'] == name and fluff_object["source"] == source:
                        if "entries" not in fluff_object.keys():
                            return None
                        fluff_entry_list = []
                        parse_entry_list('', fluff_object['entries'], fluff_entry_list)
                        return fluff_entry_list


            entries_list = []
            parse_entry_list('', attr_map['entries'], entries_list)
            attr_map['entries'] = entries_list

            attr_map['fluff'] = get_fluff(attr_map['name'], attr_map['source'])

            if attr_map['startingEquipment']:
                attr_map['startingEquipment'] = attr_map['startingEquipment'][0]

            if attr_map['languageProficiencies']:
                attr_map['languageProficiencies'] = attr_map['languageProficiencies'][0]

            if attr_map['skillProficiencies']:
                attr_map['skillProficiencies'] = attr_map['skillProficiencies'][0]

            if attr_map['toolProficiencies']:
                attr_map['toolProficiencies'] = attr_map['toolProficiencies'][0]

            b = Background()
            for attr in attr_map.keys():
                setattr(b, attr, attr_map[attr])

            print(idnum)
            b.save()
            background_objects.append(b)
            idnum = idnum + 1
        
        return background_objects


class Feat(Document):
    """Spell DOM class
    """
    meta = {'collection': 'Feat'}

    id = db.IntField(primary_key=True)
    name = db.StringField()
    source = db.StringField(unique_with='name')
    entries = db.ListField()
    additionalSpells = db.ListField()
    otherSources = db.ListField()
    page = db.IntField()
    prerequisite = db.ListField()
    ability = db.ListField()
    skillProficiencies = db.ListField()
    

    def to_dict(self):
        return self.to_json()

    
    @staticmethod
    ## @fn populate
    # 
    # @param force: Clear the database prior to repopulating 
    # @brief Retrieves all Feat data from the website and uses it to populate the Collection.
    # @return list of all created Feat objects.
    #
    def populate(force:bool=False):
        if force:
            CommonModel.empty(Feat)
        if Feat.objects().first() != None:
            print("Feat table already populated, skipping.")
            return

        feat_data = get('https://5e.tools/data/feats.json').json()

        feat_list = feat_data["feat"]

        feat_objects = []
        idnum = 1

        for feat in feat_list:
            get_attr = make_get_attr(feat)

            attr_map = {'id': idnum}

            for attr in [
                'name',
                'source',
                'entries',
                'additionalSpells',
                'otherSources',
                'page',
                'prerequisite',
                'ability',
                'skillProficiencies',
            ]:
                attr_map[attr] = get_attr(attr)

            print(idnum, attr_map['name'], attr_map['source'])

            # if attr_map['skillProficiencies']:
            #     attr_map['skillProficiencies'] = attr_map['skillProficiencies'][0]

            f = Feat()
            for attr in attr_map.keys():
                setattr(f, attr, attr_map[attr])

            f.save()
            feat_objects.append(f)
            idnum = idnum + 1
        
        return feat_objects
        

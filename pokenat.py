#! /usr/bin/env python3

import argparse
import pokebase
import json

from requests.exceptions import HTTPError

parser = argparse.ArgumentParser(allow_abbrev=False)

# load_group = parser.add_argument_group('Load', 'Use this to retrieve data from API (pokeapi.co).')
# load_group.add_argument("--load", type=bool, default=False)

# id_group = parser.add_argument_group('Identify', 'Permit to identify and organize your pokemon pc box.')
# id_group.add_argument("id", type=int, default="0")
# id_group.add_argument("-l", "--line", type=int, default=5)
# id_group.add_argument("-c", "--col", type=int, default=6)

group = parser.add_mutually_exclusive_group(required=True)
group.add_argument("--load", dest='load', action='store_true')
parser.add_argument("-f", "--force", dest='force', action='store_true')
parser.add_argument("-d", "--datafile", type=str, default='./data.json')
parser.add_argument("-i", "--indexfile", type=str, default='./index.json')
parser.add_argument("-n", "--language", action='store', dest='language', type=str, nargs='*', default=['fr', 'en'])
group.add_argument("--id", type=int)
group.add_argument("--name", type=str)
parser.add_argument("-l", "--line", type=int, default=5)
parser.add_argument("-c", "--col", type=int, default=6)

# UTILS #######################################################################

# from https://stackoverflow.com/questions/3173320/text-progress-bar-in-the-console
def printProgressBar(iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = '█', printEnd = "\r"):
    """
    Call in a loop to create terminal progress bar
    @params:
        iteration   - Required  : current iteration (Int)
        total       - Required  : total iterations (Int)
        prefix      - Optional  : prefix string (Str)
        suffix      - Optional  : suffix string (Str)
        decimals    - Optional  : positive number of decimals in percent complete (Int)
        length      - Optional  : character length of bar (Int)
        fill        - Optional  : bar fill character (Str)
        printEnd    - Optional  : end character (e.g. "\r", "\r\n") (Str)
    """
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    print(f'\r{prefix} |{bar}| {percent}% {suffix}', end = printEnd)
    # Print New Line on Complete
    if iteration == total: 
        print()

def print_chooser(match, data):

    for item in match:
        id_ralign = str(item["id"]).rjust(3)
        print("%s: %s" % (id_ralign, item["match"]))


def load_json_file(file):
    data = dict()
    try:
        with open(file, 'r') as data_file:
            data = json.load(data_file)
    except IOError as exc:
        print('File Exception : %s' % (exc))
    return data

def save_json_file(file, data):
    with open(file, 'w+') as data_file:
        json.dump(data, data_file)


# SERIALIZERS #################################################################

class PokemonSpeciesSerializer(json.JSONEncoder):
    def default(self, obj):
        global lang_wanted
        if isinstance(obj, pokebase.APIResource) and obj.endpoint == "pokemon-species":
            data = dict()
            data['id'] = str(obj.id)
            data['name'] = obj.name
            data["names"] = dict()
            for name in obj.names:
                if name.language.name in lang_wanted:
                    data["names"][name.language.name] = name.name.lower()
            data["pokedex"] = dict()
            for pokedex_nb in obj.pokedex_numbers:
                data["pokedex"][pokedex_nb.pokedex.name] = str(pokedex_nb.entry_number)
            return data

# CORE ########################################################################

def prepare(c_data, force=False):
    global lang_wanted
    d_pokedex = {}
    d_search = {}
    pokemon = None

    # get national pokedex
    pokedex = pokebase.pokedex('national')
    l_pokedex = len(pokedex.pokemon_entries)
    l_c_data = len(c_data)

    if not force and l_pokedex == l_c_data:
        print('Pokedex seems to be up to date (use --force).')
        exit(0)

    print("+ Process pokedex %s to local db :" % (pokedex.name))
    printProgressBar(0, l_pokedex, prefix = ' Progress:', suffix = 'Complete', length = 50)
    for i, pokemon_entry in enumerate(pokedex.pokemon_entries):
        id = pokemon_entry.entry_number
        pokemon = pokebase.pokemon_species(id)
        try:
            sprite = pokebase.SpriteResource('pokemon', id)
        except HTTPError as exc:
            print("Sprite error: %s" % exc)
            sprite = None
        #print(pokemon.id)

        d_pokedex[pokemon.id] = json.loads(PokemonSpeciesSerializer().encode(pokemon))
        if sprite:
            d_pokedex[pokemon.id]['sprite'] = sprite.url
        else:
            d_pokedex[pokemon.id]['sprite'] = ""
        for name in pokemon.names:
            if name.language.name in lang_wanted:
                d_search[name.name.lower()] = str(pokemon.id)
        
        # time.sleep(0.1)
        # Update Progress Bar
        printProgressBar(i + 1, l_pokedex, prefix = ' Progress:', suffix = 'Complete', length = 50)  

    return d_pokedex, d_search


def identify(data, id, line=5, col=6):
    num_by_box = line*col
    work_id = id - 1
    pk_box = (work_id // num_by_box)
    pos_in_box = work_id - (num_by_box * (work_id // num_by_box))
    pk_line = (pos_in_box // (col))
    pk_col = pos_in_box - (col * (pk_line))
#    pk_col = 0

    pokemon = data[str(id)]

    print("Pokedex National ID #%s" % (id))
    print("Pokemon: %s" % (pokemon['name']))
    print("Box: %s, line: %s, column: %s" % (pk_box + 1, pk_line + 1, pk_col + 1))


def search(index, text):
    match = list()
    for item, id in index.items():
        if item.__contains__(text):
            match.append({"id": id, "match": item})
    return match


if __name__ == "__main__":
    args = parser.parse_args()
    global lang_wanted
    lang_wanted = args.language

    data = load_json_file(args.datafile)
    nb_pokemons = len(data.keys())
    index = load_json_file(args.indexfile)

    if args.load :
        data, index = prepare(data, args.force)
        save_json_file(args.datafile, data)
        save_json_file(args.indexfile, index)
    else:

        if args.id:
            if args.id < 1:
                print("Pokemon id can't be under 1")
                exit(-1)
            identify(data, args.id, args.line, args.col)
        elif args.name:
            match = search(index, args.name)

            if len(match) > 1 :
                print("Search match with this selection :")
                print_chooser(match, data)
                ids = [int(item["id"]) for item in match]
                while True:
                    id = int(input('\nEnter id : '))
                    if id > 0 and id < nb_pokemons and id in ids:
                        break
                    else:
                        print('Not in selection or not in range.')
                identify(data, id, args.line, args.col)
            elif len(match) == 1:
                identify(data, int(match[0]["id"]), args.line, args.col)
            else:
                print("Pokemon not found in database (maybe language not supported).")
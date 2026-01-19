# Pokenat-organizer

This project is for all people with a little of psychorigidity with pokemon storage in pokemon games.
You can preview how manage your storage by national pokedex by box.

Demo : [Pokenat Organizer Demo](https://pokenat.demay.dev)

## Requirements

This project use two types of technologies, first I work on python for make organizer, and after all I make webui with vuejs.

- python 3.14
- nodejs 12.x
- yarn

### For Python Cli

With pdm
```console
for@bar:<project> $ pdm install
```

Without pdm
```console
foo@bar: <project> $ virtualenv -v venv -p python3
foo@bar: <project> $ pip install -r requirements.txt
```

### For Webui

```console
foo@bar:<project>/frontend $ yarn
```

## Python CLI

### Retrieve data from pokeapi.co

this part is requiered if you want to use webui. 

```-d DATAFILE``` : Name of file with pokeapi data for Webui   
```-i INDEXFILE``` : File for lexical research for Webui   
```-g LANGFILE``` : File for language for Webui
```-p POKEDEXFILE``` : File for pokedex configuration
```-n [LANGUAGE [LANGUAGE ...]]``` : Define language wanted on pokeapi   
```-f --force``` : Force retrieve data   

how to use:
```
foo@bar: <project> $ pdm run download_pokedex
```

### Basic usage

```--id ID``` : Select Pokemon by id
```--name NAME```: Search Pokemon by name (with proposition)

how to use:
```
foo@bar: <project> $ pdm run python3 pokenat.py --id 1
Pokedex National ID #1
Pokemon: bulbasaur
Box: 1, line: 1, column: 1

foo@bar: <project> $ pdm run python3 pokenat.py --name bulbasaur
Pokedex National ID #1
Pokemon: bulbasaur
Box: 1, line: 1, column: 1

foo@bar: <project> $ pdm python3 pokenat.py --name bul
Search match with this selection :
  1: bulbizarre
  1: bulbasaur
209: snubbull
210: granbull
303: mysdibule
548: chlorobule
736: larvibule
752: tarenbulle
787: tapu bulu

Enter id : 209
Pokedex National ID #209
Pokemon: snubbull
Box: 7, line: 5, column: 5
```

## Webui

You need to run python cli with --load option before use webui.
Then you need to copy retrieved files in frontend/public/api

```console
foo@bar:<project>/frontend $ cp ../data.json ./public/api/data.json
foo@bar:<project>/frontend $ cp ../index.json ./public/api/index.json
foo@bar:<project>/frontend $ cp ../lang.json ./public/api/lang.json
foo@bar:<project>/frontend $ cp ../pokedex.json ./public/api/pokedex.json
```

After that you can run webui with:

```console
foo@bar:<project>/frontend $ yarn dev
```

## Build



To build frontend you can use:

```console
foo@bar:<project>/frontend $ cp ../data.json ./public/api/data.json
foo@bar:<project>/frontend $ cp ../index.json ./public/api/index.json
foo@bar:<project>/frontend $ cp ../lang.json ./public/api/lang.json
foo@bar:<project>/frontend $ cp ../pokedex.json ./public/api/pokedex.json
foo@bar:<project>/frontend $ yarn build
```

This will generate dist/ folder with all files to deploy.


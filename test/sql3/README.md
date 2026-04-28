# TP3 SQLite et Python

Pour réaliser ce TP, nous reprendrons les tables GTFS du TP1.

Objectifs :
- Créer et interroger une base SQLite avec Python
- Automatiser / Scripter les tâches de création de base et d'import des données du TP1.
- Importer des données CSV avec Python
- Manipuler des données, importer, exporter des données au format CSV, JSON, XML.
- Réaliser des requêtes et des traitements sur leurs résultats


## Préparation de l'espace de travail 
Télécharger le fichier `init_db.py` et placer le dans votre espace de travail.
Télecharger le GTFS de Montbéliard, l'extraire dans votre espace de travail, utiliser le nom de répertoire `gtfs`

Votre espace de travail devrait ressembler à :
``` text
├── gtfs
│   ├── routes.txt
│   ├── stops.txt
│   ├── stop_times.txt
│   └── trips.txt
├── gtfs.db <-- facultatif avant l'exécution de init_db.py
└── init_db.py <-- script qui importe les données de gtfs/*.txt dans gtfs.db
```

Compléter le fichier `init_db.py` pour qu'il puisse créer les tables lorsque celles-ci n'existent pas dans la table. Les parties suivantes décrivent la démarche.

## Modification du script python init_db.py : Création de la base et import des données

- Analyser le script `init_db.py` et modifier le pour qu'il puisse créer les tables si elles n'existent pas.
- Voir fonction `create_tables(conn)`, s'inspirer du fichier `create_tables.sql` du TP1, privilégier l'emploi de `CREATE TABLE IF NOT EXISTS`
- Est-ce que des injections SQL sont possibles ?


### Déroulé du script init_db.py
Voici un résumé du script `init_db.py` :
- Tester si le fichier `gtfs.db` existe, sinon le créer
- Tester si la base gtfs.db contient les tables `routes`, `trips`, `stop_times`, `stops` sinon les créer
- Importer les données des fichiers csv (`routes.txt`, `trips.txt`, `stop_times.txt`, `stops.txt`)

## Noms des arrêts qui ont un identifiant qui commence par RT
Créer un script python qui permet d'obtenir tous les noms d'arrêts qui ont:
- leur id qui commencent par `RT`
- leur id qui contient `RT`
- leur id qui terminent par `RT`

Créer un script python qui permet de rechercher directement `%RT`, `%RT%` ou `RT%`, ou n'importe quelle chaîne.
Note : Il est possible de passer le caractère `%` dans la ligne de commande en utilisant des quotes.

## Exporter les arrêts
Créer un script python qui exporte les arrêts recherchés avec un `stop_id` ou un `stop_name`, au format CSV ou JSON.

Par exemple:
``` bash
python3 export_stops.py  --search "RT"  --mode anywhere --field stop_id --format json --output stops_export.json gtfs.db
```

Attention aux injections SQL!

``` json
python3 export_stops.py  --search "RT"  --mode anywhere --field stop_id --format json gtfs.db
[
    {
        "stop_id": "MART2",
        "stop_name": "MARTELET",
        "stop_lat": 47.537514328299594,
        "stop_lon": 6.876368522644043,
        "wheelchair_boarding": 0
    },
    {
        "stop_id": "MART",
        "stop_name": "MARTELET",
        "stop_lat": 47.53752881452934,
        "stop_lon": 6.876368522644043,
        "wheelchair_boarding": 0
    },
    {
        "stop_id": "RTHO",
        "stop_name": "RENE THOM",
        "stop_lat": 47.511415,
        "stop_lon": 6.795865,
        "wheelchair_boarding": 1
    }
]
```

## Importer des arrêts

Créer un fichier `stops2import.json` qui contient les arrêts suivants:
``` json
[
    {
        "stop_id": "RT01",
        "stop_name": "DIJSKTRA",
        "stop_lat": 47.537514328299594,
        "stop_lon": 6.876368522644043,
        "wheelchair_boarding": 0
    },
    {
        "stop_id": "RT02",
        "stop_name": "KLEINROCK",
        "stop_lat": 47.53752881452934,
        "stop_lon": 6.876368522644043,
        "wheelchair_boarding": 0
    },
    {
        "stop_id": "RT03",
        "stop_name": "BELL",
        "stop_lat": 47.511415,
        "stop_lon": 6.795865,
        "wheelchair_boarding": 1
    }
]
```

Créer un script `import_stops.py` qui permet d'importer des arrêts dans la base `gtfs.db`
Vérifier avec le script `search_stops.py` que les arrêts ont bien été ajouté à la table stops.

## Objectif final
- Créer un script qui prends en paramètre le nom d'une base sqlite avec des données GTFS et un nom d'arrêt de bus qui renvoit l'heure de passage du prochain bus. Exemple: `python3 when_bus.py gtfs.db CAMPUS` peut renvoyer `08:00:00`.


import json
import mysql.connector

host = "localhost"
database = "FCSM"
user = "root"
password = ""

filename = "donnees.json"

try:
    conn = mysql.connector.connect(
        host=host,
        database=database,
        user=user,
        password=password
    )

    cursor = conn.cursor()

    with open(filename, "r", encoding="utf-8") as file:
        data = json.load(file)

    # INSERT lieux
    query_lieu = """
    INSERT INTO lieu
    (id, nom, adresse, ville, type, code_postal, longitude, latitude)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """

    for lieu in data["lieux"]:
        cursor.execute(query_lieu, (
            lieu["id"],
            lieu["nom"],
            lieu["adresse"],
            lieu["ville"],
            lieu["type"],
            lieu["code_postal"],
            lieu["longitude"],
            lieu["latitude"]
        ))

    # INSERT étudiants
    query_etudiant = """
    INSERT INTO etudiant
    (id, nom, prenom, email, password, groupe)
    VALUES (%s, %s, %s, %s, %s, %s)
    """

    for etudiant in data["etudiants"]:
        cursor.execute(query_etudiant, (
            etudiant["id"],
            etudiant["nom"],
            etudiant["prenom"],
            etudiant["email"],
            etudiant["password"],
            etudiant["groupe"]
        ))

    # INSERT domiciles
    query_domicile = """
    INSERT INTO domicile
    (type, id_etudiant, id_lieu)
    VALUES (%s, %s, %s)
    """

    for domicile in data["domiciles"]:
        cursor.execute(query_domicile, (
            domicile["type"],
            domicile["id_etudiant"],
            domicile["id_lieu"]
        ))

    # INSERT véhicules
    query_vehicule = """
    INSERT INTO vehicule
    (id, immatriculation, nb_places, id_etudiant, marque, modele, date_ct, date_assurance)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """

    for vehicule in data["vehicules"]:
        cursor.execute(query_vehicule, (
            vehicule["id"],
            vehicule["immatriculation"],
            vehicule["nb_places"],
            vehicule["id_etudiant"],
            vehicule["marque"],
            vehicule["modele"],
            vehicule["date_ct"],
            vehicule["date_assurance"]
        ))

    # INSERT horaires
    query_horaire = """
    INSERT INTO horaire
    (id_etudiant, jour_semaine, heure_debut, heure_fin, id_lieu, type)
    VALUES (%s, %s, %s, %s, %s, %s)
    """

    for horaire in data["horaires"]:
        cursor.execute(query_horaire, (
            horaire["id_etudiant"],
            horaire["jour_semaine"],
            horaire["heure_debut"],
            horaire["heure_fin"],
            horaire["id_lieu"],
            horaire["type"]
        ))

    conn.commit()

    cursor.close()
    conn.close()

except:
    pass
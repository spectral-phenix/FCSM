#!/usr/bin/env python3

import sys
import sqlite3
import os
import csv
import json

def usage():
    print(f"Usage: {sys.argv[0]} <sqlite_db> <stops_file (csv|json)>")
    sys.exit(1)

def load_csv(path):
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return [
            (
                row.get("stop_id"),
                row.get("stop_name"),
                row.get("stop_lat"),
                row.get("stop_lon"),
                row.get("wheelchair_boarding"),
            )
            for row in reader
        ]

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return [
        (
            item.get("stop_id"),
            item.get("stop_name"),
            item.get("stop_lat"),
            item.get("stop_lon"),
            item.get("wheelchair_boarding"),
        )
        for item in data
    ]

def main():
    if len(sys.argv) != 3:
        usage()

    db_path = sys.argv[1]
    file_path = sys.argv[2]

    if not os.path.isfile(db_path):
        print(f"Error: database '{db_path}' not found.")
        sys.exit(1)

    if not os.path.isfile(file_path):
        print(f"Error: file '{file_path}' not found.")
        sys.exit(1)

    # Détection format
    if file_path.lower().endswith(".csv"):
        values = load_csv(file_path)
    elif file_path.lower().endswith(".json"):
        values = load_json(file_path)
    else:
        print("Error: file must be .csv or .json")
        sys.exit(1)

    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()

            query = """
                INSERT OR IGNORE INTO stops
                (stop_id, stop_name, stop_lat, stop_lon, wheelchair_boarding)
                VALUES (?, ?, ?, ?, ?)
            """

            cursor.executemany(query, values)
            conn.commit()

            print(f"{len(values)} stops imported.")

    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
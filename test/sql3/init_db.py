#!/usr/bin/env python3

import sys
import sqlite3
import os
import csv

GTFS_TABLES = {
    "stops": ("stops.txt", ["stop_id", "stop_name", "stop_lat", "stop_lon", "wheelchair_boarding"]),
    "routes": ("routes.txt", ["route_id", "route_short_name", "route_long_name", "route_color"]),
    "trips": ("trips.txt", ["route_id", "trip_id", "trip_headsign", "direction_id"]),
    "stop_times": ("stop_times.txt", ["trip_id", "arrival_time", "departure_time", "stop_id", "stop_sequence"])
}

def usage():
    print(f"Usage: {sys.argv[0]} <sqlite db> <gtfs_folder>")
    print(f"Example: {sys.argv[0]} gtfs.db /path/to/gtfs")
    sys.exit(1)

def create_tables(conn):
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Table: routes
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS routes (
            route_id TEXT PRIMARY KEY,
            route_short_name TEXT,
            route_long_name TEXT,
            route_color TEXT
        );
    """)

    # Table: trips
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trips (
            trip_id TEXT PRIMARY KEY,
            route_id TEXT NOT NULL,
            trip_headsign TEXT,
            direction_id INTEGER,
            FOREIGN KEY (route_id) REFERENCES routes(route_id)
        );
    """)

    # Table: stops
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stops (
            stop_id TEXT PRIMARY KEY,
            stop_name TEXT,
            stop_lat REAL,
            stop_lon REAL,
            wheelchair_boarding INTEGER
        );
    """)

    # Table: stop_times
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stop_times (
            trip_id TEXT NOT NULL,
            arrival_time TEXT,
            departure_time TEXT,
            stop_id TEXT NOT NULL,
            stop_sequence INTEGER NOT NULL,

            PRIMARY KEY (trip_id, stop_id, stop_sequence),

            FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
            FOREIGN KEY (stop_id) REFERENCES stops(stop_id)
        );
    """)
    conn.commit()

def list_tables(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name FROM sqlite_master
        WHERE type='table'
        ORDER BY name;
    """)
    tables = cursor.fetchall()
    if tables:
        print("Tables:")
        for table in tables:
            print(f"- {table[0]}")
    else:
        print("No tables found.")

def load_csv_to_table(conn, csv_path, table_name, columns):
    if not os.path.isfile(csv_path):
        print(f"Warning: {csv_path} not found. Skipping {table_name}.")
        return

    print(f"Loading {csv_path} into table '{table_name}'...")
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        values = []
        for row in reader:
            # Take only expected columns and convert empty strings to None
            record = [row.get(col) or None for col in columns]
            values.append(record)

    placeholders = ", ".join("?" for _ in columns)
    query = f"INSERT OR IGNORE INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"

    cursor = conn.cursor()
    cursor.executemany(query, values)
    conn.commit()
    print(f"{len(values)} rows inserted into '{table_name}'.")

def main():
    if len(sys.argv) != 3:
        usage()

    db_path = sys.argv[1]
    gtfs_folder = sys.argv[2]

    # Ensure database exists
    if not os.path.isfile(db_path):
        print(f"Database '{db_path}' does not exist. Creating it...")
        open(db_path, "w").close()
        print(f"Database '{db_path}' created.")

    # Connect to database
    try:
        with sqlite3.connect(db_path) as conn:
            create_tables(conn)
            list_tables(conn)

            # Load each GTFS file
            for table_name, (file_name, columns) in GTFS_TABLES.items():
                csv_path = os.path.join(gtfs_folder, file_name)
                load_csv_to_table(conn, csv_path, table_name, columns)

    

    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        sys.exit(1)

    print(f"GTFS data loaded successfully into '{db_path}'.")

if __name__ == "__main__":
    main()

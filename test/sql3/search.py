#!/usr/bin/env python3

import sys
import sqlite3
import os

def usage():
    print(f"Usage: {sys.argv[0]} <sqlite_db> <LIKE_pattern>")
    print("Examples:")
    print(f"  {sys.argv[0]} gtfs.db 'RT%'")
    sys.exit(1)

def main():
    if len(sys.argv) != 3:
        usage()

    db_path = sys.argv[1]
    pattern = sys.argv[2]

    if not os.path.isfile(db_path):
        print(f"Error: database '{db_path}' not found.")
        sys.exit(1)

    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()

            query = """
                SELECT stop_id, stop_name
                FROM stops
                WHERE stop_id LIKE ?
                ORDER BY stop_id;
            """

            cursor.execute(query, (pattern,))
            results = cursor.fetchall()

            if results:
                print(f"{len(results)} result(s) found:\n")
                for stop_id, stop_name in results:
                    print(f"{stop_id} - {stop_name}")
            else:
                print("No matching stops found.")

    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
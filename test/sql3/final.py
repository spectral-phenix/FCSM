#!/usr/bin/env python3

import sys
import sqlite3
import os
from datetime import datetime

def usage():
    print(f"Usage: {sys.argv[0]} <sqlite_db> <stop_name>")
    sys.exit(1)

def main():
    if len(sys.argv) != 3:
        usage()

    db_path = sys.argv[1]
    stop_name = sys.argv[2]

    if not os.path.isfile(db_path):
        print(f"Error: database '{db_path}' not found.")
        sys.exit(1)

    now = datetime.now().strftime("%H:%M:%S")

    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()

            query = """
                SELECT st.arrival_time
                FROM stop_times st
                JOIN stops s ON st.stop_id = s.stop_id
                WHERE s.stop_name = ?
                  AND st.arrival_time > ?
                ORDER BY st.arrival_time ASC
                LIMIT 1;
            """

            cursor.execute(query, (stop_name, now))
            result = cursor.fetchone()

            if result:
                print(result[0])
            else:
                print("No upcoming bus found.")

    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
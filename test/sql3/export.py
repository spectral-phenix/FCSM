#!/usr/bin/env python3
"""
export_stops.py

Exporte des arrêts (table stops) filtrés par stop_id ou stop_name, en CSV ou JSON.

Exemples :
  python3 export_stops.py --search "RT" --mode anywhere --field stop_id --format json --output stops_export.json gtfs.db
  python3 export_stops.py --search "RT" --mode anywhere --field stop_id --format json gtfs.db
  python3 export_stops.py --search "Gare" --mode prefix --field stop_name --format csv --output stops.csv gtfs.db

Sécurité / injections SQL :
- Les valeurs (search) sont passées via placeholders (?).
- Les identifiants SQL (field/colonnes) ne sont JAMAIS interpolés depuis l'entrée utilisateur :
  on utilise une whitelist (stop_id, stop_name).
"""

import argparse
import csv
import json
import os
import sqlite3
import sys
from typing import List, Dict, Any, Optional


ALLOWED_FIELDS = {"stop_id", "stop_name"}
ALLOWED_MODES = {"prefix", "suffix", "anywhere", "exact"}
ALLOWED_FORMATS = {"json", "csv"}


def build_like_pattern(search: str, mode: str) -> str:
    if mode == "prefix":
        return f"{search}%"
    if mode == "suffix":
        return f"%{search}"
    if mode == "anywhere":
        return f"%{search}%"
    # exact
    return search


def fetch_stops(conn: sqlite3.Connection, field: str, search: str, mode: str) -> List[Dict[str, Any]]:
    # Sécurisation
    if field not in ALLOWED_FIELDS:
        raise ValueError(f"Invalid field: {field}. Allowed: {sorted(ALLOWED_FIELDS)}")
    if mode not in ALLOWED_MODES:
        raise ValueError(f"Invalid mode: {mode}. Allowed: {sorted(ALLOWED_MODES)}")
    
    cursor = conn.cursor()

    if mode == "exact":
        sql = f"""
            SELECT stop_id, stop_name, stop_lat, stop_lon, wheelchair_boarding
            FROM stops
            WHERE {field} = ?
            ORDER BY stop_id;
        """
        cursor.execute(sql, (search,))

    else:
        pattern = build_like_pattern(search, mode)
        sql = f"""
            SELECT stop_id, stop_name, stop_lat, stop_lon, wheelchair_boarding
            FROM stops
            WHERE {field} LIKE ?
            ORDER BY stop_id;
        """
        cursor.execute(sql, (pattern,))

    rows = cursor.fetchall()
    results: List[Dict[str, Any]] = []
    for stop_id, stop_name, stop_lat, stop_lon, wheelchair_boarding in rows:
        results.append(
            {
                "stop_id": stop_id,
                "stop_name": stop_name,
                "stop_lat": stop_lat,
                "stop_lon": stop_lon,
                "wheelchair_boarding": wheelchair_boarding,
            }
        )
    return results


def export_json(data: List[Dict[str, Any]], output: Optional[str]) -> None:
    text = json.dumps(data, ensure_ascii=False, indent=4)
    if output:
        with open(output, "w", encoding="utf-8") as f:
            f.write(text)
    else:
        print(text)


def export_csv(data: List[Dict[str, Any]], output: Optional[str]) -> None:
    fieldnames = ["stop_id", "stop_name", "stop_lat", "stop_lon", "wheelchair_boarding"]

    if output:
        f = open(output, "w", encoding="utf-8", newline="")
        close_after = True
    else:
        f = sys.stdout
        close_after = False

    try:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            writer.writerow(row)
    finally:
        if close_after:
            f.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export GTFS stops filtered by stop_id or stop_name (CSV/JSON)."
    )
    parser.add_argument("db", help="Path to sqlite database (e.g. gtfs.db)")

    parser.add_argument("--search", required=True, help="Search string (e.g. RT)")
    parser.add_argument(
        "--mode",
        choices=sorted(ALLOWED_MODES),
        default="anywhere",
        help="Match mode: prefix (RT%%), suffix (%%RT), anywhere (%%RT%%), exact",
    )
    parser.add_argument(
        "--field",
        choices=sorted(ALLOWED_FIELDS),
        default="stop_id",
        help="Field to search in: stop_id or stop_name",
    )
    parser.add_argument(
        "--format",
        choices=sorted(ALLOWED_FORMATS),
        default="json",
        help="Output format: json or csv",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Output file path. If omitted, prints to stdout.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not os.path.isfile(args.db):
        print(f"Error: database '{args.db}' not found.", file=sys.stderr)
        sys.exit(1)

    try:
        with sqlite3.connect(args.db) as conn:
            data = fetch_stops(conn, args.field, args.search, args.mode)

        if args.format == "json":
            export_json(data, args.output)
        else:
            export_csv(data, args.output)

    except sqlite3.Error as e:
        print(f"SQLite error: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"Argument error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
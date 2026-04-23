from openlocationcode import openlocationcode as olc
from geopy.geocoders import Nominatim
import csv
import re
import time

CITY_ANCHORS = {
    "Sandusky": (41.4489, -82.7080),
    "Santa Clarita": (34.4200, -118.5600),
    "Gurnee": (42.3703, -87.9020),
    "Mason": (39.3601, -84.3099),
    "Kings Mills": (39.3562, -84.2505),
    "Vaughan": (43.8364, -79.5078),
    "Charlotte": (35.2271, -80.8431),
    "Fort Mill": (35.0074, -80.9451),
    "Hershey": (40.2859, -76.6502),
    "Jackson Township": (40.1030, -74.3541),
    "Cream Ridge": (40.1472, -74.4925),
    "Eureka": (38.5026, -90.6285),
    "Corfu": (42.9601, -78.4025),
    "Darien Center": (42.9014, -78.3842),
    "Arlington": (32.7357, -97.1081),
    "Austell": (33.8126, -84.5822),
    "San Antonio": (29.4241, -98.4936),
    "Agawam": (42.0695, -72.6151),
    "Rochester": (43.1566, -77.6088),
    "Irondequoit": (43.2163, -77.5878),
    "Farmington": (40.9805, -111.8874),
    "Glenwood Springs": (39.5505, -107.3248),
    "Anaheim": (33.8366, -117.9143),
    "Lake Buena Vista": (28.3772, -81.5161),
    "Bay Lake": (28.3878, -81.5721),
    "Salem": (42.7884, -71.2006),
    "Conway": (44.0537, -71.1212),
    "Jefferson": (44.4172, -71.4746),
    "Old Orchard Beach": (43.5151, -70.3756),
    "Saco": (43.5009, -70.4431),
    "West Mifflin": (40.3667, -79.8833),
    "Middlebury": (41.5282, -73.1237),
    "Bristol": (41.6718, -72.9493),
    "Orlando": (28.5383, -81.3792),
    "San Diego": (32.7157, -117.1611),
    "Waterloo": (42.4928, -92.3407),
    "Elysburg": (40.8631, -76.5519),
    "Lancaster": (40.0379, -76.3055),
    "Universal City": (34.1381, -118.3534),
}


geolocator = Nominatim(user_agent="thrillranker")

# -----------------------------
# helpers
# -----------------------------

def extract_code(text):
    """Find Plus Code inside messy string."""
    match = re.search(r"[23456789CFGHJMPQRVWX]{4,}\+[23456789CFGHJMPQRVWX]{2,}", text.upper())
    return match.group(0) if match else None


def extract_city(text):
    """Try to extract known city from string."""
    for city in CITY_ANCHORS:
        if city.lower() in text.lower():
            return city
    return None


def geocode_city(city):
    """Fallback geocoder if city not in anchors."""
    try:
        loc = geolocator.geocode(city)
        if loc:
            return (loc.latitude, loc.longitude)
    except:
        pass
    return None


def resolve_plus_code(code, city):
    """
    Handle short + full codes properly.
    """

    # FULL CODE → decode directly
    if olc.isFull(code):
        d = olc.decode(code)
        return (d.latitudeCenter, d.longitudeCenter)

    # SHORT CODE → must recover
    if city in CITY_ANCHORS:
        lat, lng = CITY_ANCHORS[city]
        full = olc.recoverNearest(code, lat, lng)
        d = olc.decode(full)
        return (d.latitudeCenter, d.longitudeCenter)

    # fallback if no anchor
    geo = geocode_city(city)
    if geo:
        full = olc.recoverNearest(code, geo[0], geo[1])
        d = olc.decode(full)
        return (d.latitudeCenter, d.longitudeCenter)

    return None


def resolve_location(raw):
    """
    Main resolver for each CSV row.
    """

    code = extract_code(raw)
    city = extract_city(raw)

    # CASE 1: Plus code exists
    if code:
        if not city:
            city = "Unknown"

        result = resolve_plus_code(code, city)
        return result

    # CASE 2: no code → try geocode city directly
    if city:
        return geocode_city(city)

    return None



temp = []
final = []
with open("locations.csv", newline="") as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        if not row:
            continue
        temp.append(row[0])
print("File opened, now calculating.....")
for i in temp:

    result = resolve_location(i)
    if result:
        final.append(result)
    else:
        final.append("NULL")

    time.sleep(0.5)  # be nice to geocoder if used

    with open("convertedLocations.txt","w", encoding="utf-8") as file:
        for loc in final:
            file.write(str(loc))
            file.write("\n")



print("\nDONE")
print(final)
# huff implementation
import folium
import geopandas
import pandas as pd
import math

'''keeping code for future refrence, we will use this for a better user page'''
roc = [43.15, -77.610]

df = pd.read_csv("huff_parks.csv")
m = folium.Map(location=roc, zoom_start=12)
# huff time
'''
pij = 
where :
A j {\displaystyle A_{j}} is a measure of the attractiveness of store j
D i j {\displaystyle D_{ij}} is the distance from the consumer's location, i, to store j.
α {\displaystyle \alpha } is an attractiveness parameter
β {\displaystyle \beta } is a distance decay parameter
n {\displaystyle n} is the total number of stores, including store j
https://en.wikipedia.org/wiki/Huff_model
'''
def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return R * c
# -------------------------
# HUFF PARAMETERS
# -------------------------
alpha = 1   # attractiveness weight
beta = 2    # distance decay

# Compute distance from ROC
df["distance"] = df.apply(
    lambda r: haversine(roc[0], roc[1], r["latitude"], r["longitude"]),
    axis=1
)

# Avoid divide-by-zero
df["distance"] = df["distance"].replace(0, 0.1)

# Attractiveness (you can upgrade this later)
df["A"] = df["Coasters"]

# Raw Huff numerator
df["huff_raw"] = (df["A"] ** alpha) / (df["distance"] ** beta)

# Normalize into probabilities
df["huff_prob"] = df["huff_raw"] / df["huff_raw"].sum()

# -------------------------
# MAP
# -------------------------


folium.Marker(
    location=roc,
    popup="Rochester",
    tooltip="roc"
).add_to(m)

for _, row in df.iterrows():
    popup_text = f"""
    <b>{row['name']}</b><br>
    {row['city']}, {row['state']}<br>
    Coasters: {row['Coasters']}<br>
    Distance: {row['distance']:.1f} mi<br>
    Huff Prob: {row['huff_prob']:.4f}
    """

    folium.CircleMarker(
        location=[row["latitude"], row["longitude"]],
        radius=min(20, 5 + row["huff_prob"] * 200),
        popup=folium.Popup(popup_text, max_width=300),
        tooltip=f"{row['name']} ({row['huff_prob']:.3f})",
        fill=True
    ).add_to(m)


# Save to HTML file
m.save("roc_huff.html")
''''''
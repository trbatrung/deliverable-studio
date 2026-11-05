# Builds media/world-dots.svg, the homepage hero's dot map.
# Needs: pip install global-land-mask numpy
# Run:   python media/src/make-world-dots.py media/world-dots.svg
# Prints the Ho Chi Minh City marker position for index.html (.hm-home).
import sys
from global_land_mask import globe
out = sys.argv[1]
STEP = 2.0            # degrees per cell
PITCH, DOT = 8, 5     # svg units per cell, square size
LAT_N, LAT_S, LON_W, LON_E = 78, -56, -180, 180
cols = int((LON_E - LON_W) / STEP); rows = int((LAT_N - LAT_S) / STEP)
parts = []
n = 0
# Metros of 5 million or more in high-income, tech and service-led economies
# (the buyers Deliverable serves). Home (Ho Chi Minh City) is drawn in HTML.
CITIES = [
  ("New York",40.71,-74.01),("Los Angeles",34.05,-118.24),("Chicago",41.88,-87.63),
  ("Dallas",32.78,-96.80),("Houston",29.76,-95.37),("Washington",38.91,-77.04),
  ("Philadelphia",39.95,-75.17),("Miami",25.76,-80.19),("Atlanta",33.75,-84.39),
  ("Boston",42.36,-71.06),("San Francisco Bay Area",37.77,-122.42),("Toronto",43.65,-79.38),
  ("London",51.51,-0.13),("Paris",48.86,2.35),("Madrid",40.42,-3.70),
  ("Barcelona",41.39,2.17),("Berlin",52.52,13.40),
  ("Tokyo",35.68,139.69),("Osaka",34.69,135.50),("Seoul",37.57,126.98),
  ("Taipei",25.03,121.57),("Hong Kong",22.32,114.17),("Singapore",1.35,103.82),
  ("Sydney",-33.87,151.21),("Melbourne",-37.81,144.96),
]
city_cells = {(int((LAT_N-lat)/STEP), int((lon-LON_W)/STEP)) for _,lat,lon in CITIES}
amber = []
for r in range(rows):
    lat = LAT_N - (r + 0.5) * STEP
    for c in range(cols):
        lon = LON_W + (c + 0.5) * STEP
        q = STEP / 4
        if (r, c) in city_cells:
            amber.append(f"M{c*PITCH} {r*PITCH}h{DOT}v{DOT}h-{DOT}z"); continue
        if any(globe.is_land(lat + dy, lon + dx) for dx in (-q, q) for dy in (-q, q)):
            parts.append(f"M{c*PITCH} {r*PITCH}h{DOT}v{DOT}h-{DOT}z")
            n += 1
W, H = cols * PITCH, rows * PITCH
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><path fill="#CDCBC0" d="{"".join(parts)}"/><path fill="#E8940A" d="{"".join(amber)}"/></svg>\n'
open(out, "w").write(svg)
print("dots", n, "cities", len(amber), "of", len(CITIES), "size", len(svg), "viewBox", W, H)
for name, lat, lon in [("hcmc", 10.82, 106.63)]:
    c = int((lon - LON_W) / STEP); r = int((LAT_N - lat) / STEP)
    x = (c * PITCH + DOT / 2) / W * 100; y = (r * PITCH + DOT / 2) / H * 100
    print(f"{name}: left {x:.2f}% top {y:.2f}%")

import csv
from shapely import wkb
import binascii
# not vibe coded, human code!!!
long = []
lat = []
temp = []
print("File opened, reading....")
try:
    with open("parks.csv", newline="") as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            if row:
                temp.append(wkb.loads(binascii.unhexlify(row[0])))
except FileNotFoundError:
    print("File not found!")


for value in temp:
    t = str(value)
    # print(t.replace("<POINT ", ""))
    long.append(t.replace("<POINT ", "").split()[1].strip('('))
    lat.append(t.replace("<POINT ", "").split()[2].strip(')'))
print(long)
print(lat)

with open('final_wkbtolonglat.csv', 'w', newline='') as csvfile:
    fieldnames = ['longitude', 'latitude']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    i = 0
    for long_value in long:
        writer.writerow({'longitude': long_value, 'latitude': lat[i]})
        i = i + 1
print('File Created look for final_wkbtolonglat.csv ')
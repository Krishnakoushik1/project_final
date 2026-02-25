import sys
import os
import pydicom
import numpy as np
from PIL import Image

input_folder = sys.argv[1]
output_folder = sys.argv[2]

# Sort files naturally (1.dcm, 2.dcm ... 100.dcm)
files = sorted(os.listdir(input_folder))

converted_files = []

for i, filename in enumerate(files):
    file_path = os.path.join(input_folder, filename)

    try:
        ds = pydicom.dcmread(file_path)
        pixel_array = ds.pixel_array

        pixel_array = pixel_array.astype(float)
        scaled = (np.maximum(pixel_array, 0) / pixel_array.max()) * 255.0
        scaled = np.uint8(scaled)

        img = Image.fromarray(scaled)

        new_name = f"slice_{i:03}.png"
        output_path = os.path.join(output_folder, new_name)

        img.save(output_path, format="PNG")
        converted_files.append(new_name)

    except:
        pass

for file in converted_files:
    print(file)
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert("RGB") for f in files]
w, h = ims[0].size
portrait = h > w
tw, th = (w // 2, h // 2) if not portrait else (w * 2 // 3, h * 2 // 3)
cols = (5 if portrait else 3) if len(ims) > 4 else 2
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * th), "black")
d = ImageDraw.Draw(sheet)
for k, (im, f) in enumerate(zip(ims, files)):
    x, y = (k % cols) * tw, (k // cols) * th
    sheet.paste(im.resize((tw, th)), (x, y))
    fr = int(f.rsplit("f", 1)[1].split(".")[0])
    d.rectangle([x, y, x + 150, y + 22], fill="black")
    d.text((x + 6, y + 5), f"f{fr} {fr/60:.2f}s", fill="white")
sheet.save(out, quality=88)

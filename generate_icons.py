import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    # Create image with black background
    img = Image.new('RGB', (size, size), color='black')
    draw = ImageDraw.Draw(img)
    
    # Try to load a clean sans-serif system font, otherwise default to basic font
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/SFCompact.ttf"
    ]
    
    font = None
    for path in font_paths:
        if os.path.exists(path):
            try:
                # Approximate font size based on image size
                font = ImageFont.truetype(path, int(size * 0.7))
                break
            except Exception:
                continue
                
    if font is None:
        font = ImageFont.load_default()
        
    # Draw character 'Z' in white, centered
    text = "Z"
    
    # In Pillow 8.0+, we can use textbbox to get dimensions, or fallback to textsize
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
    except AttributeError:
        # Fallback for older Pillow versions
        w, h = draw.textsize(text, font=font)
        
    x = (size - w) / 2
    # Adjust y-offset slightly to center visually
    y = (size - h) / 2 - (size * 0.05)
    
    draw.text((x, y), text, fill='white', font=font)
    
    # Save the file
    img.save(filename)
    print(f"Created {filename} ({size}x{size})")

def main():
    os.makedirs("icons", exist_ok=True)
    create_icon(16, "icons/icon-16.png")
    create_icon(48, "icons/icon-48.png")
    create_icon(128, "icons/icon-128.png")

if __name__ == "__main__":
    main()

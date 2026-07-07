from PIL import Image, ImageDraw, ImageFilter

def build_perfect_mockup():
    print("Generating perfect 3D book texture (680x900)...")
    
    # Canvas matches the new 34:45 UI format perfectly
    width, height = 680, 900
    
    # 1. Base transparent canvas (No more white fields)
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    
    # 2. Main Book Block Layer
    book_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    book_draw = ImageDraw.Draw(book_layer)
    
    # Draw the book shape with 6px rounded corners
    book_draw.rounded_rectangle([0, 0, width-1, height-1], radius=6, fill=(250, 250, 250, 255))
    
    # 3. Spine Curve (Shadow gradient on the far left edge)
    for x in range(0, 25):
        factor = x / 25.0
        color = int(180 + 70 * factor) # Fades from dark gray to white
        book_draw.line([(x, 0), (x, height)], fill=(color, color, color, 255), width=1)
        
    # 4. Spine Hinge / Crease 
    # PERFECT MATCH: Set exactly to 75px to align with your spine_w!
    hinge_center = 75
    for x in range(hinge_center - 12, hinge_center + 12):
        dist = abs(hinge_center - x)
        darkness = 255 - int(50 * (1 - dist / 12.0))
        book_draw.line([(x, 0), (x, height)], fill=(darkness, darkness, darkness, 255), width=1)
        
    # 5. Lighting Gradient across the flat cover
    for x in range(hinge_center + 12, width):
        factor = (x - (hinge_center + 12)) / float(width - (hinge_center + 12))
        color = int(245 + 10 * factor)
        book_draw.line([(x, 0), (x, height)], fill=(color, color, color, 255), width=1)
        
    # 6. Edge Highlights (Crisp borders)
    book_draw.line([(0, 0), (width, 0)], fill=(255, 255, 255, 150), width=2)   # Top highlight
    book_draw.line([(width-2, 0), (width-2, height)], fill=(210, 210, 210, 150), width=2)  # Right edge shadow
    book_draw.line([(0, height-2), (width, height-2)], fill=(230, 230, 230, 150), width=2) # Bottom shadow
    
    # Combine layers
    final = Image.alpha_composite(img, book_layer)
    
    # Save precisely as the required filename
    final.save("image_cff9c3.png")

if __name__ == "__main__":
    build_perfect_mockup()
    print("SUCCESS: 'image_cff9c3.png' has been created in your directory.")
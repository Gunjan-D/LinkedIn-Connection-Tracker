from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create image with professional Teal gradient background
    img = Image.new('RGB', (size, size), color='#00897b')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient effect (simple approximation)
    for i in range(size):
        # Gradient from #00897b to #00695c
        r = int(0 - (0 - 0) * (i / size))
        g = int(137 - (137 - 105) * (i / size))
        b = int(123 - (123 - 92) * (i / size))
        draw.rectangle([(0, i), (size, i+1)], fill=f'#{r:02x}{g:02x}{b:02x}')
    
    # Draw white circle
    circle_radius = int(size * 0.35)
    center = size // 2
    draw.ellipse(
        [(center - circle_radius, center - circle_radius),
         (center + circle_radius, center + circle_radius)],
        fill='white'
    )
    
    # Draw text "100" or counter lines
    if size >= 48:
        try:
            # Try to use a nice font
            font = ImageFont.truetype("arial.ttf", int(size * 0.25))
        except:
            font = ImageFont.load_default()
        
        text = "100"
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        text_x = (size - text_width) // 2
        text_y = (size - text_height) // 2 - int(size * 0.02)
        
        draw.text((text_x, text_y), text, fill='#00897b', font=font)
    else:
        # For small icon, draw simple counter lines
        line_width = int(size * 0.3)
        line_height = int(size * 0.05)
        start_x = (size - line_width) // 2
        
        for i, y_pos in enumerate([0.4, 0.5, 0.6]):
            y = int(size * y_pos)
            draw.rectangle(
                [(start_x, y), (start_x + line_width, y + line_height)],
                fill='#00897b'
            )
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"✓ Created {filename}")

# Generate all three icon sizes
script_dir = os.path.dirname(os.path.abspath(__file__))
icons_dir = os.path.join(script_dir, 'icons')

sizes = [16, 48, 128]
for size in sizes:
    filename = os.path.join(icons_dir, f'icon{size}.png')
    create_icon(size, filename)

print("\n✅ All icons generated successfully!")
print(f"Icons saved in: {icons_dir}")



import os
import random
import textwrap
import urllib.parse
import urllib.request
import ssl
import time
import json
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageEnhance
import certifi
from cursor_llm import ask_json

# --- CONFIGURATION ---
# Art direction via cursor-agent (see cursor_llm.py). No Groq/OpenAI key required.

_SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())

_FONT_BOLD = [
    "Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "arialbd.ttf",
]
_FONT_REGULAR = [
    "Arial.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "arial.ttf",
]


def load_font(size: int, variant: str = "bold") -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    paths = _FONT_BOLD if variant == "bold" else _FONT_REGULAR
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    print(f"    Warning: no {variant} font found, using fallback (size {size})")
    return ImageFont.load_default()


# Spine width (px) and minimum inset so illustrations/text stay on the front panel.
SPINE_W = 75
FRONT_GUTTER = 36

# Appended to every illustration prompt — pushes Flux away from glossy AI renders.
ART_PRINT_SUFFIX = (
    "editorial book cover graphic, limited color palette, matte ink, paper grain, "
    "simple symbolic composition, flat shapes, not photorealistic, not 3D render, "
    "no faces, no people"
)


class BookGenerator:
    # --- CHANGED: width=680 for the new 34:45 UI ratio ---
    def __init__(self, width=680, height=900, use_3d=True):
        self.width, self.height = width, height
        self.cream = (255, 253, 240) # Classic Penguin off-white
        self.use_3d = use_3d
        self.concept_cache = {}

    def _wrap_layout(self):
        """Canvas geometry: spine + front panel with safe content inset."""
        spine_w = SPINE_W
        full_w = self.width + spine_w
        fc_left = spine_w
        fc_center = fc_left + (self.width // 2)
        content_left = fc_left + FRONT_GUTTER
        content_right = full_w - FRONT_GUTTER
        content_width = content_right - content_left
        return {
            "spine_w": spine_w,
            "full_w": full_w,
            "fc_left": fc_left,
            "fc_center": fc_center,
            "content_left": content_left,
            "content_right": content_right,
            "content_width": content_width,
        }

    def _fill_spine(self, draw, color, height=None):
        """Paint spine strip only — keeps generated art off the spine."""
        height = height or self.height
        draw.rectangle([0, 0, SPINE_W, height], fill=color)

    def _font_for_width(
        self,
        text: str,
        max_width: int,
        start_size: int,
        variant: str = "bold",
        min_size: int = 12,
    ):
        probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))
        for size in range(start_size, min_size - 1, -2):
            font = load_font(size, variant)
            bbox = probe.textbbox((0, 0), text, font=font)
            if bbox[2] - bbox[0] <= max_width:
                return font
        return load_font(min_size, variant)

    def _paste_spine_labels(
        self,
        img,
        title: str,
        author: str,
        *,
        title_fill,
        author_fill,
        title_pos: int = 350,
        author_pos: int = 700,
        start_size: int = 22,
    ):
        """Rotated spine text — shrink font so glyphs fit inside SPINE_W."""
        spine_text_img = Image.new("RGBA", (900, SPINE_W), (0, 0, 0, 0))
        spine_draw = ImageDraw.Draw(spine_text_img)
        probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))

        def spine_font(text: str):
            for size in range(start_size, 9, -2):
                font = load_font(size, "bold")
                bbox = probe.textbbox((0, 0), text, font=font)
                if (bbox[3] - bbox[1]) <= SPINE_W - 6:
                    return font
            return load_font(9, "bold")

        spine_title = title.upper()
        spine_author = author.upper()
        spine_draw.text(
            (author_pos, SPINE_W // 2),
            spine_author,
            fill=author_fill,
            font=spine_font(spine_author),
            anchor="mm",
        )
        spine_draw.text(
            (title_pos, SPINE_W // 2),
            spine_title,
            fill=title_fill,
            font=spine_font(spine_title),
            anchor="mm",
        )
        spine_text_img = spine_text_img.rotate(90, expand=True)
        img.paste(spine_text_img, (0, 0), spine_text_img)

    def get_visual_concept(self, title, author):
        """Art Director: Decides WHAT objects to draw on the cover."""
        cache_key = f"{title}_{author}"
        if cache_key in self.concept_cache:
            return self.concept_cache[cache_key]
            
        print(f" -> Asking Art Director (cursor-agent) for objects for '{title}'...")
        try:
            data = ask_json(
                "You are a book cover art director. Output JSON: {\"subject\": \"description of the scene\"}.",
                f"Name 1-3 simple everyday objects that symbolize '{title}' by {author}. "
                "Concrete nouns only (e.g. compass, ladder, coin). "
                "No people, no faces, no animals, no surreal scenes. "
                "No art-style keywords like painting or vector.",
            )
            concept = data.get("subject", title)
            
            print(f"    Concept chosen: '{concept}'")
            self.concept_cache[cache_key] = concept
            return concept
            
        except Exception as e:
            print(f"    !! Art director failed, falling back to title. Error: {e}")
            return title

    def get_recommended_style(self, title, author):
        """Layout Director: Decides WHICH template fits best."""
        print(f" -> Consulting Layout Director (cursor-agent) for '{title}'...")
        try:
            data = ask_json(
                (
                    "You are a book cover art director. Choose one style:\n"
                    "2. 'ast': negative sci-fi, dystopian, surreal, historical, moody\n"
                    "3. 'marber': crime, mystery, thriller, suspense, noir\n"
                    "4. 'faber': positive, poetry, literary, artsy, introspective\n"
                    "5. 'penguin': everything else\n"
                    'Output JSON: {"style": "ast|marber|faber|penguin"}'
                ),
                f"Book: '{title}' by {author}",
            )
            chosen_style = data.get("style", "penguin").lower()
            
            # Ensure it's one of the valid options just to be safe
            if chosen_style not in ['penguin', 'ast', 'marber', 'faber']:
                chosen_style = 'penguin'
                
            print(f"    Style chosen: '{chosen_style.upper()}'")
            return chosen_style
            
        except Exception as e:
            print(f"    !! Style selection failed, defaulting to PENGUIN. Error: {e}")
            return "penguin"

    def _stylize_art(self, img: Image.Image) -> Image.Image:
        """Mute saturation and soften detail so Flux output reads more like print."""
        img = img.convert("RGB")
        img = ImageEnhance.Color(img).enhance(0.7)
        img = ImageEnhance.Contrast(img).enhance(1.06)
        img = ImageEnhance.Sharpness(img).enhance(0.82)
        return img

    def get_ai_art(self, title, image_style, author=""):
        """Uses a Free Flux/Puter-grade engine, guided by Gemini."""
        clean_title = title.strip()
        
        concept = self.get_visual_concept(clean_title, author)
        
        full_prompt = urllib.parse.quote(
            f"{concept}, {image_style}, {ART_PRINT_SUFFIX}, no text, no letters"
        )
        
        seed = random.randint(1, 1000000)
        # --- CHANGED: Added &enhance=false so Pollinations respects our concept ---
        url = f"https://image.pollinations.ai/prompt/{full_prompt}?width=512&height=512&seed={seed}&model=flux&nologo=true&enhance=false"
        
        print(f" -> AI is drawing... (please wait)")

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://pollinations.ai/'
        }

        for attempt in range(3):
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=40, context=_SSL_CONTEXT) as response:
                    img_data = response.read()
                    if len(img_data) > 10000:
                        return self._stylize_art(Image.open(BytesIO(img_data)))
                print(f"    ...Attempt {attempt+1} busy or failed. Waiting 3s...")
                time.sleep(3)
            except Exception as e:
                print(f"    Error: {e}")
                time.sleep(2)

        print(" !! All AI attempts failed. Creating a colored placeholder.")
        return Image.new('RGB', (512, 512), color=(random.randint(40,140), 80, 120))

    def draw_wrapped_text(
        self,
        draw,
        text,
        x,
        y,
        font,
        fill="black",
        max_width=500,
        min_font_size=32,
        line_spacing=12,
    ):
        """Wraps text and shrinks font size if it's too wide for the cover."""
        current_font = font
        lines = textwrap.wrap(text, width=16)

        while True:
            too_wide = False
            for line in lines:
                bbox = draw.textbbox((0, 0), line, font=current_font)
                if (bbox[2] - bbox[0]) > max_width:
                    too_wide = True
                    break

            if too_wide and current_font.size > min_font_size:
                next_size = current_font.size - 4
                variant = "regular" if "arial" in str(getattr(font, "path", "")).lower() and "bold" not in str(getattr(font, "path", "")).lower() else "bold"
                current_font = load_font(next_size, variant)
                lines = textwrap.wrap(text, width=18 + (font.size - next_size) // 4)
            else:
                break

        block_height = len(lines) * (current_font.size + line_spacing) - line_spacing
        y = y - block_height // 2

        for line in lines:
            draw.text((x, y + current_font.size // 2), line, fill=fill, font=current_font, anchor="mm")
            y += current_font.size + line_spacing

    def apply_3d_mockup(self, cover_image):
        """Applies a 1:1 shading overlay to the flat cover, preserving rounded transparent corners."""
        try:
            mockup = Image.open("image_cff9c3.png").convert("RGBA")
        except FileNotFoundError:
            return cover_image

        # Scale mockup: keep spine shading aligned at SPINE_W, extend front panel only.
        cw, ch = cover_image.size
        mw, mh = mockup.size
        if (cw, ch) != (mw, mh):
            if cw > mw and ch == mh:
                spine_part = mockup.crop((0, 0, min(SPINE_W, mw), mh))
                front_part = mockup.crop((min(SPINE_W, mw), 0, mw, mh))
                front_w = cw - SPINE_W
                if front_w > 0:
                    front_stretched = front_part.resize((front_w, mh), Image.Resampling.LANCZOS)
                    extended = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
                    extended.paste(spine_part, (0, 0))
                    extended.paste(front_stretched, (SPINE_W, 0))
                    mockup = extended
                else:
                    mockup = mockup.resize((cw, ch), Image.Resampling.LANCZOS)
            else:
                mockup = mockup.resize((cw, ch), Image.Resampling.LANCZOS)

        # Extract shading layer
        shading_layer = mockup.convert("RGB")
        cover_rgb = cover_image.convert("RGB")

        # Multiply the shading directly onto the cover
        finished_book_rgb = ImageChops.multiply(cover_rgb, shading_layer)

        # Re-apply the alpha channel from the mockup so the rounded corners stay transparent!
        final_output = finished_book_rgb.convert("RGBA")
        final_output.putalpha(mockup.getchannel('A'))

        return final_output

    def finalize_and_save(self, img, filename_base, title):
        """Saves image with a timestamp and book title."""
        # Clean the title for a filename (remove spaces/special chars)
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '_')).strip().replace(' ', '_')
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        final_name = f"{filename_base}_{safe_title}_{timestamp}"
        
        if self.use_3d:
            final_img = self.apply_3d_mockup(img)
            final_img.save(f"{final_name}_3d.png")
            print(f" -> Saved 3D: {final_name}_3d.png")
        else:
            img.save(f"{final_name}_flat.png")
            print(f" -> Saved Flat: {final_name}_flat.png")

    def create_penguin(self, title, author):
        print(f"\n--- Building PENGUIN Style (Dynamic Tri-Band) ---")
        L = self._wrap_layout()
        spine_w, full_w, fc_left, fc_center = (
            L["spine_w"], L["full_w"], L["fc_left"], L["fc_center"],
        )
        content_left, content_right, content_width = (
            L["content_left"], L["content_right"], L["content_width"],
        )

        # --- 1. Dynamic Color & Art Generation ---
        penguin_style = "minimal flat vector icon, 2-3 colors, single centered object, screen print graphic"
        raw_icon = self.get_ai_art(title, image_style=penguin_style, author=author).resize((280, 280)).convert("RGB")
        
        band_color = raw_icon.getpixel((5, 5))
        
        r, g, b = band_color[:3]
        luminance = (0.299 * r + 0.587 * g + 0.114 * b)
        band_text_color = "white" if luminance < 130 else "black"

        img = Image.new('RGB', (full_w, self.height), color=self.cream)
        draw = ImageDraw.Draw(img)
        self._fill_spine(draw, self.cream)
        # Pushing the top line down and bottom line up shrinks the middle band 
        # from 400px down to 340px for a more refined look.
        top_line = 260
        bottom_line = 600

        # Top Band (front panel only — spine keeps cream)
        draw.rectangle([fc_left, 0, full_w, top_line], fill=band_color)
        # Bottom Band
        draw.rectangle([fc_left, bottom_line, full_w, 900], fill=band_color)
        
        # Crisp black divider lines (front panel)
        draw.line([(fc_left, top_line), (full_w, top_line)], fill="black", width=3)
        draw.line([(fc_left, bottom_line), (full_w, bottom_line)], fill="black", width=3)

        # --- 3. Fonts ---
        font_large = load_font(64, "bold")
        font_small = load_font(30, "bold")
        font_by = load_font(24, "regular")
        spine_font = load_font(24, "bold")

        # --- 4. Front Cover ---
        cartouche_margin = FRONT_GUTTER
        cartouche_top = top_line + 30
        cartouche_bottom = bottom_line - 30
        draw.rounded_rectangle(
            [content_left, cartouche_top, content_right, cartouche_bottom], 
            outline=band_color, width=4, radius=25
        )

        title_center_y = cartouche_top + (cartouche_bottom - cartouche_top) // 2 - 30
        self.draw_wrapped_text(
            draw,
            title.upper(),
            fc_center,
            title_center_y,
            font_large,
            fill="black",
            max_width=content_width - 20,
            min_font_size=40,
        )

        draw.text((fc_center, bottom_line - 90), "by", fill="black", font=font_by, anchor="mm")
        draw.text((fc_center, bottom_line - 52), author, fill="black", font=font_small, anchor="mm")
        
        icon_size = min(280, content_width - 20)
        raw_icon = raw_icon.resize((icon_size, icon_size))
        icon_center_y = bottom_line + ((900 - bottom_line) // 2)
        img.paste(raw_icon, (fc_center - icon_size // 2, icon_center_y - icon_size // 2))

        # --- 5. Spine Elements ---
        spine_text_img = Image.new('RGBA', (900, spine_w), (0,0,0,0))
        spine_draw = ImageDraw.Draw(spine_text_img)
        spine_text_y = 32
        
        # TITLE -> Top Band. 
        # Placed in the mathematical center of the top band space
        title_spine_x = 900 - (top_line // 2)
        spine_draw.text((title_spine_x, spine_text_y), title.upper(), fill="black", font=spine_font, anchor="mm")
        
        author_spine_x = 200 
        spine_draw.text((author_spine_x, spine_text_y), author.upper(), fill="black", font=spine_font, anchor="mm")
        
        spine_text_img = spine_text_img.rotate(90, expand=True)
        img.paste(spine_text_img, (0, 0), spine_text_img)
        
        # Bottom Spine Icon
        mini_icon = raw_icon.resize((45, 45))
        img.paste(mini_icon, (15, 810)) 
        
        self.finalize_and_save(img, "penguin_cover", title)

    def create_ast(self, title, author):
        print(f"\n--- Building AST Style (Modernized Constructivist) ---")
        try:
            colors = ask_json(
                "Pick 3 cohesive vintage colors for a book cover. JSON only: "
                '{"c1": "#hex", "c2": "#hex", "c3": "#hex"}',
                f"Pick 3 cohesive vintage colors for book '{title}'.",
            )
        except Exception as e:
            print(f"    !! Color picking failed, using defaults. Error: {e}")
            colors = {"c1": "#4B918E", "c2": "#45243B", "c3": "#98A98E"}

        L = self._wrap_layout()
        spine_w = L["spine_w"]
        full_w = L["full_w"]
        fc_left = L["fc_left"]
        fc_center = L["fc_center"]
        content_left = L["content_left"]
        content_right = L["content_right"]
        content_width = L["content_width"]

        ast_bg = "#F5F1DC" # Classic pale yellow

        img = Image.new('RGB', (full_w, self.height), color=ast_bg)
        draw = ImageDraw.Draw(img)
        self._fill_spine(draw, ast_bg)
        
        # --- AST Specific Art Style ---
        ast_style = (
            "vintage editorial screen print, risograph texture, 3-4 muted flat colors, "
            "simple symbolic still life, mid-century paperback cover art"
        )
        
        art_w = min(560, content_width)
        art_h = int(art_w * 480 / 580)
        art = self.get_ai_art(title, image_style=ast_style, author=author).resize((art_w, art_h))
        
        art_x = content_left + (content_width - art_w) // 2
        art_y = 40
        
        # Add a stylish geometric drop-shadow/offset box behind the art (using c3)
        draw.rectangle([art_x + 15, art_y + 15, art_x + art_w + 15, art_y + art_h + 15], fill=colors['c3'])
        
        # Paste the art and give it a thin, modern border
        img.paste(art, (art_x, art_y))
        draw.rectangle([art_x, art_y, art_x + art_w, art_y + art_h], outline="black", width=2)
        
        # --- The Color Blocks (Shuffled Hierarchy) ---
        # 1. Author ribbon — taller box for vertical breathing room
        b1_y = art_y + art_h + 40 
        b1_h = 96
        draw.rectangle([content_left, b1_y, content_right, b1_y + b1_h], fill=colors['c1'])
        
        # 2. Heavy Title Box (c2) — aligned with art block inside content area
        b2_y = b1_y + b1_h + 20 
        b2_h = 160
        draw.rectangle([art_x, b2_y, art_x + art_w, b2_y + b2_h], fill=colors['c2'])
        
        # 3. Vertical Red Accent Stripe inside the Title Box
        draw.rectangle([art_x, b2_y, art_x + 20, b2_y + b2_h], fill="#C61033")
        
        # 4. Small Series Box (Black) at the bottom left
        b3_y = b2_y + b2_h + 30
        b3_h = 40
        b3_w = min(220, art_w - 40)
        draw.rectangle([art_x, b3_y, art_x + b3_w, b3_y + b3_h], fill="black")

        # --- Typography Setup ---
        text_max_w = content_width - 16
        title_inner_w = art_w - 36
        font_author = self._font_for_width(author.upper(), text_max_w, 30, "bold", 14)
        font_title = load_font(58, "bold")
        font_small = load_font(16, "regular")

        self.draw_wrapped_text(
            draw,
            author.upper(),
            fc_center,
            b1_y + b1_h // 2,
            font_author,
            fill="white",
            max_width=text_max_w,
            min_font_size=14,
            line_spacing=8,
        )

        title_box_center_x = art_x + 20 + (art_w - 20) // 2
        self.draw_wrapped_text(
            draw,
            title.upper(),
            title_box_center_x,
            b2_y + b2_h // 2,
            font_title,
            fill=ast_bg,
            max_width=title_inner_w,
            min_font_size=20,
            line_spacing=8,
        )
        
        draw.text((art_x + 15, b3_y + (b3_h//2)), "MODERN CLASSICS", fill="white", font=font_small, anchor="lm")
        
        negative_space_center = (art_x + b3_w) + ((art_w - b3_w) // 2)
        draw.text((negative_space_center, b3_y + 12), "World Literature", fill="black", font=font_small, anchor="mm")
        draw.text((negative_space_center, b3_y + 28), "Essential Collection", fill="black", font=font_small, anchor="mm")

        self._paste_spine_labels(
            img,
            title,
            author,
            title_fill="black",
            author_fill="black",
        )
        
        # Finalize and save based on toggle
        self.finalize_and_save(img, "ast_cover", title)

    def create_marber(self, title, author):
        print(f"\n--- Building MARBER GRID Style (Full Wrap) ---")
        L = self._wrap_layout()
        spine_w = L["spine_w"]
        full_w = L["full_w"]
        fc_left = L["fc_left"]
        content_left = L["content_left"]
        content_width = L["content_width"]
        
        marber_green = "#007D51"

        img = Image.new('RGB', (full_w, self.height), color=self.cream)
        draw = ImageDraw.Draw(img)
        self._fill_spine(draw, self.cream)
        
        marber_style = (
            "1960s linocut book cover, high contrast black ink silhouettes, "
            "limited 2-color print, rough paper texture, graphic poster"
        )
        art_h = 600
        art = self.get_ai_art(title, image_style=marber_style, author=author).resize((content_width, art_h))
        img.paste(art, (content_left, 300))
        
        draw.rectangle([0, 300, spine_w, 900], fill=marber_green)
        
        # --- Top Third: The Marber Typography Grid ---
        font_large = load_font(52, "regular")
        font_small = load_font(28, "regular")
        spine_font = load_font(24, "regular")

        # The strict Marber horizontal rules
        line_color = "black"
        draw.line([(fc_left, 80), (full_w, 80)], fill=line_color, width=3)
        draw.line([(fc_left, 300), (full_w, 300)], fill=line_color, width=5)
        
        draw.text((content_left, 40), author.upper(), fill="black", font=font_small, anchor="lm")
        
        lines = textwrap.wrap(title.upper(), width=18)
        y_text = 120
        for line in lines:
            draw.text((content_left, y_text), line, fill=marber_green, font=font_large, anchor="lt")
            y_text += 55

        # --- Spine Elements ---
        #draw.line([(spine_w, 0), (spine_w, self.height)], fill=(0,0,0, 40), width=1)
        
        # Rotated spine text
        spine_text_img = Image.new('RGBA', (900, spine_w), (0,0,0,0))
        spine_draw = ImageDraw.Draw(spine_text_img)
        
        # --- FIX: Adjusted for counter-clockwise rotation ---
        # x=750 rotates to y=150 (Top third: Black text on Cream)
        # x=300 rotates to y=600 (Bottom two-thirds: White text on Green)
        spine_draw.text((750, spine_w//2), author.upper(), fill="black", font=spine_font, anchor="mm")
        spine_draw.text((300, spine_w//2), title.upper(), fill="white", font=spine_font, anchor="mm")
        
        spine_text_img = spine_text_img.rotate(90, expand=True)
        
        # Use the image itself as the mask so the transparent background doesn't overwrite the spine colors
        img.paste(spine_text_img, (0, 0), spine_text_img)
        
        # Finalize and save based on toggle
        self.finalize_and_save(img, "marber_cover", title)

    def create_faber(self, title, author):
        print(f"\n--- Building FABER & FABER Style (Full Wrap) ---")
        L = self._wrap_layout()
        spine_w = L["spine_w"]
        full_w = L["full_w"]
        fc_left = L["fc_left"]
        fc_center = L["fc_center"]
        content_left = L["content_left"]
        content_width = L["content_width"]

        faber_style = (
            "mid-century spot illustration, bold flat shapes, 2-3 colors, "
            "uniform solid background, elegant minimal motif, screen print"
        )
        
        art_size = min(480, content_width)
        art = self.get_ai_art(title, image_style=faber_style, author=author).resize((art_size, art_size))
        
        bg_color = art.getpixel((5, 5))
        
        img = Image.new('RGB', (full_w, self.height), color=self.cream)
        draw = ImageDraw.Draw(img)
        self._fill_spine(draw, self.cream)
        draw.rectangle([fc_left, 0, full_w, self.height], fill=bg_color)
        
        art_x = content_left + (content_width - art_size) // 2
        img.paste(art, (art_x, 350))
        
        # --- Smart Typography Color (Luminance Math) ---
        # Calculate brightness to decide if text should be light or dark for contrast
        r, g, b = bg_color[:3]
        luminance = (0.299 * r + 0.587 * g + 0.114 * b)
        text_color = (250, 250, 245) if luminance < 130 else (20, 20, 20)

        # --- Typography: The Albertus Look ---
        # Try to load Albertus if you downloaded it, otherwise fallback to Arial Bold, then default
        font_large = load_font(68, "bold")
        font_small = load_font(32, "bold")

        # Faber's layout: Author at the top, Title below
        draw.text((fc_center, 80), author.upper(), fill=text_color, font=font_small, anchor="mm")
        
        self.draw_wrapped_text(
            draw, 
            title.upper(), 
            fc_center, 
            160, 
            font_large, 
            fill=text_color, 
            max_width=content_width - 20,
        )

        # --- Spine Elements ---
        # A subtle hinge crease line
        #draw.line([(spine_w, 0), (spine_w, self.height)], fill=(0,0,0, 40), width=1)
        
        # Rotated spine text
        spine_text_img = Image.new('RGBA', (900, spine_w), (0,0,0,0))
        spine_draw = ImageDraw.Draw(spine_text_img)
        
        spine_draw.text((200, spine_w//2), author.upper(), fill=text_color, font=font_small, anchor="mm")
        spine_draw.text((650, spine_w//2), title.upper(), fill=text_color, font=font_small, anchor="mm")
        
        spine_text_img = spine_text_img.rotate(90, expand=True)
        img.paste(spine_text_img, (0, 0), spine_text_img)
        
        # Finalize and save based on toggle
        self.finalize_and_save(img, "faber_cover", title)

if __name__ == "__main__":
    print("=== AI BOOK COVER AUTOMATION ===")
    user_title = input("Enter Book Title: ")
    user_author = input("Enter Author Name: ")
    
    render_choice = input("Enable 3D Mockup render? (y/n): ").strip().lower()
    enable_3d = True if render_choice == 'y' else False
    
    if user_title and user_author:
        # 1. Initialize Generator
        gen = BookGenerator(use_3d=enable_3d)
        
        # 2. Ask the AI to pick the best layout style
        recommended_style = gen.get_recommended_style(user_title, user_author)
        
        # 3. Route to the correct drawing function
        if recommended_style == "ast":
            gen.create_ast(user_title, user_author)
        elif recommended_style == "marber":
            gen.create_marber(user_title, user_author)
        elif recommended_style == "faber":
            gen.create_faber(user_title, user_author)
        else:
            gen.create_penguin(user_title, user_author)
        
        print("\nSUCCESS! Check your folder for the generated covers.")
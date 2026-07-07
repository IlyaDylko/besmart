import os
import json
from book_gen_google import BookGenerator

class BatchBookGenerator(BookGenerator):
    """
    A subclass of your BookGenerator that overrides the save method 
    to place the files in specific dynamically named folders.
    """
    def __init__(self, book_id, width=680, height=900, use_3d=True):
        # Initialize the parent class (your original script)
        super().__init__(width, height, use_3d)
        self.book_id = book_id

    def finalize_and_save(self, img, filename_base, title):
        """Overrides the original save method to use the custom folder structure."""
        # Create the specific book directory: book/{book_id}/
        folder_path = os.path.join("book", self.book_id)
        os.makedirs(folder_path, exist_ok=True)
        
        # Define the exact save path
        save_path = os.path.join(folder_path, "cover.png")
        
        if self.use_3d:
            final_img = self.apply_3d_mockup(img)
            final_img.save(save_path)
            print(f" -> Saved 3D Cover successfully to: {save_path}")
        else:
            img.save(save_path)
            print(f" -> Saved Flat Cover successfully to: {save_path}")


def process_library():
    print("=== STARTING BATCH COVER GENERATION ===")
    
    # 1. Load the JSON file
    try:
        with open("summaries.json", "r", encoding="utf-8") as f:
            books = json.load(f)
    except FileNotFoundError:
        print("Error: 'summaries.json' not found in the current directory.")
        return
    except json.JSONDecodeError as e:
        print(f"Error: 'summaries.json' is not valid JSON. ({e})")
        return

    # 2. Iterate through every book in the JSON
    for book in books:
        book_id = book.get("id")
        if not book_id:
            continue
            
        title = book.get("title") or book_id.replace("_", " ").title()
        author = book.get("author") or ""
        
        print(f"\n========================================")
        print(f" Processing Book: {title}")
        print(f"========================================")
        
        # 3. Instantiate our custom batch generator
        # Note: Set use_3d=False if you only want the flat covers generated
        gen = BatchBookGenerator(book_id=book_id, use_3d=True)
        
        # 4. Ask the AI Art Director to pick the best layout style
        recommended_style = gen.get_recommended_style(title, author)
        
        # 5. Route to the correct drawing function from your original script
        if recommended_style == "ast":
            gen.create_ast(title, author)
        elif recommended_style == "marber":
            gen.create_marber(title, author)
        elif recommended_style == "faber":
            gen.create_faber(title, author)
        else:
            gen.create_penguin(title, author)

if __name__ == "__main__":
    process_library()
    print("\n=== BATCH GENERATION COMPLETE ===")
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import requests
import os
import re
import numpy as np

def preprocess_image(image):
    # Convert to RGB
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Convert to numpy array for processing
    img_array = np.array(image)
    
    # Convert to grayscale
    gray = np.dot(img_array[...,:3], [0.2989, 0.5870, 0.1140])
    
    # Moderate preprocessing
    gray = np.clip(gray * 1.2, 0, 255).astype(np.uint8)
    
    # Convert back to PIL Image
    processed_image = Image.fromarray(gray)
    
    # Apply moderate enhancements
    enhancer = ImageEnhance.Contrast(processed_image)
    processed_image = enhancer.enhance(1.8)
    
    enhancer = ImageEnhance.Sharpness(processed_image)
    processed_image = enhancer.enhance(1.8)
    
    return processed_image

def get_pokemon_name(image_path):
    try:
        original_image = Image.open(image_path)
        
        # Preprocess the image for better OCR
        processed_image = preprocess_image(original_image)
        
        # OCR configurations to try (most effective first)
        configs = [
            '--psm 13 --oem 3 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',  # Raw line
            '--psm 6 --oem 3 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',  # Single text line
            '--psm 8 --oem 3 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',  # Single word
        ]
        
        # Define the region where Pokemon names typically appear
        width, height = original_image.size
        region = (0, 0, width, height//3)  # Whole top third of the card
        
        best_results = []
        
        # Crop the processed image
        cropped = processed_image.crop(region)
        
        # Also try the original image cropped
        original_cropped = original_image.crop(region)
        
        # Try each configuration with both processed and original images
        for config in configs:
            for img in [cropped, original_cropped]:
                try:
                    # Get detailed OCR data with confidence scores
                    data = pytesseract.image_to_data(img, config=config, lang='eng', output_type=pytesseract.Output.DICT)
                    
                    # Extract high-confidence text
                    text_parts = []
                    confidences = []
                    
                    for i in range(len(data['text'])):
                        conf = int(data['conf'][i])
                        text = data['text'][i].strip()
                        
                        if conf > 25 and len(text) > 2:  # Lower threshold for more candidates
                            text_parts.append(text)
                            confidences.append(conf)
                    
                    if text_parts:
                        combined_text = ' '.join(text_parts)
                        avg_confidence = sum(confidences) / len(confidences)
                        
                        # Clean the text
                        cleaned = re.sub(r'[^a-zA-Z\s]', ' ', combined_text).strip()
                        words = cleaned.split()
                        
                        # Find potential Pokemon names (less restrictive filtering)
                        pokemon_candidates = []
                        for word in words:
                            if len(word) >= 3:  # Lower threshold to catch "Mega"
                                # Only filter out very common card text words
                                word_lower = word.lower()
                                if word_lower not in ['damage', 'energy', 'pokemon', 'attack', 'ability', 'heal', 'flip', 'coin', 'heads', 'tails', 'opponent', 'active', 'from', 'this', 'that', 'when', 'you', 'your', 'may', 'choose', 'discard', 'draw', 'card', 'cards', 'hand', 'deck', 'prize', 'prizes', 'retreat', 'cost', 'weakness', 'resistance', 'hp', 'type', 'stage', 'basic', 'evolution', 'evolves', 'put', 'into', 'play', 'bench', 'battle', 'area']:
                                    pokemon_candidates.append(word)
                        
                        for candidate in pokemon_candidates:
                            best_results.append({
                                'name': candidate,
                                'confidence': avg_confidence,
                                'length': len(candidate),
                                'config': config
                            })
                            
                except Exception:
                    continue
        
        # Skip full image processing to avoid card text
        
        if not best_results:
            return "Pokemon name not found"
        
        # Sort by confidence and length (longer names are more likely to be Pokemon names)
        best_results.sort(key=lambda x: (x['confidence'], x['length']), reverse=True)
        
        # Smart text extraction without hardcoded corrections
        best_candidate = best_results[0]['name']
        
        # If we have multiple candidates, try to combine them intelligently
        if len(best_results) > 1:
            # Look for candidates that might be parts of the same Pokemon name
            all_candidates = [result['name'] for result in best_results[:5]]  # Top 5 candidates
            
            # Try to find a pattern like "Mega" + "Venusaur" or "Venusaur" + "Mega"
            for i, candidate in enumerate(all_candidates):
                if candidate.lower() == 'mega' and i + 1 < len(all_candidates):
                    next_candidate = all_candidates[i + 1]
                    if len(next_candidate) >= 3:  # Next word is likely the Pokemon name
                        return f"Mega{next_candidate}"
                elif candidate.lower() == 'mega' and i > 0:
                    prev_candidate = all_candidates[i - 1]
                    if len(prev_candidate) >= 3:  # Previous word is likely the Pokemon name
                        return f"Mega{prev_candidate}"
            
            # If we have a short word followed by a longer word, combine them
            for i, candidate in enumerate(all_candidates):
                if len(candidate) <= 5 and i + 1 < len(all_candidates):
                    next_candidate = all_candidates[i + 1]
                    if len(next_candidate) >= 6:  # Next word is much longer
                        return f"{candidate}{next_candidate}"
            
            # Handle partial words that might be parts of Pokemon names
            for i, candidate in enumerate(all_candidates):
                if len(candidate) == 3 and i + 1 < len(all_candidates):  # Short word like "Ven"
                    next_candidate = all_candidates[i + 1]
                    if len(next_candidate) >= 4:  # Next word is longer
                        # Check if this looks like a Pokemon name pattern
                        combined = f"{candidate}{next_candidate}"
                        if len(combined) >= 6:  # Reasonable length for Pokemon name
                            return combined
        
        # If single word or short compound, return as is
        return best_candidate
        
    except Exception as e:
        return f"Error: {e}"

def tcgCard():
    url = "https://api.pokemontcg.io/v2/cards"


if __name__ == "__main__":
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    pokemon_path = os.path.join(script_dir, "MegaVenusaur.png")
    if os.path.exists(pokemon_path):
        pokemon_name = get_pokemon_name(pokemon_path)
        print(f"Pokemon Name: {pokemon_name}")
    else:
        print(f"\nerror")
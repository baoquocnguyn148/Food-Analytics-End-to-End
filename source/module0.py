import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

print("🔄 Đang HOÀN THIỆN Phase 0 - Cải tiến mạnh Main_Group & Sub_Group...")

# ====================== ĐỌC DỮ LIỆU ======================
df = pd.read_csv("data/food.csv")
print(f"Đọc file gốc: {df.shape}")

# ====================== LÀM SẠCH TÊN CỘT ======================
def clean_column_name(col):
    col = str(col).replace("Data.", "").replace("Major Minerals.", "").replace("Vitamins.", "")
    col = col.replace("Fat.", "Fat_").replace(" - ", "_").replace(" ", "_").replace("-", "_").replace("/", "_")
    return col.strip("_").lower()

df.columns = [clean_column_name(col) for col in df.columns]
df['desc_lower'] = df['description'].str.lower().str.strip()

# ====================== ÉP KIỂU NUMERIC ======================
numeric_cols = ['protein', 'carbohydrate', 'fat_total_lipid', 'fiber', 'calcium', 'iron',
                'vitamin_a_rae', 'vitamin_c', 'sugar_total', 'cholesterol', 'sodium', 
                'potassium', 'magnesium', 'phosphorus', 'vitamin_e', 'vitamin_k']

for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# ====================== CALORIES & MACROS ======================
df['calories'] = (df['protein']*4 + df['carbohydrate']*4 + df['fat_total_lipid']*9).round(1)
total_cal = df['calories'].replace(0, np.nan)
df['macro_protein_pct'] = (df['protein']*4 / total_cal * 100).fillna(0).round(1)
df['macro_carb_pct']   = (df['carbohydrate']*4 / total_cal * 100).fillna(0).round(1)
df['macro_fat_pct']    = (df['fat_total_lipid']*9 / total_cal * 100).fillna(0).round(1)

# ====================== FLAGS ======================
df['is_plant_based'] = df['desc_lower'].str.contains(r'soy|almond|rice|coconut|oat|plant|vegan|tofu|seitan', na=False).astype(int)
df['is_fortified']   = df['desc_lower'].str.contains(r'fortified|enriched|calcium fortified', na=False).astype(int)
df['is_infant']      = df['desc_lower'].str.contains(r'baby|infant|toddler|formula', na=False).astype(int)

# ====================== MAIN_GROUP & SUB_GROUP (TỐI ƯU HÓA KHUNG 50-70 SUB GROUPS) ======================
def classify_food(row):
    desc = str(row['desc_lower']).lower()
    cat = str(row.get('category', '')).lower()
    text = desc + " " + cat
    
    # 1. PLANT-BASED ALTERNATIVES (Gom gọn lại thành 3 nhóm cốt lõi)
    if any(x in text for x in ['soy milk', 'almond milk', 'coconut milk', 'oat milk', 'rice milk', 'plant milk']): 
        return "Plant-based Alternatives", "Plant Milks"
    if 'tofu' in text: return "Plant-based Alternatives", "Tofu & Soy Products"
    if any(x in text for x in ['tempeh', 'seitan', 'meat alternative', 'vegan meat']): 
        return "Plant-based Alternatives", "Meat Alternatives"

    # 2. DAIRY & EGGS (Gom các loại sữa đặc/bột/tươi làm một)
    if 'yogurt' in text or 'yoghurt' in text: return "Dairy & Eggs", "Yogurt"
    if 'cheese' in text: return "Dairy & Eggs", "Cheese"
    if any(x in text for x in ['milk', 'buttermilk', 'kefir', 'evaporated', 'condensed']): 
        return "Dairy & Eggs", "Milk & Fermented Dairy"
    if 'cream' in desc and 'ice' not in desc: return "Dairy & Eggs", "Cream & Sour Cream"
    if any(x in desc for x in ['omelet', 'scrambled', 'fried egg', 'quiche']): return "Dairy & Eggs", "Egg Dishes"
    if 'egg' in desc: return "Dairy & Eggs", "Eggs"
    
    # 3. MEAT & POULTRY (Gom gọn các loại thịt tươi và thịt chế biến)
    if 'chicken' in text: return "Meat & Poultry", "Chicken"
    if 'turkey' in text: return "Meat & Poultry", "Turkey"
    if 'beef' in text: return "Meat & Poultry", "Beef"
    if 'pork' in text and not any(x in text for x in ['bacon', 'ham', 'sausage']): return "Meat & Poultry", "Pork"
    if any(x in text for x in ['sausage', 'frankfurter', 'bologna', 'hot dog']): return "Meat & Poultry", "Processed Sausage & Hot Dogs"
    if any(x in text for x in ['bacon', 'ham', 'cold cut', 'salami']): return "Meat & Poultry", "Cured & Cold Cut Meats"
    if any(x in text for x in ['lamb', 'mutton', 'goat', 'veal', 'game']): return "Meat & Poultry", "Lamb, Goat & Other Meats"
    
    # 4. SEAFOOD (Gom từ 6 xuống còn 3 nhóm lớn trực quan)
    if any(x in text for x in ['salmon', 'tuna', 'mackerel', 'sardine', 'trout']): return "Seafood", "Fatty Fish"
    if any(x in text for x in ['cod', 'tilapia', 'catfish', 'halibut', 'pollock', 'fish']): return "Seafood", "White & Other Fish"
    if any(x in text for x in ['shrimp', 'prawn', 'crab', 'lobster', 'oyster', 'clam', 'scallop', 'mussel', 'shellfish']): 
        return "Seafood", "Shellfish & Mollusks"
    
    # 5. VEGETABLES (Giữ nguyên cấu trúc 9 nhóm rau củ rất đẹp)
    if any(x in text for x in ['spinach', 'kale', 'lettuce', 'cabbage', 'chard']): return "Vegetables", "Leafy Greens"
    if any(x in text for x in ['broccoli', 'cauliflower', 'brussels']): return "Vegetables", "Cruciferous Vegetables"
    if any(x in text for x in ['potato', 'sweet potato', 'yam']): return "Vegetables", "Starchy Tubers"
    if 'carrot' in text: return "Vegetables", "Carrots"
    if 'tomato' in text: return "Vegetables", "Tomatoes"
    if 'pepper' in text or 'chili' in text: return "Vegetables", "Peppers & Chilies"
    if any(x in text for x in ['onion', 'garlic', 'leek', 'shallot']): return "Vegetables", "Alliums (Onion/Garlic)"
    if 'mushroom' in text: return "Vegetables", "Mushrooms"
    if any(x in text for x in ['corn', 'maize', 'vegetable', 'peas', 'green bean']): return "Vegetables", "Mixed & Other Vegetables"
    
    # 6. FRUITS (Gom các loại quả đơn lẻ thành nhóm đặc trưng tính chất)
    if any(x in text for x in ['apple', 'banana', 'grape', 'pear', 'peach', 'melon']): return "Fruits", "Pome & Common Fruits"
    if any(x in text for x in ['orange', 'lemon', 'lime', 'citrus', 'grapefruit', 'tangerine']): return "Fruits", "Citrus Fruits"
    if any(x in text for x in ['berry', 'strawberry', 'blueberry', 'raspberry', 'blackberry']): return "Fruits", "Berries"
    if any(x in text for x in ['mango', 'pineapple', 'papaya', 'avocado', 'coconut']): return "Fruits", "Tropical & Exotic Fruits"
    if 'fruit' in text and 'juice' not in text: return "Fruits", "Other Fruits"
    
    # 7. GRAINS & BAKED GOODS (6 nhóm đúng chuẩn)
    if 'rice' in text: return "Grains & Baked Goods", "Rice & Rice Dishes"
    if any(x in text for x in ['pasta', 'noodle', 'spaghetti', 'macaroni']): return "Grains & Baked Goods", "Pasta & Noodles"
    if any(x in text for x in ['bread', 'bun', 'roll', 'bagel']): return "Grains & Baked Goods", "Bread"
    if any(x in text for x in ['cereal', 'oatmeal', 'oats', 'bran']): return "Grains & Baked Goods", "Breakfast Cereals"
    if 'cracker' in text: return "Grains & Baked Goods", "Crackers"
    if any(x in text for x in ['tortilla', 'naan', 'pita', 'croissant', 'pastry']): return "Grains & Baked Goods", "Flatbreads & Pastries"
    
    # 8. BEVERAGES (Gom nhẹ các nhóm nước ngọt và sữa vị)
    if any(x in text for x in ['chocolate milk', 'milk shake', 'milkshake']): return "Beverages", "Flavored Milk & Shakes"
    if any(x in text for x in ['juice', 'fruit drink', 'nectar']): return "Beverages", "Fruit Juice & Drinks"
    if any(x in text for x in ['soda', 'cola', 'carbonated', 'energy drink', 'sports drink']): return "Beverages", "Soft & Energy Drinks"
    if 'coffee' in text: return "Beverages", "Coffee Beverages"
    if 'tea' in text: return "Beverages", "Tea Beverages"
    if any(x in text for x in ['beer', 'wine', 'cocktail', 'liquor', 'whiskey', 'alcohol']): return "Beverages", "Alcoholic Beverages"
    if 'water' in text: return "Beverages", "Water & Bottled Water"
    
    # 9. SNACKS & SWEETS (Gom đồ ngọt lại thành 6 nhóm)
    if any(x in text for x in ['ice cream', 'frozen yogurt', 'sherbet', 'sorbet']): return "Snacks & Sweets", "Frozen Desserts"
    if 'cookie' in text: return "Snacks & Sweets", "Cookies"
    if any(x in text for x in ['cake', 'pie', 'tart', 'pastry']): return "Snacks & Sweets", "Cakes & Pies"
    if any(x in text for x in ['candy', 'gummy', 'chocolate', 'sweet']): return "Snacks & Sweets", "Candies & Chocolates"
    if any(x in text for x in ['chips', 'potato chip', 'tortilla chip', 'pretzel']): return "Snacks & Sweets", "Savory Chips & Snacks"
    if 'popcorn' in text: return "Snacks & Sweets", "Popcorn"
    
    # 10. FATS & OILS
    if 'oil' in text: return "Fats & Oils", "Vegetable Oils"
    if any(x in text for x in ['butter', 'margarine', 'spread', 'lard', 'shortening', 'fat']): return "Fats & Oils", "Butter, Margarine & Fats"
    
    # 11. SAUCES & CONDIMENTS
    if any(x in text for x in ['dip', 'dressing', 'salads dressing']): return "Sauces & Condiments", "Dressings & Dips"
    if any(x in text for x in ['sauce', 'gravy', 'ketchup', 'mustard', 'mayonnaise', 'condiment']): return "Sauces & Condiments", "Sauces & Gravies"
    
    # 12. BABY FOODS
    if any(x in text for x in ['formula', 'infant formula']): return "Baby Foods", "Infant Formula"
    if any(x in text for x in ['baby', 'infant', 'toddler']): return "Baby Foods", "Infant Solid Foods"
    
    # 13. PREPARED FOODS
    if any(x in text for x in ['pizza', 'burger', 'sandwich', 'taco', 'burrito', 'enchilada']): return "Prepared Foods", "Fast Food & Sandwiches"
    if 'soup' in text or 'broth' in text: return "Prepared Foods", "Soups & Broths"
    
    # 14. NUTRITIONAL SUPPLEMENTS
    if any(x in text for x in ['nutritional', 'protein powder', 'boost', 'ensure', 'slim fast', 'muscle milk']): 
        return "Nutritional Supplements", "Meal Replacements & Powders"
    
    # 15. NUTS & LEGUMES
    if any(x in text for x in ['peanut', 'almond', 'walnut', 'cashew', 'pecan', 'nut']): return "Nuts & Legumes", "Nuts & Nut Butters"
    if any(x in text for x in ['lentil', 'bean', 'pea', 'legume', 'seed', 'chia', 'sunflower']) and 'green bean' not in text: 
        return "Nuts & Legumes", "Seeds, Beans & Legumes"
    
    return "Other / Mixed", "Unclassified"

# ÁP DỤNG PHÂN LOẠI
df[['main_group', 'sub_group']] = df.apply(
    lambda row: classify_food(row), axis=1, result_type='expand'
)

print(f"Phân loại hoàn tất. Other / Mixed: {(df['main_group'] == 'Other / Mixed').sum()} rows")

# ====================== NOVA, NDS, CWS ======================
def get_nova_level(desc):
    desc = str(desc).lower()
    if any(x in desc for x in ['soda','candy','cookie','cake','energy drink','milk shake']):
        return 4
    if any(x in desc for x in ['cheese','bread','yogurt','sausage']):
        return 3
    if any(x in desc for x in ['oil','butter','sugar']): 
        return 2
    return 1

df['nova_level'] = df['desc_lower'].apply(get_nova_level)

df['nds'] = (
    df['protein']*2 + df['fiber']*3 + df['calcium']/50 + 
    df['iron']/5 + df['vitamin_c']/10 + df.get('vitamin_a_rae', 0)/100
).round(2)

df['cws'] = (df['nds'] + df['is_plant_based']*3 - (df['nova_level'] == 4)*4).round(2)

# ====================== KẾT QUẢ ======================
print(f"\n✅ Phase 0 HOÀN THÀNH!")
print(f"Tổng thực phẩm: {len(df):,}")
print(f"Main Groups : {df['main_group'].nunique()} nhóm")
print(f"Sub Groups  : {df['sub_group'].nunique()} nhóm")
print("\n📊 Main Group distribution:")
print(df['main_group'].value_counts())
print("\n📊 Top 30 Sub Group:")
print(df['sub_group'].value_counts().head(30))

df.to_csv("food_cleaned.csv", index=False)
print("\n💾 Đã lưu file: food_cleaned.csv")
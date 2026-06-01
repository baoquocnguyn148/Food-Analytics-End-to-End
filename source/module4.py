import pandas as pd
import warnings
import os
from difflib import get_close_matches

warnings.filterwarnings('ignore')

print("🚀 Khởi động Module 4: Recipe Nutrition Calculator...")

# =========================================================================
# 1. ĐỌC DỮ LIỆU
# =========================================================================
try:
    if not os.path.exists("phase0/food_cleaned.csv"):
        print("❌ Không tìm thấy file 'phase0/food_cleaned.csv'. Vui lòng chạy các module trước!")
        exit()
    
    df = pd.read_csv("phase0/food_cleaned.csv")
    print(f"📊 Đã tải dữ liệu thành công: {df.shape[0]:,} dòng.")
    
except Exception as e:
    print(f"❌ Lỗi khi đọc file dữ liệu: {e}")
    exit()

os.makedirs("module4_outputs", exist_ok=True)

# =========================================================================
# COOKING FACTORS
# =========================================================================
COOKING_FACTORS = {
    "raw": 1.0,
    "boiled": 1.25,
    "cooked": 1.2,
    "grilled": 0.75,
    "fried": 0.85,
    "steamed": 1.1
}

# =========================================================================
# FUZZY SEARCH - ĐÃ TỐI ƯU
# =========================================================================
def find_best_ingredient(user_input, data, cutoff=0.58):
    """
    Tìm nguyên liệu gần nhất bằng fuzzy matching
    """
    try:
        descriptions = data['description'].astype(str).tolist()
        descriptions_lower = [desc.lower() for desc in descriptions]
        
        matches = get_close_matches(user_input.lower(), descriptions_lower, n=1, cutoff=cutoff)
        
        if matches:
            matched_idx = descriptions_lower.index(matches[0])
            return data.iloc[matched_idx]
    except:
        pass
    return None


# =========================================================================
# TÍNH DINH DƯỠNG CÔNG THỨC
# =========================================================================
def calculate_recipe_nutrition(recipe_name, ingredients_list, servings=1):
    """
    Tính toán dinh dưỡng cho một công thức nấu ăn
    """
    nutrients = {
        'calories': 0.0, 
        'protein': 0.0, 
        'carbohydrate': 0.0,
        'fat_total_lipid': 0.0, 
        'fiber': 0.0, 
        'sugar_total': 0.0,
        'sodium': 0.0
    }
    
    total_raw_weight = 0.0
    weighted_cws = 0.0
    details = []
    
    for ing in ingredients_list:
        row = find_best_ingredient(ing["input_name"], df)
        
        if row is not None:
            state = ing.get("state", "raw")
            factor = COOKING_FACTORS.get(state, 1.0)
            raw_gram = ing["gram"] / factor
            
            total_raw_weight += raw_gram
            ratio = raw_gram / 100.0

            # Tính các chất dinh dưỡng
            for key in nutrients.keys():
                if key in row and not pd.isna(row[key]):
                    nutrients[key] += float(row[key]) * ratio

            # Tính CWS
            if 'cws' in row and not pd.isna(row['cws']):
                weighted_cws += float(row['cws']) * raw_gram

            details.append({
                "Nguyên liệu nhập": ing["input_name"],
                "Nguyên liệu khớp": row['description'],
                "Khối lượng chín (g)": ing["gram"],
                "Trạng thái": state,
                "Khối lượng thô (g)": round(raw_gram, 1),
                "Hệ số nấu": round(factor, 2)
            })
        else:
            print(f"⚠️ Không tìm thấy nguyên liệu: '{ing['input_name']}'")

    if not details:
        print(f"❌ Không có nguyên liệu hợp lệ cho món: {recipe_name}")
        return None, None

    # Tính theo khẩu phần
    per_serving = {k: round(v / servings, 2) for k, v in nutrients.items()}
    per_serving['cws'] = round(weighted_cws / total_raw_weight, 2) if total_raw_weight > 0 else 0.0
    per_serving['recipe_name'] = recipe_name
    per_serving['servings'] = servings
    per_serving['total_weight_raw'] = round(total_raw_weight, 1)
    
    return per_serving, pd.DataFrame(details)


# =========================================================================
# CÔNG THỨC MẪU
# =========================================================================
SAMPLE_RECIPES = [
    {
        "name": "Salad Ức Gà Giảm Cân",
        "servings": 2,
        "ingredients": [
            {"input_name": "chicken breast", "gram": 300, "state": "grilled"},
            {"input_name": "lettuce", "gram": 150, "state": "raw"},
            {"input_name": "olive oil", "gram": 15, "state": "raw"}
        ]
    },
    {
        "name": "Cơm Rang Thịt Bò Thể Hình",
        "servings": 1,
        "ingredients": [
            {"input_name": "rice", "gram": 200, "state": "boiled"},
            {"input_name": "beef", "gram": 120, "state": "fried"},
            {"input_name": "egg", "gram": 50, "state": "raw"}
        ]
    },
    {
        "name": "Bữa Sáng Yến Mạch Trái Cây",
        "servings": 1,
        "ingredients": [
            {"input_name": "oatmeal", "gram": 50, "state": "raw"},
            {"input_name": "almond milk", "gram": 150, "state": "raw"},
            {"input_name": "banana", "gram": 100, "state": "raw"},
            {"input_name": "chia seeds", "gram": 15, "state": "raw"}
        ]
    }
]

# =========================================================================
# CHẠY TÍNH TOÁN
# =========================================================================
print("\n🤖 Đang tính toán dinh dưỡng cho các công thức mẫu...")

with open("module4_outputs/recipe_nutrition_labels.txt", "w", encoding="utf-8") as rep:
    rep.write("=====================================================================\n")
    rep.write("📋 NUTRITION LABEL - CÔNG THỨC NẤU ĂN CHUẨN HÓA\n")
    rep.write("=====================================================================\n\n")
    
    for recipe in SAMPLE_RECIPES:
        summary, details = calculate_recipe_nutrition(
            recipe["name"], 
            recipe["ingredients"], 
            recipe["servings"]
        )
        
        if summary:
            # Tạo tên file an toàn
            safe_name = recipe["name"].lower().strip().replace(" ", "_").replace(":", "")
            
            details.to_csv(f"module4_outputs/details_{safe_name}.csv", index=False)
            
            # Ghi vào file report
            rep.write(f"🍽️ {summary['recipe_name'].upper()}\n")
            rep.write(f"👥 {summary['servings']} khẩu phần\n")
            rep.write(f"⚖️ Tổng khối lượng thô: {summary['total_weight_raw']}g\n")
            rep.write("-" * 80 + "\n")
            rep.write(f"🔥 Calories     : {summary['calories']:.1f} kcal\n")
            rep.write(f"🥩 Protein      : {summary['protein']:.1f} g\n")
            rep.write(f"🍞 Carbohydrates: {summary['carbohydrate']:.1f} g\n")
            rep.write(f"🥑 Fat          : {summary['fat_total_lipid']:.1f} g\n")
            rep.write(f"🌾 Fiber        : {summary['fiber']:.1f} g\n")
            rep.write(f"🍬 Sugar        : {summary['sugar_total']:.1f} g\n")
            rep.write(f"🧂 Sodium       : {summary['sodium']:.1f} mg\n")
            if summary['sodium'] > 600:
                rep.write(f"   ⚠️ Chú ý: Lượng Natri khá cao, cân nhắc giảm gia vị mặn!\n")
            rep.write(f"⭐ Điểm CWS     : {summary['cws']:.2f}\n")
            rep.write("=" * 80 + "\n\n")

print("💾 Đã xuất Nutrition Label và file chi tiết thành công!")
print("📁 Kết quả nằm trong thư mục: module4_outputs/")
print("\n🎉 MODULE 4 HOÀN THÀNH XUẤT SẮC!")
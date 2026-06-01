import pandas as pd
import numpy as np
import warnings
import os

warnings.filterwarnings('ignore')

print("🚀 Khởi động Module 3: Diet Recommendation System...")

# 1. ĐỌC DỮ LIỆU
if not os.path.exists("phase0/food_cleaned.csv"):
    print("❌ Không tìm thấy file 'phase0/food_cleaned.csv'. Vui lòng chạy các bước trước!")
    exit()

df = pd.read_csv("phase0/food_cleaned.csv")
print(f"📊 Đã tải dữ liệu thành công: {df.shape[0]} dòng.")

os.makedirs("module3_outputs", exist_ok=True)

# =========================================================================
# BƯỚC 1: DIET PROFILES (Tối ưu hơn)
# =========================================================================
DIET_PROFILES = {
    "Muscle Gain": {
        "description": "Chế độ ăn giàu đạm hỗ trợ tăng cơ bắp và phát triển thể hình.",
        "hard_filter": lambda d: (d['protein'] >= 15) & (d['calories'] <= 250) & (d['main_group'] != 'Nutritional Supplements'),
        "weights": {"protein": 5.0, "cws": 2.5, "nds": 1.5, "fat_total_lipid": 1.0}
    },
    "Keto Diet": {
        "description": "Chế độ ăn rất thấp carb, giàu chất béo để vào trạng thái Ketosis.",
        "hard_filter": lambda d: (d['carbohydrate'] <= 5) & (d['main_group'] != 'Nutritional Supplements') & (d['main_group'] != 'Fats & Oils') & (d['main_group'] != 'Condiments & Sauces'),
        "weights": {"fat_total_lipid": 5.0, "protein": 2.0, "sugar_total": -4.0, "cws": 2.0}
    },
    "Heart Health": {
        "description": "Chế độ ăn bảo vệ tim mạch, kiểm soát huyết áp và cholesterol.",
        "hard_filter": lambda d: (d['sodium'] <= 120) & (d['nova_level'] <= 2) & (d['main_group'] != 'Nutritional Supplements'),
        "weights": {"fiber": 4.0, "cws": 4.0, "sodium": -3.0, "fat_total_lipid": -1.0}
    },
    "Weight Loss": {
        "description": "Chế độ ăn kiểm soát calo, giàu chất xơ tạo no lâu.",
        "hard_filter": lambda d: (d['calories'] <= 180) & (d['main_group'] != 'Nutritional Supplements'),
        "weights": {"fiber": 5.0, "cws": 3.0, "calories": -4.0, "sugar_total": -3.0}
    },
    "Diabetes Management": {
        "description": "Kiểm soát đường huyết cho người tiểu đường.",
        "hard_filter": lambda d: (d['sugar_total'] <= 3) & (d['main_group'] != 'Nutritional Supplements'),
        "weights": {"fiber": 5.0, "protein": 3.0, "carbohydrate": -3.0, "cws": 3.0}
    },
    "Vegan Nutrition": {
        "description": "Chế độ ăn thuần chay cân bằng và giàu dinh dưỡng.",
        "hard_filter": lambda d: (d['is_plant_based'] == 1) & (d['main_group'] != 'Nutritional Supplements'),
        "weights": {"protein": 3.0, "fiber": 4.0, "cws": 4.0, "nds": 3.0}
    },
    "Clean Eating": {
        "description": "Ăn sạch, ưu tiên thực phẩm tự nhiên ít chế biến.",
        "hard_filter": lambda d: (d['nova_level'] <= 2) & (d['main_group'] != 'Nutritional Supplements'),
        "weights": {"cws": 5.0, "nds": 4.0, "sugar_total": -3.0, "sodium": -2.0}
    }
}

# =========================================================================
# BƯỚC 2: HÀM RECOMMEND FOODS
# =========================================================================
def recommend_foods(data, goal_name, top_n=10):
    if goal_name not in DIET_PROFILES:
        print(f"❌ Mục tiêu '{goal_name}' không tồn tại!")
        return pd.DataFrame()
   
    profile = DIET_PROFILES[goal_name]
    
    # Áp dụng Hard Filter
    filtered_df = data[profile["hard_filter"](data)].copy()
   
    if filtered_df.empty:
        print(f"⚠️ Không tìm thấy thực phẩm nào phù hợp với '{goal_name}'")
        return pd.DataFrame()
    
    # Tính Weighted Score với chuẩn hóa
    weights = profile["weights"]
    score = np.zeros(len(filtered_df))
    
    for metric, weight in weights.items():
        if metric in filtered_df.columns:
            col = filtered_df[metric].fillna(0)
            if col.max() != col.min():
                norm = (col - col.min()) / (col.max() - col.min())
            else:
                norm = 0
            score += norm * weight
   
    filtered_df = filtered_df.copy()
    filtered_df['recommendation_score'] = np.round(score, 3)
    
    # Lấy Top N
    top_recs = filtered_df.sort_values(by='recommendation_score', ascending=False).head(top_n)
    
    display_cols = ['description', 'main_group', 'sub_group', 'calories', 'protein',
                    'carbohydrate', 'fat_total_lipid', 'cws', 'recommendation_score']
    available_cols = [c for c in display_cols if c in top_recs.columns]
    
    return top_recs[available_cols]

# =========================================================================
# BƯỚC 3: CHẠY TẤT CẢ CÁC PROFILE
# =========================================================================
print("\n🤖 Đang tạo gợi ý dinh dưỡng cho 7 chế độ ăn...")

with open("module3_outputs/diet_recommendations_report.txt", "w", encoding="utf-8") as rep:
    rep.write("=====================================================================\n")
    rep.write("🎯 HỆ THỐNG GỢI Ý CHẾ ĐỘ ĂN THEO MỤC TIÊU SỨC KHỎE\n")
    rep.write("=====================================================================\n\n")
    
    for goal in DIET_PROFILES.keys():
        rep.write(f"🌟 MỤC TIÊU: {goal.upper()}\n")
        rep.write(f"📝 {DIET_PROFILES[goal]['description']}\n")
        rep.write("-" * 85 + "\n")
        
        top_10 = recommend_foods(df, goal, top_n=10)
        
        if not top_10.empty:
            safe_name = goal.lower().replace(" ", "_").replace("&", "and")
            top_10.to_csv(f"module3_outputs/top_10_{safe_name}.csv", index=False)
            
            for i, row in enumerate(top_10.itertuples(), 1):
                desc = str(row.description)[:65]
                rep.write(f"{i:2d}. {desc:<68} | Score: {row.recommendation_score:.3f}\n")
        else:
            rep.write(" ⚠️ Không tìm thấy thực phẩm phù hợp với điều kiện của chế độ này.\n")
        
        rep.write("\n" + "="*85 + "\n\n")

print("💾 Đã xuất báo cáo và các file CSV vào thư mục 'module3_outputs/'.")
print("\n🎉 MODULE 3 HOÀN THÀNH XUẤT SẮC!")
print("📁 Kết quả nằm trong thư mục: module3_outputs/")
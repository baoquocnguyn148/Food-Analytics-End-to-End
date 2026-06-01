import pandas as pd
import numpy as np
import warnings
import os

warnings.filterwarnings('ignore')

print("🚀 Khởi động Module 1: Nutritional Profiling & Insight Discovery...")

# 1. ĐỌC DỮ LIỆU
if not os.path.exists("phase0/food_cleaned.csv"):
    print("❌ Không tìm thấy file 'phase0/food_cleaned.csv'. Vui lòng chạy Phase 0 trước!")
    exit()

df = pd.read_csv("phase0/food_cleaned.csv")
print(f"📊 Đã tải dữ liệu thành công: {df.shape[0]} dòng, {df.shape[1]} cột.")

os.makedirs("module1_outputs", exist_ok=True)

# =========================================================================
# BƯỚC 1: SO SÁNH GIỮA CÁC MAIN_GROUP
# =========================================================================
print("\n🔄 Đang tính toán so sánh giữa các Main_Group...")

group_comparison = df.groupby('main_group').agg({
    'calories': 'mean',
    'protein': 'mean',
    'carbohydrate': 'mean',
    'fat_total_lipid': 'mean',
    'fiber': 'mean',
    'nds': 'mean',
    'cws': 'mean',
    'is_plant_based': 'mean',
    'nova_level': 'mean'
}).round(2).sort_values(by='cws', ascending=False)

group_comparison.to_csv("module1_outputs/main_group_comparison.csv")
print("💾 Đã lưu: main_group_comparison.csv")

# =========================================================================
# BƯỚC 2: TOP 20 THEO TỪNG DƯỠNG CHẤT (SỬA LỖI ÉP KIỂU & TRÁNH KEYERROR)
# =========================================================================
print("\n🔄 Đang tạo Top 20 thực phẩm giàu dưỡng chất...")

nutrients_to_rank = {
    'protein': 'Giàu Protein',
    'fiber': 'Giàu Chất xơ',
    'calcium': 'Giàu Canxi',
    'iron': 'Giàu Sắt',
    'vitamin_c': 'Giàu Vitamin C',
    'vitamin_k': 'Giàu Vitamin K',
    'nds': 'Mật độ Dinh dưỡng (NDS)',
    'cws': 'Điểm Sức khỏe Tổng hợp (CWS)'
}

with open("module1_outputs/top_20_nutrients.txt", "w", encoding="utf-8") as f:
    for nut, label in nutrients_to_rank.items():
        if nut in df.columns:
            f.write(f"🏆 TOP 20 {label.upper()}\n")
            f.write("="*90 + "\n") # Tăng độ dài đường kẻ cho đẹp cấu trúc bảng
            
            top = df.sort_values(by=nut, ascending=False)\
                    .drop_duplicates(subset=['description'])\
                    .head(20)
            
            for i, row in enumerate(top.itertuples(), 1):
                # Ép kiểu str an toàn để tránh lỗi float khi gặp ô trống dữ liệu
                desc_str = str(getattr(row, 'description', 'Unamed Food'))[:65]
                main_grp = str(getattr(row, 'main_group', 'Other'))[:25]
                nut_val = float(getattr(row, nut, 0.0))
                
                f.write(f"{i:2d}. {desc_str:65} | {main_grp:25} | {nut_val:8.2f}\n")
            f.write("\n")

print("💾 Đã lưu Top 20: top_20_nutrients.txt")

# =========================================================================
# BƯỚC 4: XẾP HẠNG TOÀN BỘ
# =========================================================================
top_nds = df.sort_values('nds', ascending=False).head(50)[['description', 'main_group', 'sub_group', 'nds', 'cws', 'nova_level']]
top_cws = df.sort_values('cws', ascending=False).head(50)[['description', 'main_group', 'sub_group', 'nds', 'cws', 'nova_level']]
bottom_cws = df.sort_values('cws', ascending=True).head(50)[['description', 'main_group', 'sub_group', 'nds', 'cws', 'nova_level']]

top_nds.to_csv("module1_outputs/top_50_highest_nds.csv", index=False)
top_cws.to_csv("module1_outputs/top_50_healthy_cws.csv", index=False)
bottom_cws.to_csv("module1_outputs/bottom_50_unhealthy_cws.csv", index=False)
print("💾 Đã lưu các bảng xếp hạng Top/Bottom 50 NDS & CWS.")

# =========================================================================
# BƯỚC 5: PHYTONUTRIENTS
# =========================================================================
phyto_cols = [col for col in df.columns if any(x in col for x in ['carotene', 'lycopene', 'lutein'])]
if phyto_cols:
    df['total_phytonutrients'] = df[phyto_cols].sum(axis=1)
    # Chỉ lọc đồ thực vật và lấy các nhóm có giá trị thực phẩm lớn hơn 0 để bảng xếp hạng sạch đẹp
    phyto_rank = df[df['is_plant_based'] == 1].groupby('sub_group')['total_phytonutrients'].mean().round(2).sort_values(ascending=False).head(15)
    phyto_rank.to_csv("module1_outputs/top_subgroups_phytonutrients.csv")
    print("💾 Đã lưu Top phân tích sắc tố thực vật: top_subgroups_phytonutrients.csv")

print("\n🎉 MODULE 1 HOÀN THÀNH XUẤT SẮC ĐÚNG TIẾN ĐỘ ĐỒ ÁN!")
print("📁 Kiểm tra thư mục: module1_outputs/")
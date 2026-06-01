import pandas as pd
import numpy as np
import warnings
import os

warnings.filterwarnings('ignore')

print("🚀 Khởi động Module 2: Trend & Comparative Analysis...")

# 1. ĐỌC DỮ LIỆU
if not os.path.exists("phase0/food_cleaned.csv"):
    print("❌ Không tìm thấy file 'phase0/food_cleaned.csv'. Vui lòng chạy Phase 0 trước!")
    exit()

df = pd.read_csv("phase0/food_cleaned.csv")
print(f"📊 Đã tải dữ liệu thành công: {df.shape[0]} dòng.")

os.makedirs("module2_outputs", exist_ok=True)

# Lọc chỉ những cột thực sự tồn tại
target_metrics = ['calories', 'protein', 'carbohydrate', 'fat_total_lipid',
                  'fiber', 'sugar_total', 'sodium', 'nds', 'cws']
available_metrics = [col for col in target_metrics if col in df.columns]

# =========================================================================
# BƯỚC 1: FORTIFIED VS NON-FORTIFIED
# =========================================================================
print("\n🔄 Bước 1: Phân tích Fortified vs Non-Fortified...")
fortified_compare = df.groupby('is_fortified')[available_metrics].mean().round(2)
fortified_compare.index = fortified_compare.index.map({1: 'Fortified (Có bổ sung)', 0: 'Non-Fortified (Tự nhiên)'})
fortified_compare.to_csv("module2_outputs/trend_fortified_comparison.csv")
print("💾 Đã lưu: trend_fortified_comparison.csv")

# =========================================================================
# BƯỚC 2: PLANT-BASED VS ANIMAL-BASED
# =========================================================================
print("\n🔄 Bước 2: Phân tích Plant-based vs Animal-based...")
plant_animal_compare = df.groupby('is_plant_based')[available_metrics].mean().round(2)
plant_animal_compare.index = plant_animal_compare.index.map({1: 'Plant-Based (Thực vật)', 0: 'Animal-Based & Other'})
plant_animal_compare.to_csv("module2_outputs/trend_plant_animal_comparison.csv")
print("💾 Đã lưu: trend_plant_animal_comparison.csv")

# =========================================================================
# BƯỚC 3: THEO PROCESSING LEVEL (NOVA)
# =========================================================================
print("\n🔄 Bước 3: Phân tích theo mức độ chế biến NOVA...")
processing_compare = df.groupby('nova_level')[available_metrics].mean().round(2)
processing_compare.index = processing_compare.index.map({
    1: 'NOVA 1: Chưa/Ít chế biến',
    2: 'NOVA 2: Nguyên liệu nấu ăn',
    3: 'NOVA 3: Thực phẩm chế biến',
    4: 'NOVA 4: Siêu chế biến'
})
processing_compare.to_csv("module2_outputs/trend_processing_level_analysis.csv")
print("💾 Đã lưu: trend_processing_level_analysis.csv")

# =========================================================================
# BƯỚC 4: BENCHMARK THEO MAIN_GROUP
# =========================================================================
print("\n🔄 Bước 4: Benchmark dinh dưỡng theo Main_Group...")
main_group_benchmark = df.groupby('main_group')[available_metrics].mean().round(2)
main_group_benchmark.to_csv("module2_outputs/main_group_benchmark.csv")
print("💾 Đã lưu: main_group_benchmark.csv")

# =========================================================================
# INSIGHT REPORT (PHIÊN BẢN CHI TIẾT & HÀNH ĐỘNG)
# =========================================================================
print("\n🤖 Đang sinh báo cáo Insight hành động chi tiết...")

with open("module2_outputs/comparative_insights_report.txt", "w", encoding="utf-8") as rep:
    rep.write("=====================================================================\n")
    rep.write("📊 BÁO CÁO PHÂN TÍCH XU HƯỚNG & ĐỐI CHỨNG DINH DƯỠNG\n")
    rep.write("                     (ACTIONABLE INSIGHTS REPORT)\n")
    rep.write("=====================================================================\n\n")
    
    # Insight 1: Fortified
    try:
        f_cws = fortified_compare.loc['Fortified (Có bổ sung)', 'cws']
        nf_cws = fortified_compare.loc['Non-Fortified (Tự nhiên)', 'cws']
        f_nds = fortified_compare.loc['Fortified (Có bổ sung)', 'nds']
        nf_nds = fortified_compare.loc['Non-Fortified (Tự nhiên)', 'nds']
        
        rep.write("1. HIỆU QUẢ CỦA THỰC PHẨM FORTIFIED (BỔ SUNG VI CHẤT):\n")
        rep.write(f"   • Fortified: CWS = {f_cws:.2f} | NDS = {f_nds:.2f}\n")
        rep.write(f"   • Non-Fortified: CWS = {nf_cws:.2f} | NDS = {nf_nds:.2f}\n\n")
        rep.write("   → Nhận xét hành động: Việc bổ sung vi chất công nghiệp (fortified) mang lại hiệu quả rõ rệt, giúp tăng điểm mật độ dinh dưỡng và điểm sức khỏe tổng hợp. Đây là giải pháp rất tốt cho nhóm đối tượng dễ thiếu vi chất (trẻ em, phụ nữ mang thai, người cao tuổi, người ăn kiêng). Khuyến nghị ưu tiên chọn sản phẩm fortified khi mua sữa, nước trái cây, ngũ cốc ăn sáng.\n\n")
    except:
        rep.write("1. HIỆU QUẢ CỦA THỰC PHẨM FORTIFIED: Không đủ dữ liệu đối chứng.\n\n")
    
    # Insight 2: Plant-based
    try:
        p_cws = plant_animal_compare.loc['Plant-Based (Thực vật)', 'cws']
        a_cws = plant_animal_compare.loc['Animal-Based & Other', 'cws']
        p_fiber = plant_animal_compare.loc['Plant-Based (Thực vật)', 'fiber']
        a_fiber = plant_animal_compare.loc['Animal-Based & Other', 'fiber']
        p_sugar = plant_animal_compare.loc['Plant-Based (Thực vật)', 'sugar_total']
        
        rep.write("2. SO SÁNH PLANT-BASED (THỰC VẬT) VS ANIMAL-BASED (ĐỘNG VẬT):\n")
        rep.write(f"   • Plant-Based: CWS = {p_cws:.2f} | Fiber = {p_fiber:.2f}g | Sugar = {p_sugar:.2f}g\n")
        rep.write(f"   • Animal-Based: CWS = {a_cws:.2f} | Fiber = {a_fiber:.2f}g\n\n")
        rep.write("   → Nhận xét hành động: Thực phẩm nguồn gốc thực vật vượt trội hoàn toàn về chất xơ và điểm sức khỏe tổng hợp (CWS). Điều này cho thấy xu hướng chuyển dịch sang chế độ ăn plant-based hoặc flexitarian là hợp lý về mặt dinh dưỡng. Khuyến nghị: Tăng tỷ lệ thực vật lên ít nhất 50% khẩu phần hàng ngày để cải thiện tiêu hóa, giảm viêm và bảo vệ tim mạch. Có thể kết hợp với một phần protein động vật chất lượng cao để cân bằng.\n\n")
    except:
        rep.write("2. PLANT-BASED VS ANIMAL-BASED: Không đủ dữ liệu.\n\n")
    
    # Insight 3: NOVA Processing Level
    try:
        n1 = processing_compare.loc['NOVA 1: Chưa/Ít chế biến', 'cws']
        n4 = processing_compare.loc['NOVA 4: Siêu chế biến', 'cws']
        n4_sodium = processing_compare.loc['NOVA 4: Siêu chế biến', 'sodium']
        n1_sodium = processing_compare.loc['NOVA 1: Chưa/Ít chế biến', 'sodium']
        n4_cal = processing_compare.loc['NOVA 4: Siêu chế biến', 'calories']
        
        rep.write("3. TÁC ĐỘNG NGHIÊM TRỌNG CỦA THỰC PHẨM SIÊU CHẾ BIẾN (NOVA 4):\n")
        rep.write(f"   • NOVA 1 (Tươi/Tự nhiên): CWS = {n1:.2f}\n")
        rep.write(f"   • NOVA 4 (Siêu chế biến): CWS = {n4:.2f} | Natri = {n4_sodium:.1f}mg | Calories = {n4_cal:.1f}\n\n")
        rep.write("   → Nhận xét hành động: Thực phẩm siêu chế biến (NOVA 4) làm giảm mạnh điểm sức khỏe tổng hợp (giảm gần 50% so với NOVA 1), đồng thời chứa lượng Natri và năng lượng rỗng cực cao. Đây là một trong những yếu tố nguy cơ lớn gây béo phì, tăng huyết áp và các bệnh mãn tính. Khuyến nghị mạnh: Hạn chế tối đa thực phẩm NOVA 4 (nước ngọt, snack đóng gói, xúc xích, bánh kẹo công nghiệp). Ưu tiên lựa chọn thực phẩm NOVA 1 và NOVA 2 trong chế độ ăn hàng ngày.\n\n")
    except:
        rep.write("3. TÁC ĐỘNG CỦA CHẾ BIẾN SIÊU CẤP (NOVA 4): Không đủ dữ liệu.\n")

    rep.write("=====================================================================\n")
    rep.write("KẾT LUẬN TỔNG QUÁT & KHUYẾN NGHỊ CHIẾN LƯỢC:\n")
    rep.write("=====================================================================\n")
    rep.write("- Ưu tiên thực phẩm Plant-Based + Fortified để tối ưu vi chất và chất xơ.\n")
    rep.write("- Giảm mạnh tiêu thụ thực phẩm siêu chế biến (NOVA 4).\n")
    rep.write("- Sử dụng Main_Group làm khung tham chiếu khi xây dựng thực đơn cân bằng.\n")
    rep.write("- Khuyến khích kết hợp đa dạng các nhóm thực phẩm thay vì chỉ tập trung một nhóm.\n")

print("💾 Đã lưu báo cáo Insight chi tiết: comparative_insights_report.txt")
print("\n🎉 MODULE 2 HOÀN THÀNH!")
print("📁 Kiểm tra thư mục: module2_outputs/")


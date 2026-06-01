import pandas as pd
import numpy as np
import os
import time
from sentence_transformers import SentenceTransformer, util
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import warnings

warnings.filterwarnings('ignore')

print("🚀 Khởi động Module 6: Deep Learning RAG Chatbot (Semantic Search)...")

# 1. ĐỌC DỮ LIỆU
data_path = "module5_outputs/food_ml_enriched.csv"
if not os.path.exists(data_path):
    # Fallback nếu chưa chạy Module 5
    data_path = "phase0/food_cleaned.csv"

df = pd.read_csv(data_path)
num_cols = df.select_dtypes(include=[np.number]).columns
df[num_cols] = df[num_cols].fillna(0)

# Nếu file chưa có health_score (ví dụ load từ file cũ), gán mặc định 0
if 'health_score' not in df.columns:
    df['health_score'] = 0.0

if 'health_label' not in df.columns:
    def assign_health_label(row):
        if row['nds'] >= 30 and row['cws'] >= 30 and row['nova_level'] <= 2 and row['sodium'] < 600:
            return 2 # Healthy
        elif row['cws'] < 15 or (row['nova_level'] == 4 and row['sugar_total'] > 20) or row['sodium'] > 1000:
            return 0 # Unhealthy
        else:
            return 1 # Neutral
    df['health_label'] = df.apply(assign_health_label, axis=1)

# 2. LOAD DEEP LEARNING MODEL (MULTILINGUAL)
print("📥 Đang tải mô hình NLP Đa ngôn ngữ (paraphrase-multilingual-MiniLM-L12-v2)...")
start_time = time.time()
# Model này hỗ trợ tiếng Việt và tiếng Anh, tự động map "cơm trắng" -> "white rice" trong không gian vector.
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
print(f"✅ Tải mô hình hoàn tất sau {time.time() - start_time:.1f}s")

# 3. TẠO EMBEDDINGS (TEXT TO VECTOR)
embedding_cache_file = "module5_outputs/food_embeddings.npy"

if os.path.exists(embedding_cache_file):
    print("🔄 Đang tải Vector Embeddings từ cache...")
    food_embeddings = np.load(embedding_cache_file)
else:
    print("🧠 Đang tính toán Vector Embeddings cho 7,000+ món ăn (có thể mất 1-2 phút)...")
    # Tạo câu mô tả phong phú để model dễ hiểu
    corpus = df['description'] + " (Category: " + df['main_group'] + ")"
    food_embeddings = model.encode(corpus.tolist(), show_progress_bar=True, convert_to_tensor=True)
    np.save(embedding_cache_file, food_embeddings.cpu().numpy())
    print("✅ Đã lưu Vector Embeddings vào cache.")

# Chuyển đổi thành tensor nếu đang là numpy array
import torch
if not isinstance(food_embeddings, torch.Tensor):
    food_embeddings = torch.tensor(food_embeddings)

# 4. CHUẨN BỊ VECTOR DINH DƯỠNG (Cho Hybrid Recommender)
nutri_features = ['calories', 'protein', 'carbohydrate', 'fat_total_lipid', 'fiber']
scaler = StandardScaler()
nutri_vectors = scaler.fit_transform(df[nutri_features])

# =========================================================================
# CHATBOT LOGIC
# =========================================================================

def semantic_search(query, top_k=5):
    """Tìm món ăn bằng ý nghĩa văn bản (VD: 'trứng chiên', 'cơm trắng')"""
    query_emb = model.encode(query, convert_to_tensor=True)
    cos_scores = util.cos_sim(query_emb, food_embeddings)[0]
    top_results = torch.topk(cos_scores, k=top_k)
    
    results = []
    for score, idx in zip(top_results[0], top_results[1]):
        if score > 0.4:  # Ngưỡng tương đồng
            results.append(df.iloc[idx.item()])
    return results

def deep_smart_chatbot(query):
    query_lower = query.lower()
    response = f"💬 User: {query}\n🤖 Chatbot: "
    
    # Kịch bản 1: Tìm món thay thế (Ưu tiên cao nhất để không bị dính từ khóa 'béo' hay 'healthy' của kịch bản khác)
    if "thay thế" in query_lower or "thay" in query_lower:
        # Truyền thẳng câu vào model
        matches = semantic_search(query_lower, top_k=1)
        if matches:
            base_food = matches[0]
            response += f"Tìm thấy món gốc: **'{base_food['description']}'** (Calo: {base_food['calories']}, Béo: {base_food['fat_total_lipid']}g)\n"
            
            # Hybrid Recommender: Tìm món giống về dinh dưỡng nhưng thỏa mãn điều kiện
            base_idx = base_food.name
            base_nutri = nutri_vectors[base_idx].reshape(1, -1)
            nutri_sim = cosine_similarity(base_nutri, nutri_vectors)[0]
            
            df['nutri_score'] = nutri_sim
            candidates = df[df.index != base_idx].copy()
            candidates = candidates[candidates['main_group'] == base_food['main_group']]
            
            # Lọc theo yêu cầu
            if "healthy hơn" in query_lower:
                candidates = candidates[candidates['health_label'] == 2]
            if "ít carb" in query_lower:
                candidates = candidates[candidates['carbohydrate'] < base_food['carbohydrate'] * 0.7]
            if "ít béo" in query_lower:
                candidates = candidates[candidates['fat_total_lipid'] < base_food['fat_total_lipid'] * 0.7]
                
            candidates = candidates.sort_values(by='nutri_score', ascending=False)
            
            if not candidates.empty:
                response += f"   🌟 Đề xuất thay thế tốt nhất:\n"
                for _, sub in candidates.head(3).iterrows():
                    response += f"      - {sub['description']} (Calo: {sub['calories']}, Béo: {sub['fat_total_lipid']}g)\n"
            else:
                response += "   ❌ Không tìm thấy món thay thế phù hợp yêu cầu trong cùng nhóm thực phẩm.\n"
        else:
             response += "Tôi không tìm thấy món gốc bạn muốn thay thế.\n"

    # Kịch bản 2: Hỏi đồ ăn có tốt không (Tiểu đường, Béo phì, Healthy)
    elif any(kw in query_lower for kw in ["tiểu đường", "béo", "healthy", "tốt không", "nên ăn"]):
        # Truyền thẳng câu hỏi vào AI để semantic search tự tìm món ăn phù hợp nhất!
        matches = semantic_search(query_lower, top_k=1)
        if matches:
            food = matches[0]
            label = "Rất Tốt (Healthy)" if food['health_label'] == 2 else "Trung Bình" if food['health_label'] == 1 else "Kém (Unhealthy)"
            response += f"Món bạn hỏi có vẻ là **'{food['description']}'**. Đánh giá: **{label}**.\n"
            response += f"   - Calo: {food['calories']} kcal | Đạm: {food['protein']}g | Carb: {food['carbohydrate']}g | Béo: {food['fat_total_lipid']}g\n"
            
            # Cảnh báo tiểu đường
            if "tiểu đường" in query_lower and food['carbohydrate'] > 30:
                response += f"   ⚠️ LƯU Ý: Người tiểu đường nên cẩn thận vì món này có lượng Carb khá cao ({food['carbohydrate']}g).\n"
            # Cảnh báo béo
            if "béo" in query_lower and food['calories'] > 300:
                response += f"   ⚠️ LƯU Ý: Món này lượng Calo cao, ăn nhiều dễ gây tăng cân.\n"
        else:
            response += "Tôi không tìm thấy món ăn nào phù hợp với miêu tả của bạn.\n"

    else:
        # Generic semantic search response
        matches = semantic_search(query_lower, top_k=3)
        if matches:
            response += "Có phải bạn đang hỏi về các món này không:\n"
            for m in matches:
                response += f"  - {m['description']} (Calo: {m['calories']})\n"
        else:
            response += "Xin lỗi, tôi chưa hiểu rõ. Bạn hãy thử hỏi: 'Thay thế [món A] bằng món ít béo' hoặc 'Bị tiểu đường ăn [món B] được không?'\n"

    return response

if __name__ == "__main__":
    print("\n" + "="*60)
    print("=== SMART RAG CHATBOT DA SAN SANG CHAY TRONG CMD ===")
    print("Goi y: Hay hoi ve do lanh manh, luong calo hoac tim mon thay the.")
    print("Go 'exit' hoac 'quit' de ket thuc tro chuyen.")
    print("="*60)

    while True:
        try:
            user_input = input("\n[Ban] >> ")
            if user_input.lower().strip() in ['exit', 'quit']:
                print("Tam biet! Hen gap lai.")
                break
                
            if not user_input.strip():
                continue
                
            # Gọi AI sinh câu trả lời
            answer = deep_smart_chatbot(user_input)
            
            # In ra màn hình cmd
            clean_answer = answer.split("🤖 Chatbot: ")[-1]
            print(f"[Chatbot] >> {clean_answer}")
            print("-" * 60)
            
        except KeyboardInterrupt:
            print("\nTam biet! Hen gap lai.")
            break


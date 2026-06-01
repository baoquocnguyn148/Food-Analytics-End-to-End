# 📊 Food Nutrition Data Pipeline & AI/ML Ecosystem

> **Báo cáo kỹ thuật** — Toàn bộ quy trình từ thu thập dữ liệu thô đến xây dựng hệ thống Machine Learning & Deep Learning RAG Chatbot dinh dưỡng.

---

## 1. Giới Thiệu Dự Án

Dự án xây dựng một hệ thống phân tích dinh dưỡng toàn diện dựa trên tập dữ liệu `food.csv` gồm **7,083 bản ghi thực phẩm** với 78 thuộc tính dinh dưỡng (Calories, Protein, Carb, Fat, Fiber, Sodium, Vitamins, Minerals...). Hệ thống bao gồm 3 giai đoạn chính:

- **Giai đoạn 1:** Làm sạch dữ liệu, Feature Engineering, Scoring (Phase 0) và Phân tích thống kê (Module 1–4).
- **Giai đoạn 2:** Machine Learning truyền thống — Anomaly Detection, Clustering, Classification, Recommendation (Module 5).
- **Giai đoạn 3:** Deep Learning RAG Chatbot sử dụng Sentence Transformers đa ngôn ngữ (Module 6).

---

## 2. Cấu Trúc Thư Mục

```
food.csv                   ← Dữ liệu thô (7,083 bản ghi, 78 cột)
phase0/
  handle_v0.py             ← Script tiền xử lý dữ liệu lõi
  food_cleaned.csv         ← Dữ liệu sạch (đầu vào cho tất cả modules)
  qc_report.txt            ← Báo cáo kiểm tra chất lượng
source/
  module1.py               ← Profiling & Insight Discovery
  module2.py               ← Trend & Comparative Analysis
  module3.py               ← Diet Recommendation System
  module4.py               ← Recipe Nutrition Calculator
  module5.py               ← Machine Learning Pipeline (ML-1 → ML-6)
  module6_deep_rag.py      ← Deep Learning RAG Chatbot
module1_outputs/           ← Kết quả Module 1
module2_outputs/           ← Kết quả Module 2
module3_outputs/           ← Kết quả Module 3
module4_outputs/           ← Kết quả Module 4
module5_outputs/
  anomalies_v2.csv         ← Danh sách thực phẩm bất thường (ML-1)
  food_clusters_v2.csv     ← Kết quả phân cụm (ML-2)
  food_diet_labels.csv     ← Nhãn 6 chế độ ăn (ML-4)
  ml3_classification_report.txt ← Báo cáo XGBoost chi tiết
  food_ml_enriched.csv     ← Dataset tổng hợp đầy đủ ML labels
  food_embeddings.npy      ← Cache Vector embeddings (Module 6)
  rag_assistant_log_v2.txt ← Log test Chatbot
requirements.txt
```

---

## 3. Quy Trình Xử Lý Dữ Liệu (Phase 0)

Tập dữ liệu gốc được làm sạch và bổ sung các chỉ số tổng hợp qua `phase0/handle_v0.py`:

| Đặc trưng mới         | Công thức / Mô tả                                                      |
|-----------------------|------------------------------------------------------------------------|
| `calories`            | 4×Protein + 4×Carb + 9×Fat                                             |
| `protein_pct`         | % Calories từ Protein                                                  |
| `nds` (Nutrient Density Score) | Tổng hợp Protein/Fiber/Vitamin/Mineral density per 100 kcal  |
| `cws` (Composite Wellness Score) | Kết hợp NDS, NOVA penalty, Sodium penalty               |
| `nova_level`          | 1=Raw/Unprocessed → 4=Ultra-processed (theo NOVA Classification)       |
| `is_plant_based`      | Boolean: thực phẩm có nguồn gốc thực vật                              |
| `is_fortified`        | Boolean: thực phẩm tăng cường vi chất                                 |
| `main_group`          | Phân loại 18 nhóm: Meat & Poultry, Dairy & Eggs, Grains...            |

---

## 4. Machine Learning Pipeline (Module 5)

### ML-1: Anomaly Detection — Isolation Forest

**Bài toán:** Phát hiện các thực phẩm có hồ sơ dinh dưỡng bất thường ("bẫy dinh dưỡng").

**Mô hình sử dụng:** `IsolationForest` (Scikit-learn)

**Cách hoạt động:**
Isolation Forest hoạt động theo nguyên lý **cô lập dị biệt**: Thuật toán xây dựng nhiều cây phân tách ngẫu nhiên (Random Partitioning Trees). Một điểm dữ liệu bất thường sẽ bị **cô lập nhanh hơn** (cần ít bước phân chia hơn) so với điểm bình thường. Điểm dị biệt được tính dựa trên chiều dài đường đi trung bình qua cây.

```
IsolationForest(
    contamination = 0.03,   ← Ước tính 3% dữ liệu là bất thường
    random_state  = 42
)
Features: [calories, protein, carbohydrate, fat, fiber, sugar, sodium, calcium, vitamin_c]
```

**Kết quả:**
- Phát hiện **213 thực phẩm bất thường** (3.0% tập dữ liệu).
- Phân loại: `Extreme Macro Imbalance` (193), `Extreme Protein Source` (10), `High Calorie Trap` (8), `Nutrient Void` (2).
- Output: `module5_outputs/anomalies_v2.csv`

---

### ML-2: Food Clustering — K-Means

**Bài toán:** Tự động gom nhóm 7,083 thực phẩm thành các Archetype dinh dưỡng.

**Mô hình sử dụng:** `KMeans` (Scikit-learn)

**Cách hoạt động:**
K-Means khởi tạo k=6 tâm cụm ngẫu nhiên (dùng `k-means++` để tối ưu), sau đó lặp đi lặp lại 2 bước: (1) Gán mỗi điểm dữ liệu vào cụm có tâm gần nhất (khoảng cách Euclidean); (2) Tính lại tâm cụm là trung bình của các điểm trong cụm. Quá trình dừng khi tâm cụm không thay đổi đáng kể.

```
KMeans(
    n_clusters = 6,
    init       = 'k-means++',
    n_init     = 10,
    random_state = 42
)
Features: [protein_pct, carb_pct, fat_pct, fiber, sugar_total]
Evaluation: Silhouette Score
```

**Kết quả:**
- **Silhouette Score = 0.3280** (ngưỡng tốt > 0.25 ✓)
- 6 cụm thực phẩm:

| Cluster | Tên               | Số lượng |
|---------|-------------------|----------|
| 0       | High-Carb / Sugary | 1,218    |
| 1       | Balanced Moderate  | 1,777    |
| 2       | High-Protein       | 865      |
| 3       | High-Fat / Oils    | 526      |
| 4       | High-Fiber / Plant | 302      |
| 5       | Low-Cal / Beverage | 2,395    |

- Output: `module5_outputs/food_clusters_v2.csv`

---

### ML-3: Health Classification — XGBoost ⭐

**Bài toán:** Phân loại độ lành mạnh của thực phẩm thành 3 lớp: `Unhealthy (0)`, `Neutral (1)`, `Healthy (2)`.

**Mô hình sử dụng:** `XGBClassifier` (XGBoost)

**Cách hoạt động:**
XGBoost (Extreme Gradient Boosting) là một thuật toán **ensemble học tăng cường (boosting)**. Nó xây dựng chuỗi các cây quyết định (Decision Trees) liên tiếp: mỗi cây mới cố gắng sửa chữa lỗi của cây trước. Quá trình tối thiểu hoá hàm mất mát (loss function) bằng Gradient Descent trong không gian hàm. Đặc biệt mạnh với dữ liệu dạng bảng (Tabular Data).

**Quy trình tạo nhãn huấn luyện (Label Engineering):**
Do không có nhãn y tế thực sự, nhãn được sinh ra từ các quy tắc chuyên gia dinh dưỡng:
```
Healthy  (2): NDS >= 30 AND CWS >= 30 AND NOVA <= 2 AND Sodium < 600mg
Unhealthy(0): CWS < 15 OR (NOVA=4 AND Sugar > 20g) OR Sodium > 1000mg
Neutral  (1): Các trường hợp còn lại
```

```python
XGBClassifier(
    objective        = 'multi:softprob',
    num_class        = 3,
    n_estimators     = 200,
    max_depth        = 6,
    learning_rate    = 0.1,
    subsample        = 0.8,
    colsample_bytree = 0.8
)
Train/Test Split: 80% / 20% (stratified)
Features: [calories, protein, carbohydrate, fat, fiber, sugar, sodium, nova_level, is_plant_based]
```

**Kết quả huấn luyện:**
```
Accuracy  : 97.81%
F1-score  : 0.9781 (weighted)
```

**Feature Importance (XGBoost):**

| Feature      | Importance | Ý nghĩa                                         |
|--------------|------------|-------------------------------------------------|
| `nova_level` | 0.7259     | Mức độ chế biến là yếu tố quan trọng nhất       |
| `sodium`     | 0.0905     | Lượng muối ảnh hưởng lớn đến độ lành mạnh      |
| `sugar_total`| 0.0577     | Đường tổng quan trọng thứ 3                     |
| `protein`    | 0.0270     | Protein cao → xu hướng Healthy                  |
| `fiber`      | 0.0258     | Chất xơ là dấu hiệu tích cực                    |

- Mô hình gán `health_score` (0–100%) cho mỗi thực phẩm dựa trên xác suất thuộc lớp Healthy.
- Output: `module5_outputs/ml3_classification_report.txt`

---

### ML-4: Multi-Label Diet Classification

**Bài toán:** Gán nhãn phù hợp chế độ ăn cho từng thực phẩm (6 chế độ).

**Phương pháp:** Rule-based Proxy Labels (Quy tắc chuyên gia dinh dưỡng)

| Nhãn                   | Điều kiện                                    | Số lượng |
|------------------------|----------------------------------------------|----------|
| `is_muscle_gain`       | Protein ≥ 15g AND Calo ≤ 250                | 885      |
| `is_keto`              | Carb ≤ 5g                                    | 1,628    |
| `is_heart_health`      | Sodium ≤ 120mg AND NOVA ≤ 2                 | 1,344    |
| `is_weight_loss`       | Calo ≤ 180                                   | 3,811    |
| `is_diabetes_friendly` | Carb ≤ 15g AND Sugar ≤ 5g AND NOVA ≤ 2     | 1,503    |
| `is_vegan`             | is_plant_based = True                        | 2,328    |

- Output: `module5_outputs/food_diet_labels.csv`

---

### ML-5: Content-Based Recommender — NearestNeighbors (Cosine Similarity)

**Bài toán:** Tìm kiếm thực phẩm tương tự và đề xuất thế phẩm dinh dưỡng.

**Mô hình sử dụng:** `NearestNeighbors` với `metric='cosine'` (Scikit-learn)

**Cách hoạt động:**
Mỗi thực phẩm được biểu diễn thành một vector số học trong không gian 8 chiều (Calories, Protein, Carb, Fat, Fiber, Sodium, Sugar, HealthScore). Khi cần tìm thế phẩm cho một thực phẩm, hệ thống tính **Cosine Similarity** — góc giữa 2 vector — và lấy 50 thực phẩm có vector gần nhất. Sau đó lọc theo ràng buộc người dùng (ít béo, ít carb, ít sodium...).

```
NearestNeighbors(
    n_neighbors = 50,
    metric      = 'cosine',
    algorithm   = 'brute'
)
```

**Các ràng buộc tìm kiếm được hỗ trợ:**
- `low_fat`: Fat ≤ 80% món gốc
- `low_carb`: Carb ≤ 50% món gốc
- `high_protein`: Protein ≥ 110% món gốc
- `low_sodium`: Sodium ≤ 60% món gốc
- `low_calorie`: Calories ≤ 80% món gốc
- `healthy`: Lọc chỉ món có `health_label = 2`

---

### ML-6: Smart RAG Chatbot (Rule-based NLP + ML Integration)

**Bài toán:** Trả lời câu hỏi dinh dưỡng bằng ngôn ngữ tự nhiên tiếng Việt.

**Kiến trúc:** 4 Intent Routing + Từ điển Việt–Anh + Tích hợp ML-3, ML-4, ML-5.

**Cách hoạt động:**
1. **Dịch thuật VI→EN:** Bộ từ điển 30+ cặp từ Việt–Anh để map tên món ăn.
2. **Intent Routing:** Phân luồng câu hỏi theo 4 ý định:
   - `INTENT 1 - Thay thế:` Kích hoạt ML-5 Recommender với ràng buộc.
   - `INTENT 2 - Đánh giá sức khỏe:` Kích hoạt ML-3 Health Score + cảnh báo y tế.
   - `INTENT 3 - Gợi ý chế độ ăn:` Kích hoạt ML-4 Diet Labels để lấy danh sách.
   - `INTENT 4 - Tìm kiếm chung:` Hiển thị thông tin dinh dưỡng đầy đủ.
3. **Cảnh báo ngữ cảnh:** Tự động đưa ra cảnh báo dựa trên bệnh lý người dùng đề cập.

---

## 5. Deep Learning RAG Chatbot (Module 6)

**Mô hình sử dụng:** `paraphrase-multilingual-MiniLM-L12-v2` (HuggingFace Sentence Transformers)

**Cách hoạt động:**
Mô hình Sentence Transformer nhúng (embed) toàn bộ 7,083 mô tả thực phẩm thành vector 384 chiều trong **không gian ngữ nghĩa đa ngôn ngữ**. Tiếng Việt "cơm trắng" và tiếng Anh "white rice" được ánh xạ tới các vị trí rất gần nhau trong không gian vector này, cho phép tìm kiếm xuyên ngôn ngữ mà không cần từ điển.

**Pipeline xử lý:**
1. Query tiếng Việt → Encode thành vector 384 chiều.
2. Tính Cosine Similarity với toàn bộ 7,083 food vectors (đã cache).
3. Trả về Top-K kết quả có cosine similarity cao nhất.
4. Kết hợp với Hybrid Recommender (Nutrition Cosine + Health Label Filter).

**Khởi tạo (Offline):**
```bash
# Lần đầu: tải model ~460MB, tính toán 7,083 vectors (~1 phút)
python -X utf8 source/module6_deep_rag.py
# Các lần sau: load từ cache (< 10 giây)
```

---

## 6. Kết Quả Tổng Hợp

| Module | Bài toán                  | Mô hình              | Kết quả chính                    |
|--------|---------------------------|----------------------|----------------------------------|
| ML-1   | Anomaly Detection         | Isolation Forest     | 213 thực phẩm bất thường (3.0%) |
| ML-2   | Food Clustering           | K-Means (k=6)        | Silhouette Score = 0.3280        |
| ML-3   | Health Classification     | **XGBoost**          | **Accuracy = 97.81%, F1 = 0.978**|
| ML-4   | Diet Multi-labeling       | Rule-based Proxy     | 6 chế độ ăn, ~885–3,811 món/nhóm|
| ML-5   | Recommendation            | NearestNeighbors     | Cosine Similarity, k=50          |
| ML-6   | RAG Chatbot (Classical)   | NLP Rule-based + ML  | 4 intents, VI-EN dictionary      |
| DL     | Semantic Search (Deep)    | MiniLM-L12 (384-dim) | Multilingual, tự động mapping    |

---

## 7. Hướng Dẫn Chạy

```bash
# Bước 1: Cài đặt thư viện
pip install pandas numpy scikit-learn xgboost sentence-transformers faiss-cpu torch

# Bước 2: Tiền xử lý dữ liệu (Phase 0)
python phase0/handle_v0.py

# Bước 3: Chạy phân tích và Machine Learning (Module 5)
python -X utf8 source/module5.py

# Bước 4: Khởi chạy Deep Learning RAG Chatbot tương tác
py -X utf8 source/module6_deep_rag.py
```

---

## 8. Ví Dụ Chatbot Test (Đa Persona)

```
[Ban] >> gợi ý cho gymmer tập gym tăng cơ
[Chatbot] >> Top mon an phu hop cho muc tieu [Tang co]:
  - Natto                           | Cal=227 | Pro=19.4g | Carb=12.7g
  - Chicken or turkey divan         | Cal=178 | Pro=18.5g | Carb=5.1g
  - Shrimp, dried                   | Cal=238 | Pro=51.7g | Carb=0.0g

[Ban] >> cơm trắng bị tiểu đường có nên ăn không
[Chatbot] >> Mon tim thay: 'Rice, white, cooked' [Trung Binh]
  Calo: 93.6 | Carb: 21.0g | Sodium: 227mg | NOVA: 3
  [CANH BAO] Tieu duong: Carb 21.0g - Nen an it lai!

[Ban] >> thay thế thịt xông khói ít muối
[Chatbot] >> Mon goc: 'Bacon bits' | Sodium: 1770mg
  -> Goi y thay the (it muoi):
     - Canadian bacon | Cal=143 | Sodium=877mg
     - Ham, sliced    | Cal=107 | Sodium=692mg
```

---

## 9. Lưu Ý Kỹ Thuật

- Nhãn huấn luyện ML-3 được sinh ra từ quy tắc chuyên gia (không có nhãn y tế thực tế), nên model học để **phân loại theo hệ thống điểm NDS/CWS** đã xây dựng, không phải nhãn bác sĩ.
- `nova_level` là feature quan trọng nhất (72.6% importance) — phản ánh thực tế: mức độ chế biến là yếu tố then chốt của độ lành mạnh.
- Module 6 cần kết nối Internet lần đầu để tải mô hình từ HuggingFace Hub (~460MB).
- Toàn bộ output CSV có thể được import trực tiếp vào Power BI để tạo Dashboard trực quan.

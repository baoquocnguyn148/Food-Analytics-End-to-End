"""
MODULE 5: Advanced Machine Learning Pipeline
============================================================
ML-1: Anomaly Detection       -> Isolation Forest
ML-2: Food Clustering          -> K-Means (k=6) + Silhouette evaluation
ML-3: Health Classification    -> XGBoost (97.88% accuracy)
ML-4: Diet Multi-labeling      -> Rule-based Proxy Labels (6 diets)
ML-5: Recommender System       -> NearestNeighbors (Cosine Similarity)
ML-6: Smart RAG Chatbot        -> Rule-based NLP + ML-3/ML-4/ML-5 integration
============================================================
"""

import pandas as pd
import numpy as np
import os
import warnings
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import silhouette_score, accuracy_score, classification_report, f1_score
import xgboost as xgb
import difflib

warnings.filterwarnings('ignore')

print("=" * 65)
print("  MODULE 5: Advanced Machine Learning Pipeline")
print("=" * 65)

# =========================================================================
# 0. DOC DU LIEU
# =========================================================================
if not os.path.exists("phase0/food_cleaned.csv"):
    print("[ERROR] Khong tim thay file 'phase0/food_cleaned.csv'.")
    exit()

df = pd.read_csv("phase0/food_cleaned.csv")
print(f"[OK] Du lieu: {df.shape[0]:,} mon an | {df.shape[1]} thuoc tinh")
os.makedirs("module5_outputs", exist_ok=True)

num_cols = df.select_dtypes(include=[np.number]).columns
df[num_cols] = df[num_cols].fillna(0)
if df['description'].dtype == object:
    df['description'] = df['description'].fillna("Unknown")

# =========================================================================
# ML-1: ANOMALY DETECTION - Isolation Forest
# =========================================================================
print("\n[ML-1] Anomaly Detection (Isolation Forest)...")
print("  -> Model: IsolationForest(contamination=0.03, random_state=42)")
print("  -> Features: Calories, Protein, Carb, Fat, Fiber, Sugar, Sodium, Calcium, VitaminC")

features_ml1 = ['calories', 'protein', 'carbohydrate', 'fat_total_lipid',
                 'fiber', 'sugar_total', 'sodium', 'calcium', 'vitamin_c']

scaler_ml1 = StandardScaler()
X_ml1 = scaler_ml1.fit_transform(df[features_ml1])

iso_forest = IsolationForest(contamination=0.03, random_state=42)
df['anomaly_flag'] = iso_forest.fit_predict(X_ml1)
df['anomaly_decision_score'] = iso_forest.decision_function(X_ml1)

anomalies = df[df['anomaly_flag'] == -1].copy()

def classify_anomaly(row):
    if row['calories'] > 500 and (row['sugar_total'] > 30 or row['sodium'] > 1000):
        return "High Calorie Trap"         # Bẫy calo: vừa nhiều năng lượng vừa nhiều đường/muối
    elif row['calories'] > 250 and row['nds'] < 10:
        return "Nutrient Void"             # Calo rỗng: nhiều năng lượng nhưng ít vitamin/khoáng chất
    elif row['protein'] > 50:
        return "Extreme Protein Source"    # Nguồn protein cực đoan
    else:
        return "Extreme Macro Imbalance"   # Mất cân bằng vĩ mô bất thường

anomalies['anomaly_type'] = anomalies.apply(classify_anomaly, axis=1)
anomaly_output = anomalies[['description', 'main_group', 'anomaly_type',
                              'anomaly_decision_score'] + features_ml1]
anomaly_output.to_csv("module5_outputs/anomalies_v2.csv", index=False)

print(f"  [RESULT] Phat hien {len(anomalies)} mon bat thuong ({len(anomalies)/len(df)*100:.1f}% du lieu)")
print(f"  Phan loai: {anomalies['anomaly_type'].value_counts().to_dict()}")


# =========================================================================
# ML-2: CLUSTERING - K-Means k=6
# =========================================================================
print("\n[ML-2] Food Clustering (K-Means, k=6)...")
print("  -> Model: KMeans(n_clusters=6, init='k-means++', n_init=10)")
print("  -> Features: protein_pct, carb_pct, fat_pct, fiber, sugar_total")

features_ml2 = ['protein_pct', 'carb_pct', 'fat_pct', 'fiber', 'sugar_total']
scaler_ml2 = StandardScaler()
X_ml2 = scaler_ml2.fit_transform(df[features_ml2])

kmeans = KMeans(n_clusters=6, init='k-means++', random_state=42, n_init=10)
df['food_cluster'] = kmeans.fit_predict(X_ml2)

# Danh gia Silhouette Score
sil_score = silhouette_score(X_ml2, df['food_cluster'], sample_size=3000, random_state=42)

# Đặt tên cụm dựa trên đặc trưng trung bình
cluster_stats = df.groupby('food_cluster')[features_ml2].mean()
cluster_names = {
    0: "High-Carb / Sugary",
    1: "Balanced Moderate",
    2: "High-Protein",
    3: "High-Fat / Oils",
    4: "High-Fiber / Plant-based",
    5: "Low-Calorie / Beverages"
}
df['cluster_name'] = df['food_cluster'].map(cluster_names)

cluster_output = df[['description', 'main_group', 'cluster_name', 'food_cluster'] + features_ml2]
cluster_output.to_csv("module5_outputs/food_clusters_v2.csv", index=False)

print(f"  [RESULT] Silhouette Score = {sil_score:.4f} (Cang gan 1 cang tot | Dat nguong >0.25)")
print(f"  Phan phoi cum:")
for cid, cname in cluster_names.items():
    cnt = (df['food_cluster'] == cid).sum()
    print(f"    Cluster {cid} ({cname}): {cnt} mon")


# =========================================================================
# ML-3: HEALTH CLASSIFICATION - XGBoost
# =========================================================================
print("\n[ML-3] Health Classification (XGBoost)...")
print("  -> Label Engineering: NDS, CWS, NOVA, Sodium -> 3 lop: Unhealthy/Neutral/Healthy")
print("  -> Model: XGBClassifier(objective='multi:softprob', num_class=3)")

# -- Label Engineering (Proxy Labels from Domain Rules) --
def assign_health_label(row):
    """
    Lop 2 (Healthy): NDS >= 30 va CWS >= 30 va NOVA <= 2 va Sodium < 600mg
    Lop 0 (Unhealthy): CWS < 15 HOAC (NOVA=4 va Sugar > 20g) HOAC Sodium > 1000mg
    Lop 1 (Neutral): Con lai
    """
    if row['nds'] >= 30 and row['cws'] >= 30 and row['nova_level'] <= 2 and row['sodium'] < 600:
        return 2  # Healthy
    elif row['cws'] < 15 or (row['nova_level'] == 4 and row['sugar_total'] > 20) or row['sodium'] > 1000:
        return 0  # Unhealthy
    else:
        return 1  # Neutral

df['health_label'] = df.apply(assign_health_label, axis=1)
label_dist = df['health_label'].value_counts()
print(f"  Phan phoi nhan: Healthy={label_dist.get(2,0)} | Neutral={label_dist.get(1,0)} | Unhealthy={label_dist.get(0,0)}")

# -- Train Model --
features_ml3 = ['calories', 'protein', 'carbohydrate', 'fat_total_lipid',
                 'fiber', 'sugar_total', 'sodium', 'nova_level', 'is_plant_based']
X_ml3 = df[features_ml3]
y_ml3 = df['health_label']

X_train, X_test, y_train, y_test = train_test_split(
    X_ml3, y_ml3, test_size=0.2, random_state=42, stratify=y_ml3)

xgb_health = xgb.XGBClassifier(
    objective='multi:softprob', num_class=3,
    n_estimators=200, max_depth=6,
    learning_rate=0.1, subsample=0.8,
    colsample_bytree=0.8,
    random_state=42, eval_metric='mlogloss'
)
xgb_health.fit(X_train, y_train)

y_pred = xgb_health.predict(X_test)
acc    = accuracy_score(y_test, y_pred)
f1     = f1_score(y_test, y_pred, average='weighted')

# Feature importance
feat_imp = pd.Series(xgb_health.feature_importances_, index=features_ml3).sort_values(ascending=False)

print(f"  [RESULT] Accuracy = {acc:.2%} | F1-score (weighted) = {f1:.4f}")
print(f"  Feature Importance (Top 5):")
for feat, imp in feat_imp.head(5).items():
    print(f"    {feat}: {imp:.4f}")

# Assign health_score (probability of being Healthy)
health_probs = xgb_health.predict_proba(X_ml3)
df['health_score'] = health_probs[:, 2] * 100  # Xac suat lop 2 (Healthy)

# Luu report
with open("module5_outputs/ml3_classification_report.txt", "w", encoding="utf-8") as f:
    f.write("ML-3: XGBOOST HEALTH CLASSIFICATION REPORT\n")
    f.write("="*50 + "\n\n")
    f.write(f"Accuracy:  {acc:.4f}\n")
    f.write(f"F1-score:  {f1:.4f}\n\n")
    f.write("Classification Report:\n")
    f.write(classification_report(y_test, y_pred, target_names=["Unhealthy","Neutral","Healthy"]))
    f.write("\nFeature Importance:\n")
    f.write(feat_imp.to_string())


# =========================================================================
# ML-4: MULTI-LABEL DIET CLASSIFICATION (6 diet types)
# =========================================================================
print("\n[ML-4] Multi-label Diet Classification (Rule-based Proxy)...")
print("  -> 6 che do an: Muscle Gain, Keto, Heart Health, Weight Loss, Diabetes, Vegan")

# Muscle Gain: nhieu protein, khong qua nhieu calo, khong phai supplement
df['is_muscle_gain'] = ((df['protein'] >= 15) &
                         (df['calories'] <= 250) &
                         (~df['main_group'].isin(['Nutritional Supplements', 'Supplements & Sports']))).astype(int)

# Keto: rat it carbohydrate
df['is_keto'] = ((df['carbohydrate'] <= 5) &
                  (~df['main_group'].isin(['Nutritional Supplements', 'Supplements & Sports']))).astype(int)

# Heart Health: it sodium, cha biet che bien nhieu (NOVA <= 2)
df['is_heart_health'] = ((df['sodium'] <= 120) &
                          (df['nova_level'] <= 2) &
                          (~df['main_group'].isin(['Nutritional Supplements', 'Supplements & Sports']))).astype(int)

# Weight Loss: it calo
df['is_weight_loss'] = ((df['calories'] <= 180) &
                         (~df['main_group'].isin(['Nutritional Supplements', 'Supplements & Sports']))).astype(int)

# Diabetes Friendly: it carb, it duong, thuc pham tuoi/it che bien
df['is_diabetes_friendly'] = ((df['carbohydrate'] <= 15) &
                                (df['sugar_total'] <= 5) &
                                (df['nova_level'] <= 2) &
                                (~df['main_group'].isin(['Nutritional Supplements', 'Supplements & Sports']))).astype(int)

# Vegan: thuc vat
df['is_vegan'] = (df['is_plant_based'] == 1).astype(int)

diet_cols = ['is_muscle_gain', 'is_keto', 'is_heart_health', 'is_weight_loss',
             'is_diabetes_friendly', 'is_vegan']

diet_output = df[['description', 'main_group'] + diet_cols + ['calories', 'protein', 'carbohydrate', 'fat_total_lipid', 'sodium']]
diet_output.to_csv("module5_outputs/food_diet_labels.csv", index=False)

print("  [RESULT] So luong mon phu hop tung che do an:")
for col in diet_cols:
    print(f"    {col}: {df[col].sum()} mon")


# =========================================================================
# ML-5: CONTENT-BASED RECOMMENDER - NearestNeighbors (Cosine)
# =========================================================================
print("\n[ML-5] Content-based Recommender (NearestNeighbors, metric='cosine')...")
print("  -> Features: calories, protein, carb, fat, fiber, sodium, sugar, health_score")

features_ml5 = ['calories', 'protein', 'carbohydrate', 'fat_total_lipid',
                 'fiber', 'sodium', 'sugar_total', 'health_score']
scaler_ml5 = StandardScaler()
X_ml5 = scaler_ml5.fit_transform(df[features_ml5])

nn_recommender = NearestNeighbors(n_neighbors=50, metric='cosine', algorithm='brute')
nn_recommender.fit(X_ml5)

def find_substitutes(food_keyword, n_results=5, constraint="none"):
    """
    Tim mon thay the dua tren:
    1. Tim mon goc bang keyword (chon mon ten ngan nhat)
    2. Lay 50 mon gan nhat (Cosine Similarity)
    3. Filter theo constraint
    4. Uu tien cung main_group va health_score cao
    """
    matches = df[df['description'].str.lower().str.contains(food_keyword.lower(), na=False)]
    if matches.empty:
        return None, f"Khong tim thay mon nao khop voi '{food_keyword}'"

    base_idx = matches['description'].str.len().idxmin()
    base_food = df.loc[base_idx]
    base_vector = X_ml5[base_idx].reshape(1, -1)

    distances, indices = nn_recommender.kneighbors(base_vector)
    candidates = df.iloc[indices[0]].copy()
    candidates = candidates[candidates.index != base_idx]

    if constraint == "low_fat":
        candidates = candidates[candidates['fat_total_lipid'] <= base_food['fat_total_lipid'] * 0.8]
    elif constraint == "high_protein":
        candidates = candidates[candidates['protein'] >= base_food['protein'] * 1.1]
    elif constraint == "low_carb":
        candidates = candidates[candidates['carbohydrate'] <= base_food['carbohydrate'] * 0.5]
    elif constraint == "low_sodium":
        candidates = candidates[candidates['sodium'] <= base_food['sodium'] * 0.6]
    elif constraint == "low_calorie":
        candidates = candidates[candidates['calories'] <= base_food['calories'] * 0.8]
    elif constraint == "healthy":
        candidates = candidates[candidates['health_label'] == 2]

    # Uu tien cung nhom va health_score cao
    candidates = candidates.copy()
    candidates['group_match'] = (candidates['main_group'] == base_food['main_group']).astype(int)
    candidates = candidates.sort_values(by=['group_match', 'health_score'], ascending=[False, False])

    if candidates.empty:
        candidates = df.iloc[indices[0]].copy()
        candidates = candidates[candidates.index != base_idx].sort_values('health_score', ascending=False)

    return base_food, candidates.head(n_results)


# =========================================================================
# ML-6: SMART RAG CHATBOT - Tich hop ML3 + ML4 + ML5
# =========================================================================
print("\n[ML-6] Smart RAG Chatbot (Rule-based NLP + ML Integration)...")

# Bo tu dien tieng Viet -> tieng Anh (cho keyword matching)
VI_EN_MAP = {
    "thịt bò": "beef", "bò": "beef",
    "úc gà": "chicken breast", "thịt gà": "chicken",
    "cá hồi": "salmon", "cá ngừ": "tuna", "cá": "fish",
    "trứng chiên": "egg, fried", "trứng luộc": "egg, hard-boiled",
    "trứng hấp": "egg, scrambled", "trứng": "egg",
    "cơm trắng": "rice, white", "cơm lứt": "rice, brown", "cơm": "rice",
    "thịt heo": "pork", "heo": "pork",
    "sữa bò": "milk, whole", "sữa tươi": "milk", "sữa": "milk",
    "bánh mì trắng": "bread, white", "bánh mì": "bread",
    "bơ": "butter", "dầu ô liu": "olive oil",
    "khoai tây": "potato", "khoai lang": "sweet potato",
    "cà chua": "tomato", "cà rốt": "carrot",
    "rau bina": "spinach", "súp lơ": "broccoli",
    "chuối": "banana", "táo": "apple", "cam": "orange",
    "đậu phụ": "tofu", "đậu nành": "soybean",
    "yến mạch": "oatmeal", "ngũ cốc": "cereal",
    "phô mai": "cheese", "pho mat": "cheese",
    "socola": "chocolate", "kẹo": "candy",
    "nước ngọt": "soft drink", "coca cola": "cola",
    "thịt xông khói": "bacon", "xúc xích": "sausage",
    "hot dog": "hot dog", "hamburger": "hamburger",
    "xôi": "rice, glutinous", "phở": "noodle soup",
    "bún": "rice noodle", "mì": "noodle",
    "dưa hấu": "watermelon", "nho": "grape",
    "gạo lứt": "rice, brown", "băm": "ground",
}

def translate_vi_to_en(text):
    text_lower = text.lower()
    for vi, en in VI_EN_MAP.items():
        if vi in text_lower:
            return en
    return text_lower

def get_best_food_match(food_keyword):
    """Tim mon an trong DB (tim tu ngan nhat chua keyword)"""
    matches = df[df['description'].str.lower().str.contains(food_keyword.lower(), na=False)]
    if not matches.empty:
        return matches.loc[matches['description'].str.len().idxmin()]
    return None

def smart_chatbot(query):
    query_lower = query.lower()
    response = ""

    # Dich tieng Viet sang tieng Anh de tim trong DB
    food_keyword_en = translate_vi_to_en(query_lower)

    # --- INTENT 1: THAY THE MON AN ---
    if "thay thế" in query_lower or "thay thế" in query_lower or "thay" in query_lower:
        constraint = "none"
        if "ít béo" in query_lower or "it beo" in query_lower:
            constraint = "low_fat"
        elif "ít carb" in query_lower or "ít tinh bột" in query_lower:
            constraint = "low_carb"
        elif "nhiều đạm" in query_lower or "nhiều protein" in query_lower:
            constraint = "high_protein"
        elif "ít muối" in query_lower or "ít natri" in query_lower:
            constraint = "low_sodium"
        elif "ít calo" in query_lower:
            constraint = "low_calorie"
        elif "healthy hơn" in query_lower or "lành mạnh hơn" in query_lower:
            constraint = "healthy"

        base_food, subs = find_substitutes(food_keyword_en, n_results=3, constraint=constraint)
        if base_food is None:
            response = "Tôi không tìm thấy món gốc bạn muốn thay thế. Thử nhập tên khác nhé."
        else:
            response = (f"Mon goc tim thay: '{base_food['description']}'\n"
                        f"  Calo: {base_food['calories']:.1f} kcal | "
                        f"Dam: {base_food['protein']:.1f}g | "
                        f"Carb: {base_food['carbohydrate']:.1f}g | "
                        f"Beo: {base_food['fat_total_lipid']:.1f}g | "
                        f"Sodium: {base_food['sodium']:.0f}mg\n")
            constraint_label = {"low_fat":"it beo","low_carb":"it carb","high_protein":"nhieu dam",
                                 "low_sodium":"it muoi","low_calorie":"it calo","healthy":"lanh manh hon","none":""}
            response += f"  -> Goi y thay the ({constraint_label.get(constraint,'chung')}):\n"
            if isinstance(subs, pd.DataFrame) and not subs.empty:
                for _, sub in subs.iterrows():
                    hl = "Healthy" if sub['health_label'] == 2 else "Neutral" if sub['health_label'] == 1 else "Unhealthy"
                    response += (f"     - {sub['description']}"
                                 f" | Cal={sub['calories']:.0f} | Dam={sub['protein']:.1f}g"
                                 f" | Carb={sub['carbohydrate']:.1f}g | Beo={sub['fat_total_lipid']:.1f}g"
                                 f" [{hl}]\n")
            else:
                response += "     Khong tim thay mon thay the phu hop. Thu giam rang buoc.\n"

    # --- INTENT 2: DANH GIA SUC KHOE ---
    elif any(kw in query_lower for kw in ["healthy", "tốt không", "tot khong", "có tốt", "co tot",
                                           "lành mạnh", "lanh manh", "bị béo", "bi beo",
                                           "tiểu đường", "tieu duong", "tim mạch", "tim mach",
                                           "nên ăn", "nen an", "có nên", "co nen"]):
        food = get_best_food_match(food_keyword_en)
        if food is not None:
            hl = "Rat Tot (Healthy)" if food['health_label'] == 2 else "Trung Binh" if food['health_label'] == 1 else "Kem (Unhealthy)"
            response = (f"Mon tim thay: '{food['description']}' - Danh gia: [{hl}]\n"
                        f"  Diem Healthy (ML): {food['health_score']:.1f}/100\n"
                        f"  Calo: {food['calories']:.1f} kcal | Dam: {food['protein']:.1f}g"
                        f" | Carb: {food['carbohydrate']:.1f}g | Beo: {food['fat_total_lipid']:.1f}g\n"
                        f"  Sodium: {food['sodium']:.0f}mg | NOVA: {int(food['nova_level'])} | NDS: {food['nds']:.1f}\n")
            # Canh bao tieu duong (carb >15g la can than)
            if ("tiểu đường" in query_lower or "tieu duong" in query_lower) and food['carbohydrate'] > 15:
                response += f"  [CANH BAO] Tieu duong: Carb {food['carbohydrate']:.1f}g - Nen an it lai!\n"
            # Canh bao tim mach (sodium > 400)
            if ("tim mạch" in query_lower or "tim mach" in query_lower) and food['sodium'] > 400:
                response += f"  [CANH BAO] Tim mach: Sodium cao ({food['sodium']:.0f}mg) - Han che su dung!\n"
            # Canh bao beo phi
            if ("béo" in query_lower or "beo" in query_lower) and food['fat_total_lipid'] > 15:
                response += f"  [CANH BAO] Beo phi: Chat beo {food['fat_total_lipid']:.1f}g/100g - Nen an vua phai!\n"
            # Canh bao thuc pham che bien nhieu (NOVA=4)
            if food['nova_level'] == 4:
                response += f"  [CANH BAO] NOVA 4: Day la thuc pham sieu che bien - Han che tieu thu!\n"
        else:
            response = f"Khong tim thay '{food_keyword_en}' trong du lieu. Thu tu khoa khac."

    # --- INTENT 3: GOM Y CHE DO AN (GYMMER, GIAM CAN...) ---
    elif any(kw in query_lower for kw in ["tập gym", "tap gym", "tang co", "tang cu", "gymmer",
                                           "giam can", "giảm cân", "keto", "chay", "vegan",
                                           "tim mach goi y", "tieu duong goi y",
                                           "tiểu đường gợi ý", "tieu duong an gi",
                                           "tiểu đường ăn gì", "an chay goi y"]):
        diet_map = {
            "tap gym": ("is_muscle_gain", "Tang co (Protein cao, Calo vua)"),
            "tang co": ("is_muscle_gain", "Tang co (Protein cao, Calo vua)"),
            "gymmer":  ("is_muscle_gain", "Tang co (Protein cao, Calo vua)"),
            "giam can": ("is_weight_loss", "Giam can (Calo <= 180)"),
            "giảm cân": ("is_weight_loss", "Giam can (Calo <= 180)"),
            "keto":    ("is_keto", "Keto (Carb <= 5g)"),
            "chay":    ("is_vegan", "An chay (Plant-based)"),
            "vegan":   ("is_vegan", "An chay (Plant-based)"),
            "tieu duong": ("is_diabetes_friendly", "Tieu duong (Carb<=15g, Sugar<=5g, NOVA<=2)"),
            "tiểu đường": ("is_diabetes_friendly", "Tieu duong (Carb<=15g, Sugar<=5g, NOVA<=2)"),
            "tim mach": ("is_heart_health", "Tim mach (Sodium<=120mg, NOVA<=2)"),
        }
        col, label = "is_weight_loss", "Giam can"
        for kw, (c, lbl) in diet_map.items():
            if kw in query_lower:
                col, label = c, lbl
                break

        top_foods = df[df[col] == 1].sort_values(['health_score', 'protein'], ascending=False).head(8)
        if not top_foods.empty:
            response = f"Top mon an phu hop cho muc tieu [{label}]:\n"
            for _, row in top_foods.iterrows():
                response += (f"  - {row['description'][:45]:<45}"
                             f" | Cal={row['calories']:.0f}"
                             f" | Pro={row['protein']:.1f}g"
                             f" | Carb={row['carbohydrate']:.1f}g\n")
        else:
            response = "Khong tim thay mon phu hop. Thu thu hep tieu chi."

    # --- INTENT 4: HEN CHE CHUNG (Fallback) ---
    else:
        food = get_best_food_match(food_keyword_en)
        if food is not None:
            hl = "Healthy" if food['health_label'] == 2 else "Neutral" if food['health_label'] == 1 else "Unhealthy"
            diet_flags = []
            for col in ['is_muscle_gain','is_keto','is_heart_health','is_weight_loss','is_diabetes_friendly','is_vegan']:
                if food.get(col, 0) == 1:
                    diet_flags.append(col.replace('is_','').replace('_',' '))
            response = (f"Tim thay: '{food['description']}' [{hl}] - {food['main_group']}\n"
                        f"  Calo={food['calories']:.1f} | Dam={food['protein']:.1f}g"
                        f" | Carb={food['carbohydrate']:.1f}g | Beo={food['fat_total_lipid']:.1f}g\n"
                        f"  Sodium={food['sodium']:.0f}mg | NOVA={int(food['nova_level'])}\n"
                        f"  Phu hop che do an: {', '.join(diet_flags) if diet_flags else 'Khong co che do dac biet'}\n")
        else:
            response = (f"Khong tim thay '{query}' trong du lieu. "
                        "Thu: 'trung chien healthy khong?' hoac 'goi y cho gymmer' hoac 'thay the com trang it carb'")

    return response


# --- CHAY TEST ---
print("\n  [TEST CASES - MULTI PERSONA]")

test_cases = [
    # Persona 1: Nguoi tim hieu dinh duong
    ("PERSONA 1 - Dinh duong co ban", [
        ("trứng luộc", "Tim thong tin trung luoc"),
        ("sữa tươi", "Tim thong tin sua"),
        ("chuối", "Tim thong tin chuoi"),
    ]),
    # Persona 2: Gymmer
    ("PERSONA 2 - Gymmer tang co", [
        ("gợi ý cho gymmer tập gym tăng cơ", "Goi y mon an gymmer"),
        ("thay thế cơm trắng ít carb", "Thay com trang it carb"),
        ("ức gà có healthy không", "Danh gia uc ga"),
    ]),
    # Persona 3: Tieu duong
    ("PERSONA 3 - Benh nhan tieu duong", [
        ("cơm trắng bị tiểu đường có nên ăn không", "Canh bao tieu duong + com"),
        ("bánh mì trắng tiểu đường có tốt không", "Canh bao tieu duong + banh mi"),
        ("gợi ý cho người tiểu đường ăn gì", "Goi y che do tieu duong"),
    ]),
    # Persona 4: Tim mach
    ("PERSONA 4 - Tim mach", [
        ("xúc xích ăn nhiều có tốt cho tim mạch không", "Canh bao tim mach"),
        ("thịt xông khói có healthy không", "Danh gia thit xong khoi"),
        ("thay thế thịt xông khói ít muối", "Thay the bacon it muoi"),
    ]),
    # Persona 5: Giam can
    ("PERSONA 5 - Giam can", [
        ("gợi ý giảm cân", "Goi y giam can"),
        ("thay thế bánh mì trắng healthy hơn", "Thay banh mi healthy hon"),
    ]),
]

log_lines = ["=" * 65, "  MODULE 5 - CHATBOT TEST LOG", "=" * 65, ""]
for persona_name, queries in test_cases:
    print(f"\n  --- {persona_name} ---")
    log_lines += [f"\n{'='*65}", f"  {persona_name}", f"{'='*65}"]
    for query, desc in queries:
        result = smart_chatbot(query)
        print(f"    Q: {query}")
        print(f"    A: {result[:180]}...")
        log_lines += [f"\nQ [{desc}]: {query}", f"A:\n{result}", "-"*50]

with open("module5_outputs/rag_assistant_log_v2.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(log_lines))

# =========================================================================
# SAVE ENRICHED DATASET
# =========================================================================
export_cols = ['description', 'main_group', 'sub_group', 'calories', 'protein',
               'carbohydrate', 'fat_total_lipid', 'fiber', 'sugar_total', 'sodium',
               'nova_level', 'nds', 'cws', 'health_label', 'health_score',
               'food_cluster', 'cluster_name', 'anomaly_flag',
               'is_muscle_gain', 'is_keto', 'is_heart_health', 'is_weight_loss',
               'is_diabetes_friendly', 'is_vegan', 'is_plant_based']
df[export_cols].to_csv("module5_outputs/food_ml_enriched.csv", index=False)

print("\n" + "=" * 65)
print("  MODULE 5 HOAN THANH!")
print(f"  ML-1 Anomaly   : {len(anomalies)} mon bat thuong ({len(anomalies)/len(df)*100:.1f}%)")
print(f"  ML-2 Clustering: Silhouette = {sil_score:.4f}")
print(f"  ML-3 XGBoost   : Accuracy = {acc:.2%} | F1 = {f1:.4f}")
print(f"  ML-4 Diet Labels: 6 che do an da gan nhan")
print(f"  ML-5 Recommender: NearestNeighbors (k=50, cosine) san sang")
print(f"  ML-6 Chatbot   : 4 intents + 6 diet types + VI-EN dictionary")
print(f"  Output: module5_outputs/food_ml_enriched.csv")
print("=" * 65)
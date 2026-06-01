r"""
NutriHub API Server v2 - Food Data + AI Chat
Port: 8000
Chay tu: D:\V0
  py -X utf8 source/api_server.py
"""
import sys
import os
import json
import asyncio
import re
import random
import math

# Fix working directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, 'source'))

import pandas as pd
import numpy as np
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional

# =========================================================================
# LOAD DATA
# =========================================================================
print("=" * 60)
print("  NutriHub API Server v2 - Khoi dong...")
print("=" * 60)

# Doc file ML enriched truoc, fallback ve cleaned
DATA_PATH = "module5_outputs/food_ml_enriched.csv"
if not os.path.exists(DATA_PATH):
    DATA_PATH = "phase0/food_cleaned.csv"
if not os.path.exists(DATA_PATH):
    DATA_PATH = "food_cleaned.csv"

print(f"Dang doc du lieu tu: {DATA_PATH}")
raw_df = pd.read_csv(DATA_PATH)
num_cols = raw_df.select_dtypes(include=[np.number]).columns
raw_df[num_cols] = raw_df[num_cols].fillna(0)
raw_df = raw_df.fillna("")
print(f"✅ Doc {len(raw_df)} records tu CSV")

# Tao slug tu description
def make_slug(text: str, idx: int) -> str:
    s = str(text).lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s.strip())
    s = re.sub(r'-+', '-', s)[:80]
    return f"{s}-{idx}" if s else f"food-{idx}"

# Deduplicate: lay phan ten truoc dau phay de gop cac mon tuong tu (vd: "Cheese, cheddar" -> "Cheese")
raw_df['short_desc'] = raw_df['description'].apply(lambda x: str(x).split(',')[0].strip())
# Generate price and stock for ALL rows (variants)
raw_df['id'] = raw_df.index + 1
raw_df['price'] = raw_df.apply(
    lambda r: round(2.0 + float(r.get('protein', 0) or 0) * 0.15 + float(r.get('calories', 0) or 0) * 0.005, 2),
    axis=1
)
raw_df['stock'] = raw_df['id'].apply(lambda i: random.randint(5, 200))
raw_df['slug'] = [make_slug(row['description'], row['id']) for _, row in raw_df.iterrows()]

# Create parent products (df_unique)
df_unique = raw_df.drop_duplicates(subset=['sub_group'], keep='first').copy()
df_unique['description'] = df_unique['sub_group']
df_unique = df_unique.reset_index(drop=True)
df_unique['slug'] = [make_slug(row['description'], row['id']) for _, row in df_unique.iterrows()]
df_unique['is_featured'] = df_unique.get('health_score', pd.Series(0, index=df_unique.index)).apply(lambda x: 1 if float(x or 0) >= 60 else 0)

# Calculate variant stats
variant_stats = raw_df.groupby('sub_group').agg(
    _variantCount=('description', 'count'),
    _minPrice=('price', 'min')
).reset_index()
df_unique = df_unique.merge(variant_stats, on='sub_group', how='left')

print(f"✅ {len(df_unique)} san pham unique sau khi deduplicate")

# Load ML module cho chatbot
print("Dang load ML models cho Chatbot (co the mat 10-20 giay)...")
try:
    import module6_deep_rag as m6
    print("✅ Module 6 (Deep Learning Vector Search) da san sang!")
    CHATBOT_READY = True
except Exception as e:
    print(f"⚠️  Chatbot khong load duoc: {e}")
    CHATBOT_READY = False

# Thu ket noi LM Studio
try:
    from openai import OpenAI as _OAI
    _lm_client_test = _OAI(base_url="http://localhost:1234/v1", api_key="lm-studio", timeout=3.0)
    _models = _lm_client_test.models.list()
    LM_MODEL_NAME = _models.data[0].id if _models.data else None
    LM_AVAILABLE = LM_MODEL_NAME is not None
    print(f"✅ LM Studio: {LM_MODEL_NAME}" if LM_AVAILABLE else "⚠️  LM Studio: offline")
except Exception:
    LM_AVAILABLE = False
    LM_MODEL_NAME = None
    print("⚠️  LM Studio: offline - se dung Fallback RAG")

# =========================================================================
# HELPER: Convert row -> Food dict (khop voi types.ts)
# =========================================================================
def get_col(row, *names, default=None):
    for n in names:
        if n in row.index and row[n] != "" and not (isinstance(row[n], float) and math.isnan(row[n])):
            v = row[n]
            return float(v) if isinstance(v, (int, float, np.integer, np.floating)) else v
    return default

def get_image_for_desc(desc):
    desc = str(desc or '').lower()
    if not desc: return None
    if desc == "plant milk" or "soy" in desc or "almond" in desc: return "/images/plant_milk.png"
    if desc == "milk": return "/images/milk.png"
    if desc == "yogurt": return "/images/yogurt_bowl.png"
    if "goat" in desc and "milk" in desc: return "/images/goat_milk.png"
    if "buttermilk" in desc: return "/images/buttermilk.png"
    if "kefir" in desc: return "/images/kefir.png"
    if "frozen yogurt" in desc: return "/images/frozen_yogurt.png"
    if "chocolate milk" in desc or "hot chocolate" in desc or "cocoa" in desc and "baking" not in desc: return "/images/chocolate_milk.png"
    if "beans" in desc and ("meat" in desc or "rice" in desc): return "/images/beans_meat.png"
    if "oats" in desc or "bran" in desc: return "/images/oats_grains.png"
    if "juice" in desc or "water" in desc or "beverage" in desc: return None
    if "dip" in desc: return "/images/creamy_dip.png"
    if "spreads" in desc or "bread" in desc or "roll" in desc: return "/images/spreads.png"
    if "chocolate" in desc and "milk" not in desc or "cocoa & baking" in desc or "candy" in desc: return "/images/chocolate.png"
    if "grape" in desc or "melon" in desc or "fruit" in desc or "berr" in desc or "tropical" in desc: return "/images/grape_melon.png"
    if "cake" in desc or "pastry" in desc: return "/images/cakes_pastry.png"
    if "other grains" in desc: return "/images/other_grains.png"
    if "baby" in desc or "infant" in desc: return "/images/baby_food.png"
    if "cream" in desc and "ice" not in desc: return "/images/milk.png"
    if "ice cream" in desc: return "/images/frozen_yogurt.png"
    if "vegetable" in desc or "allium" in desc or "leafy" in desc: return "/images/creamy_dip.png"
    if "smoothie" in desc or "shake" in desc or "coffee" in desc: return "/images/chocolate_milk.png"
    if "protein" in desc or "supplement" in desc: return "/images/plant_milk.png"
    if "other" in desc: return "/images/oats_grains.png"
    return None

def row_to_food(row) -> dict:
    hs = float(get_col(row, 'health_score') or 0)
    featured = bool(get_col(row, 'is_featured') or (hs >= 60))
    return {
        "id": int(row['id']),
        "slug": str(row['slug']),
        "description": str(get_col(row, 'description') or ''),
        "category": str(get_col(row, 'main_group') or get_col(row, 'sub_group') or ''),
        "nutrientDataBankNumber": str(get_col(row, 'nutrient_data_bank_number', 'ndb_no') or int(row['id'])),
        "price": float(row.get('price', 0) or 0),
        "stock": int(row.get('stock', 50) or 50),
        "imageUrl": get_image_for_desc(get_col(row, 'description')),
        "_variantCount": int(row.get('_variantCount', 1) if pd.notna(row.get('_variantCount')) else 1),
        "_minPrice": float(row.get('_minPrice', row.get('price', 0)) if pd.notna(row.get('_minPrice')) else 0),
        "isActive": True,
        "isFeatured": featured,
        # Macros
        "protein": float(get_col(row, 'protein') or 0),
        "carbohydrate": float(get_col(row, 'carbohydrate') or 0),
        "totalLipid": float(get_col(row, 'fat_total_lipid', 'total_fat') or 0),
        "fiber": float(get_col(row, 'fiber') or 0),
        "sugarTotal": float(get_col(row, 'sugar_total') or 0),
        "cholesterol": float(get_col(row, 'cholesterol') or 0),
        "water": float(get_col(row, 'water') or 0),
        "choline": float(get_col(row, 'choline') or 0),
        # Fats
        "monoFat": float(get_col(row, 'fatty_acid_total_monounsaturated', 'mono_fat') or 0),
        "polyFat": float(get_col(row, 'fatty_acid_total_polyunsaturated', 'poly_fat') or 0),
        "saturatedFat": float(get_col(row, 'fatty_acid_total_saturated', 'saturated_fat') or 0),
        # Vitamins
        "vitaminARae": float(get_col(row, 'vitamin_a_rae', 'vitamin_a') or 0),
        "vitaminB12": float(get_col(row, 'vitamin_b12') or 0),
        "vitaminB6": float(get_col(row, 'vitamin_b6') or 0),
        "vitaminC": float(get_col(row, 'vitamin_c') or 0),
        "vitaminE": float(get_col(row, 'vitamin_e', 'vitamin_e_alpha_tocopherol') or 0),
        "vitaminK": float(get_col(row, 'vitamin_k', 'vitamin_k_phylloquinone') or 0),
        "niacin": float(get_col(row, 'niacin') or 0),
        "riboflavin": float(get_col(row, 'riboflavin') or 0),
        "thiamin": float(get_col(row, 'thiamin') or 0),
        "selenium": float(get_col(row, 'selenium') or 0),
        # Minerals
        "calcium": float(get_col(row, 'calcium') or 0),
        "copper": float(get_col(row, 'copper') or 0),
        "iron": float(get_col(row, 'iron') or 0),
        "magnesium": float(get_col(row, 'magnesium') or 0),
        "phosphorus": float(get_col(row, 'phosphorus') or 0),
        "potassium": float(get_col(row, 'potassium') or 0),
        "sodium": float(get_col(row, 'sodium') or 0),
        "zinc": float(get_col(row, 'zinc') or 0),
        # Carotenoids
        "alphaCarotene": float(get_col(row, 'alpha_carotene') or 0),
        "betaCarotene": float(get_col(row, 'beta_carotene') or 0),
        "betaCryptoxanthin": float(get_col(row, 'beta_cryptoxanthin') or 0),
        "luteinZeaxanthin": float(get_col(row, 'lutein_zeaxanthin') or 0),
        "lycopene": float(get_col(row, 'lycopene') or 0),
        "retinol": float(get_col(row, 'retinol') or 0),
        # Extra ML fields
        "healthScore": hs,
        "healthLabel": int(get_col(row, 'health_label') or 1),
        "novaLevel": int(get_col(row, 'nova_level') or 1),
    }

# =========================================================================
# FASTAPI APP
# =========================================================================
app = FastAPI(title="NutriHub API v2", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================================
# FOOD ENDPOINTS
# =========================================================================

@app.get("/api/foods/featured")
def get_featured():
    """Lay top san pham noi bat (health_score cao nhat)"""
    if 'health_score' in df_unique.columns:
        top = df_unique.nlargest(12, 'health_score')
    else:
        top = df_unique.head(12)
    return {"success": True, "data": [row_to_food(r) for _, r in top.iterrows()]}


@app.get("/api/foods/categories")
def get_categories():
    """Lay danh sach danh muc va so luong"""
    cats = df_unique['main_group'].value_counts().reset_index()
    cats.columns = ['name', 'count']
    result = [{"name": str(r['name']), "count": int(r['count'])} for _, r in cats.iterrows() if r['name']]
    return {"success": True, "data": result}


@app.get("/api/foods/search")
def search_foods(description: str = ""):
    """Tim kiem theo ten"""
    mask = df_unique['description'].str.contains(description, case=False, na=False)
    results = df_unique[mask].head(20)
    return {"success": True, "data": [row_to_food(r) for _, r in results.iterrows()]}


@app.get("/api/foods/slug/{slug}")
def get_by_slug(slug: str):
    """Lay chi tiet san pham theo slug"""
    match = df_unique[df_unique['slug'] == slug]
    if match.empty:
        return JSONResponse({"success": False, "error": "Khong tim thay san pham"}, status_code=404)
    
    parent_food = row_to_food(match.iloc[0])
    sub_group = match.iloc[0]['sub_group']
    
    # Lay tat ca cac bien the tu raw_df
    variants_df = raw_df[raw_df['sub_group'] == sub_group]
    parent_food['variants'] = [row_to_food(r) for _, r in variants_df.iterrows()]
    
    return {"success": True, "data": parent_food}


@app.get("/api/foods/{slug}/related")
def get_related(slug: str):
    """Lay san pham lien quan (cung danh muc)"""
    match = df_unique[df_unique['slug'] == slug]
    if match.empty:
        return {"success": True, "data": []}
    food = match.iloc[0]
    same_cat = df_unique[
        (df_unique['main_group'] == food['main_group']) &
        (df_unique['slug'] != slug)
    ].head(8)
    return {"success": True, "data": [row_to_food(r) for _, r in same_cat.iterrows()]}


@app.get("/api/foods")
def get_foods(
    page: int = 1,
    limit: int = 24,
    search: str = "",
    category: str = "",
    sortBy: str = "id",
    order: str = "asc",
    minProtein: Optional[float] = None,
    maxProtein: Optional[float] = None,
    featured: Optional[bool] = None,
):
    """Lay danh sach san pham co phan trang, loc, sap xep"""
    df = df_unique.copy()

    # Search
    if search:
        df = df[df['description'].str.contains(search, case=False, na=False)]

    # Category filter
    if category:
        df = df[df['main_group'].str.contains(category, case=False, na=False)]

    # Featured filter
    if featured:
        df = df[df['is_featured'] == 1]

    # Protein filter
    if minProtein is not None:
        df = df[df['protein'] >= minProtein]
    if maxProtein is not None:
        df = df[df['protein'] <= maxProtein]

    # Sort
    sort_col_map = {
        'id': 'id',
        'description': 'description',
        'protein': 'protein',
        'price': 'price',
        'calories': 'calories',
    }
    sort_col = sort_col_map.get(sortBy, 'id')
    if sort_col in df.columns:
        df = df.sort_values(sort_col, ascending=(order == 'asc'))

    # Pagination
    total = len(df)
    total_pages = math.ceil(total / limit) if limit > 0 else 1
    start = (page - 1) * limit
    end = start + limit
    page_df = df.iloc[start:end]

    return {
        "success": True,
        "data": [row_to_food(r) for _, r in page_df.iterrows()],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": total_pages,
            "hasNext": page < total_pages,
            "hasPrev": page > 1,
        }
    }


# =========================================================================
# CHAT ENDPOINT (AI Chatbot)
# =========================================================================
SYSTEM_PROMPT = """Bạn là NutriBot - Chuyên gia Dinh dưỡng AI của NutriHub. Bạn tư vấn chuyên nghiệp, tự nhiên và thân thiện bằng tiếng Việt.

QUY TẮC QUAN TRỌNG:
1. Trả lời bằng tiếng Việt, ngắn gọn (tối đa 150 từ).
2. Tóm tắt nhanh: Calo, Đạm, Carb, Béo của các thực phẩm nếu được hỏi.
3. KHÔNG BAO GIỜ sử dụng các cụm từ lộ hệ thống như: "Dựa trên dữ liệu", "Trong dữ liệu cung cấp", "Theo thông tin tìm thấy". Hãy trả lời tự nhiên như thể những kiến thức này là của riêng bạn.
4. CHỈ dùng số liệu từ phần DỮ LIỆU THỰC PHẨM bên dưới, tuyệt đối không bịa số liệu.
5. Đưa ra lời khuyên ngắn (1-2 câu) phù hợp với bệnh lý/mục tiêu người dùng.
6. Không dùng markdown phức tạp, chỉ dùng ký tự thường và emoji."""



class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    query: str
    history: Optional[List[Message]] = []


def build_food_context(matches: list) -> str:
    if not matches:
        return "(Không tìm thấy thực phẩm nào liên quan trong cơ sở dữ liệu)"
    context = "DỮ LIỆU THỰC PHẨM TÌM ĐƯỢC:\n"
    for i, food in enumerate(matches):
        hl_map = {2: "Healthy ✅", 1: "Trung bình ⚠️", 0: "Không tốt ❌"}
        hl = hl_map.get(int(food.get('health_label', 1)), "N/A")
        context += (
            f"{i+1}. {food['description']} ({food.get('main_group', '')})\n"
            f"   Calo: {food.get('calories', 0):.0f} kcal | "
            f"Đạm: {food.get('protein', 0):.1f}g | "
            f"Carb: {food.get('carbohydrate', 0):.1f}g | "
            f"Béo: {food.get('fat_total_lipid', 0):.1f}g\n"
            f"   Sodium: {food.get('sodium', 0):.0f}mg | Đánh giá: {hl}\n\n"
        )
    return context


def get_lm_client_live():
    try:
        from openai import OpenAI
        # Client 1: To ping (short timeout)
        ping_client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio", timeout=3.0)
        models = ping_client.models.list()
        if models.data:
            # Client 2: To generate (no strict timeout, or default timeout)
            gen_client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")
            return gen_client, models.data[0].id
    except Exception as e:
        print(f"Ping LM Studio failed: {e}")
    return None, None


@app.get("/health")
def health_check():
    lm_client, lm_model = get_lm_client_live()
    return {
        "status": "ok",
        "lm_studio_online": lm_client is not None,
        "lm_model": lm_model,
        "chatbot_ready": CHATBOT_READY,
        "total_foods": len(df_unique),
        "total_raw": len(raw_df),
    }


@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    query = req.query.strip()
    if not query:
        return JSONResponse({"error": "Query rong"}, status_code=400)

    # Vector Search
    matches = m6.semantic_search(query, top_k=5) if CHATBOT_READY else []
    food_context = build_food_context(matches)

    lm_client, lm_model = get_lm_client_live()

    if lm_client:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in (req.history or [])[-6:]:
            messages.append({"role": h.role, "content": h.content})
        messages.append({"role": "user", "content": f"{food_context}\n\nCÂU HỎI: {query}"})

        async def lm_stream():
            try:
                yield f"data: {json.dumps({'mode': 'lm', 'text': ''})}\n\n"
                stream = lm_client.chat.completions.create(
                    model=lm_model, messages=messages,
                    temperature=0.7, max_tokens=512, stream=True
                )
                for chunk in stream:
                    delta = chunk.choices[0].delta
                    if delta.content:
                        yield f"data: {json.dumps({'text': delta.content}, ensure_ascii=False)}\n\n"
                        await asyncio.sleep(0)
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                print(f"LM Stream Error: {e}")
                if CHATBOT_READY:
                    resp = m6.deep_smart_chatbot(query)
                    clean = resp.split("🤖 Chatbot: ")[-1].strip()
                    yield f"data: {json.dumps({'mode': 'fallback', 'text': clean, 'done': True}, ensure_ascii=False)}\n\n"

        return StreamingResponse(lm_stream(), media_type="text/event-stream",
                                  headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
    else:
        async def fallback_stream():
            yield f"data: {json.dumps({'mode': 'fallback', 'text': ''})}\n\n"
            if CHATBOT_READY:
                response = m6.deep_smart_chatbot(query)
                clean = response.split("🤖 Chatbot: ")[-1].strip()
            else:
                clean = "Xin lỗi, chatbot chưa sẵn sàng. Vui lòng khởi động lại server."
            for word in clean.split(" "):
                yield f"data: {json.dumps({'text': word + ' '}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0.025)
            yield f"data: {json.dumps({'done': True})}\n\n"

        return StreamingResponse(fallback_stream(), media_type="text/event-stream",
                                  headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# =========================================================================
# RUN
# =========================================================================
if __name__ == "__main__":
    import uvicorn
    print(f"\n{'='*55}")
    print(f"  🚀 NutriHub API Server chay tai: http://localhost:8000")
    print(f"  📋 API Docs: http://localhost:8000/docs")
    print(f"  ❤️   Health: http://localhost:8000/health")
    print(f"  🍽️   Foods:  http://localhost:8000/api/foods")
    print(f"  🤖  Chat:   POST http://localhost:8000/chat")
    print(f"{'='*55}\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

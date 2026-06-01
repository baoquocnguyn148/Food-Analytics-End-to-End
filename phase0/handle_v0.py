# ============================================================
# FOOD DATA PIPELINE — PHASE 0 (FINAL VERSION)
# Target: Coverage ≥ 90%, all plan features, validated output
# ============================================================

import pandas as pd
import numpy as np
import re
from pathlib import Path

print("=" * 65)
print("  FOOD DATA PIPELINE — PHASE 0 (FINAL VERSION)")
print("  Target: coverage ≥ 90% | all plan features")
print("=" * 65)

INPUT_FILE  = "food.csv"
OUTPUT_DIR  = Path("phase0")
OUTPUT_DIR.mkdir(exist_ok=True)

OUTPUT_FILE         = OUTPUT_DIR / "food_cleaned.csv"
OUTPUT_FILE_PRETTY  = OUTPUT_DIR / "food_cleaned_pretty.csv"
MANUAL_REVIEW_FILE  = OUTPUT_DIR / "manual_review.csv"
QC_REPORT_FILE      = OUTPUT_DIR / "qc_report.txt"

# ============================================================
# 1. LOAD
# ============================================================

print("\n[1] Loading data...")
df = pd.read_csv(INPUT_FILE)
print(f"    Shape: {df.shape}")

# ============================================================
# 2. CLEAN COLUMN NAMES
# ============================================================

print("[2] Cleaning column names...")

def clean_column(col):
    col = str(col).lower().strip()
    col = re.sub(r"\(.*?\)", "", col)
    col = col.replace("%", "_pct").replace("/", "_per_").replace(".", "_")
    col = re.sub(r"[^a-z0-9]+", "_", col)
    col = re.sub(r"_+", "_", col)
    return col.strip("_")

df.columns = [clean_column(c) for c in df.columns]

# ============================================================
# 3. COLUMN MAPPING — match actual food.csv column names
# ============================================================

print("[3] Mapping nutrition columns...")

COLUMN_MAP = {
    "data_protein":                  "protein_g",
    "data_carbohydrate":             "carbohydrate_g",
    "data_fat_total_lipid":          "total_fat_g",
    "data_fiber":                    "fiber_g",
    "data_sugar_total":              "sugars_g",
    "data_major_minerals_sodium":    "sodium_mg",
    "data_major_minerals_potassium": "potassium_mg",
    "data_major_minerals_calcium":   "calcium_mg",
    "data_major_minerals_iron":      "iron_mg",
    "data_major_minerals_magnesium": "magnesium_mg",
    "data_major_minerals_zinc":      "zinc_mg",
    "data_major_minerals_phosphorus":"phosphorus_mg",
    "data_major_minerals_copper":    "copper_mg",
    "data_vitamins_vitamin_c":       "vitamin_c_mg",
    "data_vitamins_vitamin_k":       "vitamin_k_mcg",
    "data_vitamins_vitamin_a_rae":   "vitamin_a_mcg",
    "data_vitamins_vitamin_b12":     "vitamin_b12_mcg",
    "data_vitamins_vitamin_b6":      "vitamin_b6_mg",
    "data_vitamins_vitamin_e":       "vitamin_e_mg",
    "data_fat_saturated_fat":        "saturated_fat_g",
    "data_fat_monosaturated_fat":    "mono_fat_g",
    "data_fat_polysaturated_fat":    "poly_fat_g",
    "data_cholesterol":              "cholesterol_mg",
    "data_choline":                  "choline_mg",
    "data_alpha_carotene":           "alpha_carotene_mcg",
    "data_beta_carotene":            "beta_carotene_mcg",
    "data_lycopene":                 "lycopene_mcg",
    "data_lutein_and_zeaxanthin":    "lutein_zeaxanthin_mcg",
    "data_beta_cryptoxanthin":       "beta_cryptoxanthin_mcg",
    "data_retinol":                  "retinol_mcg",
    "data_niacin":                   "niacin_mg",
    "data_thiamin":                  "thiamin_mg",
    "data_riboflavin":               "riboflavin_mg",
    "data_selenium":                 "selenium_mcg",
    "data_water":                    "water_g",
}

df.rename(columns={k: v for k, v in COLUMN_MAP.items() if k in df.columns}, inplace=True)

# Verify critical columns exist
CRITICAL = ["protein_g", "carbohydrate_g", "total_fat_g", "fiber_g",
            "sugars_g", "sodium_mg", "calcium_mg", "iron_mg",
            "vitamin_c_mg", "saturated_fat_g"]
missing_critical = [c for c in CRITICAL if c not in df.columns]
if missing_critical:
    print(f"    ⚠ Missing critical columns: {missing_critical}")
else:
    print("    ✓ All critical nutrition columns found")

# ============================================================
# 4. DESC_LOWER + MISSING VALUES
# ============================================================

print("[4] desc_lower + fill nulls...")
df["desc_lower"] = df["description"].astype(str).str.lower().str.strip()
numeric_cols = df.select_dtypes(include=np.number).columns
df[numeric_cols] = df[numeric_cols].fillna(0)

# Helper
def scol(col):
    if col in df.columns:
        return pd.to_numeric(df[col], errors="coerce").fillna(0)
    return pd.Series(np.zeros(len(df)))

# ============================================================
# 5. CALORIES & MACRO RATIOS
# ============================================================

print("[5] Calories & macro ratios...")

protein = scol("protein_g")
carbs   = scol("carbohydrate_g")
fat     = scol("total_fat_g")
fiber   = scol("fiber_g")
sugar   = scol("sugars_g")
sodium  = scol("sodium_mg")
potassium = scol("potassium_mg")
calcium   = scol("calcium_mg")
iron      = scol("iron_mg")
magnesium = scol("magnesium_mg")
vitamin_c = scol("vitamin_c_mg")
vitamin_k = scol("vitamin_k_mcg")
sat_fat   = scol("saturated_fat_g")
mono_fat  = scol("mono_fat_g")
poly_fat  = scol("poly_fat_g")
zinc      = scol("zinc_mg")

df["calories_calc"] = (protein * 4 + carbs * 4 + fat * 9).round(2)
cal_safe = df["calories_calc"].replace(0, np.nan)

# Macro % of calories
df["protein_pct_cal"] = (protein * 4 / cal_safe * 100).round(1)
df["carb_pct_cal"]    = (carbs   * 4 / cal_safe * 100).round(1)
df["fat_pct_cal"]     = (fat     * 9 / cal_safe * 100).round(1)

# Per-calorie efficiency metrics (critical for recommendation engine)
df["protein_per_100kcal"] = (protein / cal_safe * 100).round(2)
df["fiber_per_100kcal"]   = (fiber   / cal_safe * 100).round(2)
df["calcium_per_100kcal"] = (calcium / cal_safe * 100).round(2)
df["iron_per_100kcal"]    = (iron    / cal_safe * 100).round(3)

# ============================================================
# 6. NUTRIENT DENSITY SCORE (NDS)
#    Based on z-score approach from plan v3
#    Good nutrients: protein, fiber, vit_c, vit_k, calcium,
#                    iron, potassium, magnesium
#    Limit nutrients: sodium, sugar, saturated_fat
# ============================================================

print("[6] Nutrient Density Score (NDS)...")

good_cols  = ["protein_g", "fiber_g", "vitamin_c_mg", "vitamin_k_mcg",
              "calcium_mg", "iron_mg", "potassium_mg", "magnesium_mg"]
limit_cols = ["sodium_mg", "sugars_g", "saturated_fat_g"]

def zscore_series(s):
    std = s.std()
    if std == 0:
        return pd.Series(np.zeros(len(s)))
    return (s - s.mean()) / std

good_z  = sum(zscore_series(scol(c)) for c in good_cols)
limit_z = sum(zscore_series(scol(c)) for c in limit_cols)
raw_nds = good_z - limit_z

nds_min, nds_max = raw_nds.min(), raw_nds.max()
df["nutrient_density_score"] = ((raw_nds - nds_min) / (nds_max - nds_min + 1e-9) * 100).round(1)

# NDS per calorie variant (penalises high-cal low-nutrient foods)
# Only for foods with >50 kcal to avoid zero-cal artifacts
df["nds_per_100kcal"] = np.where(
    df["calories_calc"] >= 50,
    (df["nutrient_density_score"] / df["calories_calc"] * 100).round(2),
    np.nan
)

# ============================================================
# 7. COMPOSITE WELLNESS SCORE (CWS)
#    Replaces binary Healthy/Unhealthy
#    Weights based on WHO dietary guidelines
# ============================================================

print("[7] Composite Wellness Score (CWS)...")

# Component 1: NDS (40%)
c1 = df["nutrient_density_score"] * 0.4

# Component 2: Protein efficiency (20%)
c2 = df["protein_per_100kcal"].clip(0, 30) / 30 * 100 * 0.2

# Component 3: Low sodium (20%) — WHO: <2300mg/day; per 100g benchmark <400mg
c3 = (1 - (sodium.clip(0, 2300) / 2300)) * 100 * 0.2

# Component 4: Fiber (20%) — target 25g/day; per 100g benchmark
c4 = (fiber.clip(0, 10) / 10 * 100) * 0.2

df["cws"] = (c1 + c2 + c3 + c4).round(1)
df["cws"] = df["cws"].clip(0, 100)

# ============================================================
# 8. BOOLEAN FLAGS
# ============================================================

print("[8] Boolean flags...")

# Fortified — actual dataset has 23 records; broad pattern + cereals
df["is_fortified"] = df["desc_lower"].str.contains(
    r"fortif|enrich|with added|calcium added|added calcium|added vitamin|added iron|"
    r"vitamin.*added|mineral.*fortif|cereal.*ready.?to.?eat",
    regex=True, na=False
).astype(int)

# Plant-based — keyword approach (Will be refined after main_group is assigned)
df["is_plant_based"] = df["desc_lower"].str.contains(
    r"soy|almond|oat|tofu|tempeh|vegan|plant.?based|coconut milk|rice milk|"
    r"oat milk|almond milk|pea protein|lentil|edamame",
    regex=True, na=False
).astype(int)

# Infant / Baby food
df["is_infant"] = df["desc_lower"].str.contains(
    r"\binfant\b|\bbaby\b|\bformula\b|\btoddler\b|baby food|strained.*junior",
    regex=True, na=False
)

# Raw — minimally processed proxy
df["is_raw"] = df["desc_lower"].str.contains(
    r"\braw\b|\bfresh\b|unprepared",
    regex=True, na=False
)

# ============================================================
# 9. PROCESSING LEVEL (NOVA classification)
#    4 = Ultra-processed, 3 = Processed, 2 = Min processed, 1 = Unprocessed
#    Rule: more specific keywords checked first
# ============================================================

print("[9] NOVA Processing Level...")

NOVA_4 = [
    "energy drink", "soft drink", "soda", "cola",
    "protein shake", "protein bar", "meal replacement",
    "instant noodle", "frozen dinner", "chips", "crisps",
    "candy", "gummy", "hot dog", "nugget", "spam",
    "ultra processed", "fast food", "burger",
]
NOVA_3 = [
    "smoked salmon", "smoked fish", "smoked meat",
    "bread", "cheese", "sausage", "ham", "bacon",
    "canned", "processed meat", "deli", "pastrami",
    "salami", "bratwurst", "chorizo",
    "fried", "baked", "roasted", "grilled", "cooked",
    "sauce", "soup", "stew",
]
NOVA_2 = [
    "oil", "flour", "starch", "sugar", "salt",
    "dried", "frozen fruit", "frozen vegetable",
]
# Note: NOVA_2 check BEFORE NOVA_3 for overlapping words like "butter"

def classify_nova(desc):
    d = str(desc).lower()
    if any(k in d for k in NOVA_4):
        return 4
    if any(k in d for k in NOVA_2):  # check 2 before 3 to catch "butter", "oil"
        return 2
    if any(k in d for k in NOVA_3):
        return 3
    return 1

df["nova_level"] = df["desc_lower"].apply(classify_nova)

NOVA_LABELS = {1: "Unprocessed", 2: "Minimally processed",
               3: "Processed", 4: "Ultra-processed"}
df["processing_level"] = df["nova_level"].map(NOVA_LABELS)

# ============================================================
# 10. CUSTOM CATEGORY HIERARCHY
#     Strategy: regex on description, specific patterns first
#     Target: ≥ 90% coverage
# ============================================================

print("[10] Building Custom Category Hierarchy...")

# Each entry: (Sub_Group, Main_Group, [regex_patterns])
# ORDER MATTERS — more specific patterns should come first

HIERARCHY = [

    # ─── SUPPLEMENTS (check first — high protein causes false positives) ───
    ("Protein Supplements", "Supplements & Sports",
     [r"whey", r"protein powder", r"mass gainer", r"pre.?workout",
      r"nutritional powder", r"protein.*mix\b"]),
    ("Sports Nutrition", "Supplements & Sports",
     [r"sports drink", r"gatorade", r"powerade", r"energy drink",
      r"red bull", r"monster energy"]),

    # ─── INFANT ───
    ("Infant Formula", "Infant Nutrition",
     [r"\binfant formula\b", r"\bbaby formula\b", r"infant.*cereal",
      r"toddler.*formula"]),
    ("Baby Food", "Infant Nutrition",
     [r"\bbaby food\b", r"strained.*junior", r"junior.*food",
      r"beech.?nut", r"gerber"]),

    # ─── PLANT-BASED ALTERNATIVES (before Dairy to avoid milk conflict) ───
    ("Plant Milk",      "Plant-based Alternatives",
     [r"soy milk", r"almond milk", r"oat milk", r"rice milk",
      r"coconut milk", r"cashew milk", r"pea milk"]),
    ("Tofu & Tempeh",   "Plant-based Alternatives",
     [r"\btofu\b", r"\btempeh\b"]),
    ("Meat Alternative","Plant-based Alternatives",
     [r"veggie burger", r"plant.?based.*burger", r"meatless",
      r"impossible.*burger", r"beyond.*meat", r"plant.*patty"]),
    ("Soy Products",    "Plant-based Alternatives",
     [r"soy protein", r"textured vegetable protein", r"\btvp\b",
      r"edamame", r"\bmiso\b"]),

    # ─── DAIRY & EGGS ───
    ("Greek Yogurt", "Dairy & Eggs",
     [r"greek yogurt", r"strained yogurt"]),
    ("Yogurt",       "Dairy & Eggs",
     [r"\byogurt\b", r"tzatziki", r"lassi", r"kefir"]),
    ("Cheese",       "Dairy & Eggs",
     [r"\bcheese\b", r"\bcheddar\b", r"mozzarella", r"parmesan",
      r"brie\b", r"gouda", r"feta", r"ricotta", r"queso",
      r"camembert", r"gruyere", r"provolone", r"colby"]),
    ("Ice Cream",    "Dairy & Eggs",
     [r"ice cream", r"frozen yogurt", r"gelato", r"\bsorbet\b",
      r"fudgesicle", r"sherbet", r"creamsicle"]),
    ("Cream",        "Dairy & Eggs",
     [r"sour cream", r"heavy cream", r"light cream", r"half and half",
      r"whipped cream", r"whipped topping", r"creme fraiche",
      r"\bcustard\b", r"\bflan\b", r"creme brulee"]),
    ("Butter",       "Dairy & Eggs",
     [r"\bbutter\b(?!.*peanut|.*almond|.*nut)"]),
    ("Milk",         "Dairy & Eggs",
     [r"\bmilk\b(?!.*soy|.*almond|.*oat|.*rice|.*coconut|.*cashew)",
      r"buttermilk", r"evaporated milk", r"condensed milk",
      r"eggnog", r"horchata"]),
    ("Eggs",         "Dairy & Eggs",
     [r"\begg\b", r"\beggs\b", r"egg white", r"egg yolk",
      r"egg substitute"]),

    # ─── SEAFOOD ───
    ("Shellfish", "Seafood",
     [r"\bshrimp\b", r"\bcrab\b", r"\blobster\b", r"\bclam\b",
      r"\boyster\b", r"\bscallop\b", r"\bmussel\b", r"\bsquid\b",
      r"\boctopus\b", r"\bcrayfish\b"]),
    ("Fish",      "Seafood",
     [r"\bsalmon\b", r"\btuna\b", r"\bcod\b", r"\btilapia\b",
      r"\bhaddock\b", r"\bhalibut\b", r"\btrout\b", r"\bbass\b",
      r"\bcatfish\b", r"\bflounder\b", r"\bmackerel\b",
      r"\bherring\b", r"\bsardine\b", r"\banchovie?\b",
      r"\bsnapper\b", r"\bgrouper\b", r"\bmahi\b", r"\bswordfish\b",
      r"\beel\b", r"\bperch\b", r"\bpike\b", r"\bcarp\b",
      r"\bwalleye\b", r"\bbarracuda\b", r"\bcroaker\b",
      r"\bpollock\b", r"\bchub\b", r"\bdrum\b", r"\bsprat\b",
      r"\bwhitefish\b", r"\bostrich fish\b",
      r"\bfish\b"]),  # generic last
    ("Fish Sauce & Products", "Condiments & Sauces",
     [r"fish sauce", r"fish paste", r"oyster sauce",
      r"worcestershire"]),

    # ─── MEAT & POULTRY ───
    ("Organ Meat",    "Meat & Poultry",
     [r"\bliver\b", r"\bkidney\b", r"\bheart\b(?!.*artichoke)",
      r"\btripe\b", r"\bgizzard\b", r"chitterling", r"hog maw",
      r"\bbrains?\b", r"sweetbread", r"tongue(?!.*artichoke)"]),
    ("Game Meat",     "Meat & Poultry",
     [r"\bvenison\b", r"\bdeer\b", r"\bbison\b", r"\belk\b",
      r"\bboar\b", r"\bwild pig\b", r"\bmoose\b", r"\bcaribou\b",
      r"\bbear\b", r"\braccoon\b", r"\bpossum\b", r"\bopossum\b",
      r"\bsquirrel\b", r"\bbeaver\b", r"\bgroundhog\b",
      r"\barmadillo\b", r"\brabbit\b"]),
    ("Duck & Goose",  "Meat & Poultry",
     [r"\bduck\b", r"\bgoose\b"]),
    ("Veal & Lamb",   "Meat & Poultry",
     [r"\bveal\b", r"\blamb\b", r"\bmutton\b", r"\bgoat\b"]),
    ("Chicken",       "Meat & Poultry",
     [r"\bchicken\b", r"\bpoultry\b"]),
    ("Turkey",        "Meat & Poultry",
     [r"\bturkey\b", r"\bpheasant\b", r"\bquail\b", r"\bdove\b",
      r"\bpartridge\b"]),
    ("Processed Meat","Meat & Poultry",
     [r"\bsalami\b", r"\bpastrami\b", r"\bpepperoni\b",
      r"\bchorizo\b", r"\bbratwurst\b", r"\bknockwurst\b",
      r"\bthuringer\b", r"\bbologna\b", r"\bmortadella\b",
      r"\bprosciutto\b", r"\bliverwurst\b", r"luncheon meat",
      r"cold cut", r"deli meat", r"meat spread", r"potted meat",
      r"\bspam\b(?!.*email)"]),
    ("Sausage",       "Meat & Poultry",
     [r"\bsausage\b", r"\bhot dog\b", r"\bfrankfurter\b",
      r"\bbratwurst\b", r"\bchorizo\b"]),
    ("Bacon & Ham",   "Meat & Poultry",
     [r"\bbacon\b", r"\bham\b(?!.*cheese.*sandwich|.*egg.*sandwich)"]),
    ("Pork",          "Meat & Poultry",
     [r"\bpork\b", r"\bspareribs?\b", r"\bpig\b(?!.*guinea)"]),
    ("Beef",          "Meat & Poultry",
     [r"\bbeef\b", r"\bsteak\b", r"\bbrisket\b", r"\bribeye\b",
      r"\bsirloin\b", r"\bground beef\b", r"\bveal\b"]),

    # ─── VEGETABLES ───
    ("Leafy Greens",    "Vegetables",
     [r"\bspinach\b", r"\bkale\b", r"\blettuce\b", r"\bcollard\b",
      r"\barugula\b", r"\bchard\b", r"\bwatercress\b",
      r"\bendive\b", r"\bradicchio\b", r"\bcress\b",
      r"beet green", r"turnip green", r"mustard green"]),
    ("Cruciferous",     "Vegetables",
     [r"\bbroccoli\b", r"\bcauliflower\b", r"\bcabbage\b",
      r"brussels sprout", r"bok choy", r"kohlrabi"]),
    ("Root Vegetables", "Vegetables",
     [r"\bcarrot\b", r"\bpotato\b(?!.*chip|.*crisp)",
      r"sweet potato", r"\bbeet\b(?! green)", r"\bturnip\b",
      r"\bparsnip\b", r"\bradish\b", r"\byam\b",
      r"\bcassava\b", r"\btaro\b"]),
    ("Alliums",         "Vegetables",
     [r"\bonion\b", r"\bgarlic\b", r"\bscallion\b",
      r"\bleek\b", r"\bchive\b", r"\bshallot\b"]),
    ("Squash",          "Vegetables",
     [r"\bzucchini\b", r"\bsquash\b(?!.*acorn)",
      r"\bpumpkin\b", r"acorn squash", r"butternut squash"]),
    ("Mushroom",        "Vegetables",
     [r"\bmushroom\b", r"\btruffle\b"]),
    ("Other Vegetables","Vegetables",
     [r"\btomato\b", r"\bpepper\b(?!.*sauce|.*mint)",
      r"\basparagus\b", r"\bcelery\b", r"\bcucumber\b",
      r"\beggplant\b", r"\bokra\b", r"\bcactus\b",
      r"\bparsley\b", r"\bbasil\b", r"\bherb\b",
      r"\bvegetable\b", r"\bgreens\b"]),

    # ─── FRUITS ───
    ("Berries",       "Fruits",
     [r"\bstrawberry\b", r"\bblueberry\b", r"\braspberry\b",
      r"\bblackberry\b", r"\bcranberry\b", r"\bgooseberry\b",
      r"\bcurrant\b", r"\belderberry\b"]),
    ("Citrus",        "Fruits",
     [r"\borange\b", r"\blemon\b", r"\blime\b",
      r"\bgrapefruit\b", r"\btangerine\b", r"\bclementine\b",
      r"\bpomelo\b"]),
    ("Tropical",      "Fruits",
     [r"\bbanana\b", r"\bmango\b", r"\bpineapple\b",
      r"\bpapaya\b", r"\bguava\b", r"\blychee\b",
      r"\bdurian\b", r"\bpassionfruit\b", r"\bjackfruit\b",
      r"\bplantain\b", r"\btamarind\b"]),
    ("Stone Fruits",  "Fruits",
     [r"\bpeach\b", r"\bplum\b", r"\bcherry\b",
      r"\bapricot\b", r"\bnectarine\b"]),
    ("Apple & Pear",  "Fruits",
     [r"\bapple\b(?!.*sauce.*side|.*cider.*vinegar)",
      r"\bpear\b"]),
    ("Grape & Melon", "Fruits",
     [r"\bgrape\b(?!.*juice.*drink)", r"\bwatermelon\b",
      r"\bmelon\b", r"\bcantaloupe\b", r"\bhoneydew\b"]),
    ("Dried Fruits",  "Fruits",
     [r"\braisin\b", r"\bprune\b", r"\bdate\b(?!.*bar)",
      r"\bfig\b", r"\bdried.*fruit", r"\bfruit.*dried"]),
    ("Avocado",       "Fruits",
     [r"\bavocado\b", r"\bguacamole\b"]),
    ("Other Fruits",  "Fruits",
     [r"\bkiwi\b", r"\bcoconut\b(?!.*milk|.*oil|.*water)",
      r"\bpomegranate\b", r"\bpersimmon\b", r"\btomatillo\b",
      r"\bfruit\b(?!.*drink|.*punch|.*juice)"]),
    ("Fruit Juice",   "Fruits",
     [r"\bjuice\b"]),

    # ─── GRAINS & BAKERY ───
    ("Bread & Rolls", "Grains & Bakery",
     [r"\bbread\b", r"\broll\b(?!.*drum|.*spring)", r"\bbun\b",
      r"\bbagel\b", r"\benglish muffin\b", r"\bciabatta\b",
      r"\bfocaccia\b"]),
    ("Tortilla & Flatbread", "Grains & Bakery",
     [r"\btortilla\b", r"\bpita\b", r"\bnaan\b",
      r"\blavash\b", r"\bchapati\b", r"\broti\b",
      r"\bflatbread\b"]),
    ("Pasta",         "Grains & Bakery",
     [r"\bpasta\b", r"\bnoodle\b", r"\bspaghetti\b",
      r"\bmacaroni\b", r"\bfettuccine\b", r"\brigatoni\b",
      r"\bpenne\b", r"\blasagna\b", r"\bravioli\b",
      r"\bgnocchi\b"]),
    ("Rice",          "Grains & Bakery",
     [r"\brice\b"]),
    ("Cereal",        "Grains & Bakery",
     [r"\bcereal\b", r"\boatmeal\b", r"\bporridge\b",
      r"\bgranola\b(?!.*bar)", r"\bmuesli\b"]),
    ("Crackers",      "Grains & Bakery",
     [r"\bcracker\b", r"\bpretzel\b", r"\brice cake\b"]),
    ("Other Grains",  "Grains & Bakery",
     [r"\bquinoa\b", r"\bbarley\b", r"\bmillet\b",
      r"\bbulgur\b", r"\bcouscous\b", r"\bpolenta\b",
      r"\bcornmeal\b", r"\bgrits\b", r"\boats?\b",
      r"\bwheat\b(?!.*bran)", r"\bspelt\b", r"\bamaranth\b",
      r"\bsorghum\b"]),
    ("Bran & Germ",   "Grains & Bakery",
     [r"\bbran\b", r"wheat germ", r"oat bran"]),

    # ─── LEGUMES, NUTS & SEEDS ───
    ("Beans & Lentils", "Legumes, Nuts & Seeds",
     [r"\bbean\b", r"\blentil\b", r"\bchickpea\b", r"\bhummus\b",
      r"\bpea\b(?!.*peanut)", r"\bblack.?eyed pea\b",
      r"\bkidney\b(?!.*organ|.*stone)", r"\bpinto\b",
      r"\bsoybean\b", r"\bfava\b", r"\bgarbanzo\b"]),
    ("Tree Nuts",      "Legumes, Nuts & Seeds",
     [r"\balmond\b(?!.*milk)", r"\bwalnut\b", r"\bcashew\b",
      r"\bpecan\b", r"\bpistachio\b", r"\bmacadamia\b",
      r"\bhazelnut\b", r"\bbrazil nut\b", r"\bpine nut\b",
      r"\bchestnut\b"]),
    ("Peanut",         "Legumes, Nuts & Seeds",
     [r"\bpeanut\b"]),
    ("Nut Butter",     "Legumes, Nuts & Seeds",
     [r"peanut butter", r"almond butter", r"cashew butter",
      r"nut butter", r"\btahini\b"]),
    ("Seeds",          "Legumes, Nuts & Seeds",
     [r"\bchia\b", r"\bflax\b", r"sunflower seed",
      r"pumpkin seed", r"\bsesame\b(?!.*oil)",
      r"\bhemp seed\b", r"poppy seed"]),

    # ─── BEVERAGES ───
    ("Coffee",         "Beverages",
     [r"\bcoffee\b", r"\bespresso\b", r"\bcappuccino\b",
      r"\blatte\b"]),
    ("Tea",            "Beverages",
     [r"\btea\b"]),
    ("Alcohol",        "Beverages",
     [r"\bbeer\b", r"\bwine\b", r"\bwhiskey\b", r"\bvodka\b",
      r"\brum\b(?!\b)", r"\bgin\b(?!\b)", r"\bcocktail\b",
      r"\bhighball\b", r"\bliquor\b", r"\bbourbon\b",
      r"\bbrandy\b", r"\bchampagne\b", r"\bale\b(?! sauce)"]),
    ("Smoothie & Shake","Beverages",
     [r"\bsmoothie\b", r"\blicuado\b", r"\bbatido\b",
      r"\bshake\b(?!.*milk shake)"]),
    ("Soft Drinks",    "Beverages",
     [r"\bsoda\b", r"soft drink", r"\bcola\b", r"carbonated"]),
    ("Water",          "Beverages",
     [r"\bwater\b(?!.*mouth|.*eye)"]),
    ("Juice Drinks",   "Beverages",
     [r"lemonade", r"fruit drink", r"fruit punch", r"nectar",
      r"kool.?aid", r"juice drink"]),
    ("Other Beverages","Beverages",
     [r"\bbeverage\b", r"\bdrink\b(?!.*diet|.*soft)"]),

    # ─── FAST FOOD & PREPARED ───
    ("Pizza",          "Fast Food & Prepared",
     [r"\bpizza\b"]),
    ("Burgers",        "Fast Food & Prepared",
     [r"\bburger\b", r"\bhamburger\b", r"\bcheeseburger\b"]),
    ("Sandwiches",     "Fast Food & Prepared",
     [r"\bsandwich\b", r"\bsub\b(?! group)",
      r"\bhoagie\b", r"\bwrap\b(?!.*grain|.*tortilla)"]),
    ("Mexican",        "Fast Food & Prepared",
     [r"\bburrito\b", r"\btaco\b(?!.*seasoning)",
      r"\bquesadilla\b", r"\bencilada\b", r"\bnachos?\b"]),
    ("Fried Chicken",  "Fast Food & Prepared",
     [r"fried chicken", r"chicken.*fried", r"chicken nugget",
      r"chicken tender", r"chicken finger"]),
    ("Mixed Dishes",   "Fast Food & Prepared",
     [r"\bcasserole\b", r"\bstew\b(?!.*oyster)", r"\bchili\b",
      r"\bcurry\b", r"\bstir.?fry\b", r"fried rice",
      r"lo mein", r"pad thai", r"\bhash\b"]),

    # ─── SOUPS & BROTHS ───
    ("Soup",           "Soups & Broths",
     [r"\bsoup\b", r"\bchowder\b", r"\bbisque\b", r"\bgumbo\b"]),
    ("Broth & Stock",  "Soups & Broths",
     [r"\bbroth\b", r"\bstock\b(?!.*market)", r"\bbouillon\b"]),

    # ─── CONDIMENTS & SAUCES ───
    ("Sauces",         "Condiments & Sauces",
     [r"\bsauce\b(?!.*applesauce)", r"\bgravy\b",
      r"\bmarinara\b", r"\balfreda?\b"]),
    ("Dressings",      "Condiments & Sauces",
     [r"\bdressing\b", r"\bvinaigrette\b"]),
    ("Dips",           "Condiments & Sauces",
     [r"\bdip\b(?!.*dipping)", r"\bsalsa\b", r"\bhummus\b"]),
    ("Spreads",        "Condiments & Sauces",
     [r"\bjam\b", r"\bjelly\b", r"\bmarmalade\b",
      r"\bhoney\b", r"\bsyrup\b(?!.*cough)",
      r"\bspread\b"]),
    ("Condiments",     "Condiments & Sauces",
     [r"\bketchup\b", r"\bmustard\b", r"\bmayonnaise\b",
      r"\bpickle\b", r"\brelish\b", r"\bchuney\b",
      r"\bvinegar\b", r"\bhot sauce\b"]),

    # ─── SWEETS & DESSERTS ───
    ("Chocolate",      "Sweets & Desserts",
     [r"\bchocolate\b(?!.*milk\b)", r"\bcocoa\b(?!.*powder.*drink)"]),
    ("Candy",          "Sweets & Desserts",
     [r"\bcandy\b", r"\bgummy\b", r"\bcaramel\b",
      r"\blicorice\b", r"\bnougat\b", r"\btoffee\b"]),
    ("Cookies",        "Sweets & Desserts",
     [r"\bcookie\b", r"\bbiscotti\b", r"\bshortbread\b",
      r"\bwafer\b"]),
    ("Cakes & Pastry", "Sweets & Desserts",
     [r"\bcake\b(?!.*rice)", r"\bcupcake\b", r"\bmuffin\b",
      r"\bpastry\b", r"\bcroissant\b", r"\bdoughnut\b",
      r"\bdonut\b", r"\bdanish\b", r"\beclaire?\b",
      r"\bbrownie\b", r"\bbaklava\b"]),
    ("Pie & Tart",     "Sweets & Desserts",
     [r"\bpie\b(?!.*magpie)", r"\btart\b(?!.*tartare)",
      r"\bcobbler\b", r"\bcrisp\b(?!.*chip)"]),
    ("Pudding & Custard","Sweets & Desserts",
     [r"\bpudding\b", r"\bcustard\b", r"\bflan\b",
      r"\bmousse\b", r"\btiramisu\b", r"\btrifle\b",
      r"creme brulee", r"\bpanna cotta\b", r"\bbarfi\b",
      r"\bhalwa\b"]),
    ("Snack Bars",     "Sweets & Desserts",
     [r"granola bar", r"protein bar", r"cereal bar",
      r"energy bar", r"power bar", r"nutrition bar"]),

    # ─── SALADS & MIXED VEGETABLES ───
    ("Salad",          "Salads & Mixed",
     [r"\bsalad\b", r"\bcoleslaw\b", r"\btabouleh\b"]),

    # ─── PANCAKES, WAFFLES & BREAKFAST BREADS ───
    ("Pancake & Waffle",  "Grains & Bakery",
     [r"\bpancake\b", r"\bwaffle\b", r"french toast", r"\bcrepe\b",
      r"\bblintz\b", r"\bscone\b", r"\bbrioche\b"]),

    # ─── POPCORN & CORN SNACKS ───
    ("Popcorn",           "Snacks & Desserts",
     [r"\bpopcorn\b"]),
    ("Corn Snacks",       "Snacks & Desserts",
     [r"corn chip", r"cornbread", r"\bcornmeal\b", r"\bgrits\b",
      r"\bpolenta\b", r"\bstuffing\b", r"\bcrouton\b"]),

    # ─── HERBS, SPICES & SEASONINGS ───
    ("Spices & Herbs",    "Condiments & Sauces",
     [r"\bspice\b", r"\bseasoning\b", r"\bherb\b",
      r"\bcinnamon\b", r"\bcumin\b", r"\bturmeric\b",
      r"\bpaprika\b", r"\bpepper.*ground\b", r"\bgarlic powder\b",
      r"\bonion powder\b", r"\boregan\b", r"\bthyme\b",
      r"\brosemary\b", r"\bsage\b", r"\bdill\b", r"\bmint\b",
      r"\bbasil.*dried\b", r"\bparsley.*dried\b"]),

    # ─── OILS & FATS ───
    ("Oils & Fats",       "Condiments & Sauces",
     [r"\boil\b(?!.*mineral|.*fish)", r"\blard\b", r"\bshortening\b",
      r"\bmargarine\b", r"fat.*cooking", r"cooking fat"]),

    # ─── SPECIALTY FISH (rare species not caught by generic \bfish\b) ───
    ("Fish",              "Seafood",
     [r"\bmullet\b", r"\bpompano\b", r"\banchovie?\b",
      r"\broe\b", r"\bcaviar\b", r"\bsurimi\b",
      r"\bimitation crab\b"]),

    # ─── GAME & EXOTIC MEAT additional ───
    ("Game Meat",         "Meat & Poultry",
     [r"\bostrich\b", r"\bcornish.*hen\b", r"\bgame hen\b",
      r"\bgroundhog\b", r"\bgroundhog\b", r"\bwild.*fowl\b"]),

    # ─── ETHNIC / SPECIALTY DISHES ───
    ("Ethnic Dishes",     "Fast Food & Prepared",
     [r"\bfalafel\b", r"\bempanada\b", r"\bsushi\b", r"\bkimchi\b",
      r"\bkebab\b", r"\bshawarma\b", r"\bgyro\b",
      r"\bdal\b", r"\bdhal\b", r"\bsamosa\b",
      r"\bdim sum\b", r"\bspring roll\b", r"\begg roll\b"]),

    # ─── EGG DISHES ───
    ("Egg Dishes",        "Dairy & Eggs",
     [r"\bomelet\b", r"\bfrittata\b", r"\bquiche\b",
      r"\bscrambled.*egg\b", r"\bfried.*egg\b", r"egg.*benedict"]),

    # ─── VEGETABLES (misc not caught above) ───
    ("Other Vegetables",  "Vegetables",
     [r"\bsprout\b", r"\bjicama\b", r"\bseaweed\b", r"\balgae\b",
      r"\bnori\b", r"\bwakame\b", r"\bbamboo\b",
      r"hearts of palm", r"water chestnut", r"\blotus\b",
      r"\bcollard\b", r"collards"]),

    # ─── LEGUME DISHES ───
    ("Beans & Lentils",   "Legumes, Nuts & Seeds",
     [r"refried bean", r"\bdal\b", r"\bdhal\b"]),

    # ─── PORK MISC ───
    ("Pork",              "Meat & Poultry",
     [r"fat back", r"fatback", r"pork rind", r"\bscrapple\b",
      r"\blard\b(?!.*non)"]),

    # ─── GENERAL MEAT NFS ───
    ("Mixed Meat",        "Meat & Poultry",
     [r"\bmeat\b.*\bnfs\b", r"ground meat.*nfs", r"meat.*generic"]),

    # ─── MISC BAKING & BEVERAGES ───
    ("Cocoa & Baking",    "Other",
     [r"cocoa powder", r"\byeast\b", r"\bbaking powder\b",
      r"\bbaking soda\b", r"\bgelatin\b"]),

    ("Vinegar & Oils",    "Condiments & Sauces",
     [r"\bvinegar\b"]),

    # ─── FINAL SWEEP — common remaining patterns ───
    ("Cream",             "Dairy & Eggs",
     [r"\bcream\b(?!.*ice|.*sour|.*whip)"]),
    ("Fish",              "Seafood",
     [r"rarebit", r"\broe\b", r"\bmullet\b", r"\bpompano\b",
      r"\bsmelts?\b", r"\btilapi\b", r"\bbluefish\b",
      r"\bcisco\b", r"\bwhitefish\b"]),
    ("Game Meat",         "Meat & Poultry",
     [r"\bscrapple\b"]),
    ("Other Vegetables",  "Vegetables",
     [r"\bgreens\b(?!.*salad)", r"\bchard\b", r"\bsorrel\b",
      r"\brampe\b", r"\bfiddlehead\b"]),
    ("Other Fruits",      "Fruits",
     [r"\bpomegranate\b", r"\bjujube\b", r"\bsapote\b",
      r"\bfeijoa\b", r"\bstarfruit\b", r"\bcarambola\b"]),
    ("Mixed Dishes",      "Fast Food & Prepared",
     [r"nfs$", r"\bnfs\b", r"\bns as to\b"]),
]

def assign_hierarchy(desc):
    d = str(desc).lower()
    for sub, main, patterns_list in HIERARCHY:
        for pat in patterns_list:
            try:
                if re.search(pat, d):
                    return sub, main
            except re.error:
                continue
    return "Other", "Other"

print("    Applying patterns (this may take 10-15 seconds)...")
result = df["desc_lower"].apply(assign_hierarchy)
df["sub_group"]  = [r[0] for r in result]
df["main_group"] = [r[1] for r in result]

coverage = (df["sub_group"] != "Other").mean() * 100
print(f"    Coverage: {coverage:.1f}%  (target ≥ 90%)")

# Refine is_plant_based using the newly assigned main_group
df["is_plant_based"] = np.where(
    df["main_group"].isin(["Vegetables", "Fruits", "Grains & Bakery", "Legumes, Nuts & Seeds", "Plant-based Alternatives"]),
    1,
    df["is_plant_based"]
)

# ============================================================
# 11. RANKINGS
# ============================================================

print("[11] Creating rankings...")
df["nds_rank"] = df["nutrient_density_score"].fillna(0).rank(ascending=False, method="min").astype(int)
df["cws_rank"]  = df["cws"].fillna(0).rank(ascending=False, method="min").astype(int)

# ============================================================
# 12. COLUMN ALIASES (backward compat with plan naming)
# ============================================================

df["nds"]            = df["nutrient_density_score"]
df["calories"]       = df["calories_calc"]
df["protein"]        = df["protein_g"]
df["carbohydrate"]   = df["carbohydrate_g"]
df["fat_total_lipid"]= df["total_fat_g"]
df["fiber"]          = df["fiber_g"]
df["sugar_total"]    = df["sugars_g"]
df["sodium"]         = df["sodium_mg"]
df["vitamin_a_rae"]  = df["vitamin_a_mcg"] if "vitamin_a_mcg" in df.columns else 0
df["vitamin_c"]      = df["vitamin_c_mg"] if "vitamin_c_mg" in df.columns else 0
df["vitamin_k"]      = df["vitamin_k_mcg"] if "vitamin_k_mcg" in df.columns else 0
df["calcium"]        = df["calcium_mg"] if "calcium_mg" in df.columns else 0
df["iron"]           = df["iron_mg"] if "iron_mg" in df.columns else 0

df["nds_score_norm"] = df["nutrient_density_score"]   # alias
df["cws_score_norm"] = df["cws"]                       # alias
df["protein_pct"]    = df["protein_pct_cal"]           # alias
df["carb_pct"]       = df["carb_pct_cal"]              # alias
df["fat_pct"]        = df["fat_pct_cal"]               # alias

# ============================================================
# 13. EXPORT
# ============================================================

print("[12] Exporting outputs...")
df.to_csv(OUTPUT_FILE, index=False)

pretty_columns = [
    "category", "description", "nutrient_data_bank_number",
    "protein_g", "carbohydrate_g", "total_fat_g", "fiber_g",
    "sugars_g", "saturated_fat_g", "mono_fat_g", "poly_fat_g",
    "cholesterol_mg", "calcium_mg", "iron_mg", "magnesium_mg",
    "potassium_mg", "sodium_mg", "zinc_mg", "vitamin_c_mg",
    "vitamin_k_mcg", "vitamin_a_mcg", "vitamin_b12_mcg",
    "vitamin_b6_mg", "alpha_carotene_mcg", "beta_carotene_mcg",
    "beta_cryptoxanthin_mcg", "lycopene_mcg", "lutein_zeaxanthin_mcg",
    "retinol_mcg", "niacin_mg", "thiamin_mg", "riboflavin_mg",
    "selenium_mcg", "choline_mg", "water_g",
    "calories_calc", "protein_pct_cal", "carb_pct_cal",
    "fat_pct_cal", "protein_per_100kcal", "fiber_per_100kcal",
    "calcium_per_100kcal", "iron_per_100kcal", "nutrient_density_score",
    "nds_per_100kcal", "cws", "nds_rank", "cws_rank",
    "nova_level", "processing_level", "main_group", "sub_group",
    "is_fortified", "is_plant_based", "is_infant", "is_raw",
    "nds", "calories", "protein", "carbohydrate", "fat_total_lipid", "fiber", "sugar_total", "sodium", "calcium", "iron", "vitamin_a_rae", "vitamin_c", "vitamin_k"
]
pretty_df = df[[c for c in pretty_columns if c in df.columns]].copy()
float_cols = pretty_df.select_dtypes(include=[np.floating]).columns.tolist()
pretty_df[float_cols] = pretty_df[float_cols].round(2)
pretty_df.to_csv(OUTPUT_FILE_PRETTY, index=False, float_format="%.2f")

manual_review = df[df["sub_group"] == "Other"].copy()
manual_review.to_csv(MANUAL_REVIEW_FILE, index=False)

# ============================================================
# 14. QC REPORT
# ============================================================

print("[13] Generating QC report...")

zero_cal     = (df["calories_calc"] == 0).sum()
neg_nds      = (df["nutrient_density_score"] < 0).sum()
missing_cols = [c for c in CRITICAL if c not in df.columns]

qc_lines = [
    "=" * 60,
    "PHASE 0 — QC REPORT",
    "=" * 60,
    f"Input rows:          {len(df):,}",
    f"Output columns:      {df.shape[1]}",
    "",
    "── CALORIES ──",
    f"  Zero calories:     {zero_cal}  (expected ~25 — water/tea)",
    f"  Mean calories:     {df['calories_calc'].mean():.1f} kcal",
    f"  Max calories:      {df['calories_calc'].max():.1f} kcal",
    "",
    "── SCORES ──",
    f"  NDS range:         {df['nutrient_density_score'].min():.1f} – {df['nutrient_density_score'].max():.1f}",
    f"  CWS range:         {df['cws'].min():.1f} – {df['cws'].max():.1f}",
    f"  Negative NDS:      {neg_nds}  (expected 0)",
    "",
    "── HIERARCHY ──",
    f"  Coverage:          {coverage:.1f}%  (target ≥ 90%)",
    f"  Uncovered (Other): {(df['sub_group'] == 'Other').sum():,}",
    "",
    "── BOOLEAN FLAGS ──",
    f"  is_fortified:      {df['is_fortified'].sum()}",
    f"  is_plant_based:    {df['is_plant_based'].sum()}",
    f"  is_infant:         {df['is_infant'].sum()}",
    f"  is_raw:            {df['is_raw'].sum()}",
    "",
    "── PROCESSING LEVEL ──",
]
for lvl, lbl in {1:"Unprocessed", 2:"Minimally processed",
                  3:"Processed", 4:"Ultra-processed"}.items():
    n = (df["nova_level"] == lvl).sum()
    qc_lines.append(f"  NOVA {lvl} ({lbl}): {n:,}")

qc_lines += [
    "",
    "── MAIN GROUP DISTRIBUTION ──",
]
for grp, cnt in df["main_group"].value_counts().items():
    qc_lines.append(f"  {grp:<32} {cnt:>5}")

qc_lines += [
    "",
    "── MISSING CRITICAL COLUMNS ──",
    f"  {missing_cols if missing_cols else 'None — all OK'}",
    "",
    "── TOP 10 NDS FOODS (excl. supplements & infant) ──",
]
top_nds = (df[~df["main_group"].isin(["Supplements & Sports", "Infant Nutrition"])]
           .nlargest(10, "nutrient_density_score")
           [["description", "nutrient_density_score", "calories_calc"]])
for _, row in top_nds.iterrows():
    qc_lines.append(f"  {row['description'][:45]:<45}  NDS={row['nutrient_density_score']:.1f}  cal={row['calories_calc']:.0f}")

qc_lines += ["", "── TOP 10 CWS FOODS (excl. supplements & infant) ──"]
top_cws = (df[~df["main_group"].isin(["Supplements & Sports", "Infant Nutrition"])]
           .nlargest(10, "cws")
           [["description", "cws", "calories_calc", "protein_g"]])
for _, row in top_cws.iterrows():
    qc_lines.append(f"  {row['description'][:45]:<45}  CWS={row['cws']:.1f}  cal={row['calories_calc']:.0f}")

qc_text = "\n".join(qc_lines)
print("\n" + qc_text)

with open(QC_REPORT_FILE, "w", encoding="utf-8") as f:
    f.write(qc_text)

print(f"\n{'='*65}")
print("  PHASE 0 COMPLETE")
print(f"{'='*65}")
print(f"  food_cleaned.csv  →  {OUTPUT_FILE}")
print(f"  manual_review.csv →  {MANUAL_REVIEW_FILE}")
print(f"  qc_report.txt     →  {QC_REPORT_FILE}")
print(f"  Columns: {df.shape[1]}  |  Coverage: {coverage:.1f}%")
print(f"{'='*65}")
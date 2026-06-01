BÁO CÁO KẾ HOẠCH KHAI THÁC DỮ LIỆU FOOD.CSV – DỮ LIỆU DINH DƯỠNG THỰC PHẨM
Ngày: 27/05/2026 
1. Executive Summary
File food.csv chứa 7.083 records với 38 cột thông tin dinh dưỡng (tính theo per 100g). Đây là dataset chất lượng cao, phong phú nhưng đang gặp vấn đề lớn: cột Category có 2.429 giá trị unique, dẫn đến dữ liệu bị phân mảnh nghiêm trọng.
Kế hoạch tổng thể:
•	Sử dụng Python làm công cụ chính cho toàn bộ xử lý dữ liệu, feature engineering, phân tích và xây dựng logic.
•	Power BI chỉ được sử dụng ở giai đoạn cuối để trực quan hóa, xây dựng dashboard tương tác và xuất báo cáo chuyên nghiệp.
Kế hoạch gồm 1 Phase chuẩn bị + 5 Module, tập trung giải quyết triệt để vấn đề phân mảnh dữ liệu và khai thác tối đa giá trị dinh dưỡng. 

2. Tổng quan Dataset
•	Số records: 7.083
•	Số cột: 38 (2 cột text + 36 cột numeric)
•	Đơn vị: Tất cả dưỡng chất đều tính theo per 100g
•	Vấn đề cốt lõi: 2.429 Category unique, trong đó 1.753 category chỉ xuất hiện 1 lần. Chỉ có 14 category có trên 50 records.
•	Điểm mạnh: Dữ liệu sạch (không null), có 635 records fortified, 404 records Infant formula, và thông tin chi tiết về phytonutrients, choline, breakdown chất béo.

3. Phân công Team (Bổ sung sau)

4. Kế Hoạch Xử Lý Tệp Dữ Liệu
Phase 0: Data Preparation & Feature Engineering
Mục tiêu: Xử lý triệt để vấn đề phân mảnh và làm giàu dữ liệu.
Các bước thực hiện:
•	Làm sạch tên cột, tạo cột desc_lower.
•	Tính Calories, tỷ lệ Macro (% calo), Nutrient Density Score (NDS) và Composite Wellness Score (CWS).
•	Tạo các cờ: is_fortified, is_plant_based, is_infant.
•	Phân loại Processing Level (4 cấp theo NOVA).
•	Custom Category Hierarchy (bước quan trọng nhất).
Custom Category Hierarchy:
•	Lý do: Category gốc quá chi tiết và phân mảnh → không thể group và so sánh nhóm lớn (Yogurt, Chicken, Milk…).
•	Giải pháp: Tạo 2 cấp độ mới:
 o	Main_Group (15–18 nhóm lớn): Dairy & Eggs, Meat & Poultry, Plant-based Alternatives, Vegetables, Fruits, Beverages…
 o	Sub_Group (50–70 nhóm): Milk, Yogurt, Chicken, Beef, Plant Milk, Leafy Greens…
•	Cách làm: Sử dụng Regex + Keyword matching trên cột description. Mục tiêu coverage ≥ 85%. Phần “Other” sẽ review thủ công.
Kết quả Phase 0: File food_cleaned.csv (~55–60 cột) với hệ thống phân loại rõ ràng, sẵn sàng cho các module sau.

5. Chi Tiết 5 Module
Module 1: Nutritional Profiling & Insight Discovery 
Mục tiêu: Xây dựng bức tranh toàn diện về giá trị dinh dưỡng của dataset. Lý do: Cần có cái nhìn có hệ thống trước khi so sánh và gợi ý. Bước thực hiện:
•	Sử dụng Main_Group và Sub_Group để nhóm.
•	Tính Top 20 thực phẩm giàu từng dưỡng chất (Protein, Fiber, Vitamin K, Calcium…).
•	So sánh trực tiếp giữa các nhóm quan trọng.
•	Xếp hạng toàn bộ theo NDS và CWS.
•	Phân tích Phytonutrients.
Kết quả: Top lists, bảng so sánh, insight văn bản. Giải quyết: Vấn đề “dữ liệu nhiều nhưng chưa được tổ chức và xếp hạng”.

Module 2: Trend & Comparative Analysis 
Mục tiêu: Phát hiện xu hướng và sự khác biệt giữa các nhóm. Lý do: Hỗ trợ ra quyết định dinh dưỡng và phát triển sản phẩm. Bước thực hiện:
•	So sánh Fortified vs Non-fortified.
•	So sánh Plant-based vs Animal-based.
•	Phân tích theo Processing Level.
•	Benchmark theo Main_Group.
Kết quả: Báo cáo so sánh định lượng, insight hành động. Giải quyết: Câu hỏi “Nhóm nào tốt hơn? Thực phẩm chế biến sâu có thực sự kém lành mạnh?”

Module 3: Diet Recommendation System 
Mục tiêu: Xây dựng hệ thống gợi ý thực phẩm theo chế độ ăn. Lý do: Module có giá trị ứng dụng cao nhất. Bước thực hiện:
•	Xây dựng 7+ Goal Profiles (Keto, Muscle Gain, Heart Health…).
•	Kết hợp Hard Filter + Weighted Scoring.
•	Viết hàm recommend_foods().
•	Xây dựng validation test suite.
Kết quả: Hàm gợi ý linh hoạt + Top 10 cho từng mục tiêu. Giải quyết: Bài toán “Biết ăn gì cho phù hợp với mục tiêu sức khỏe?”

Module 4: Recipe Nutrition Calculator 
Mục tiêu: Tính dinh dưỡng cho công thức nấu ăn. Lý do: Dataset chỉ có nguyên liệu đơn lẻ, cần công cụ kết hợp. Bước thực hiện:
•	Input danh sách nguyên liệu + gram.
•	Fuzzy matching + Cooking Factor.
•	Tính tổng và tạo Nutrition Label.
Kết quả: Công cụ tính toán + Nutrition Label cho nhiều công thức mẫu. Giải quyết: Hạn chế lớn của dữ liệu nguyên liệu thô.

Module 5: Machine Learning 
Mục tiêu: Khai phá dữ liệu sâu và xây dựng nền tảng cho trợ lý ảo thông minh.
•	Unsupervised Learning - Anomaly Detection (Phát hiện dị biệt): Sử dụng Isolation Forest để tìm ra các thực phẩm "giấu mặt" mang rủi ro sức khỏe (ví dụ: các món ăn trông có vẻ healthy nhưng lượng calo, Natri hoặc đường ẩn cực cao).
•	Clustering (K-Means): Phân nhóm thực phẩm theo cấu trúc dinh dưỡng (Food Archetypes) để dễ dàng tìm kiếm sản phẩm thay thế.
•	RAG Chatbot Integration (Trợ lý Dinh dưỡng AI):
 o	Tạo Food Embeddings (Vector hóa) cho toàn bộ 7.083 món ăn dựa trên hồ sơ dinh dưỡng của chúng.
 o	Kết hợp LLM + RAG để xử lý ngôn ngữ tự nhiên.
 o	User use-case: Người dùng nhập "Tôi muốn tìm một món thay thế thịt bò hầm nhưng ít chất béo bão hòa hơn". Hệ thống truy xuất vector gần nhất và LLM sẽ tạo câu trả lời gợi ý tự nhiên.

Các Bài Toán ML Chính Sẽ Triển Khai (Tập trung cho Chatbot)
Module 3.1: Healthy / Unhealthy Classification
•	Mô hình: XGBoost / Random Forest / Neural Network
•	Output: Phân loại mỗi thực phẩm thành Healthy / Neutral / Unhealthy
•	Tính năng cho Chatbot: Khi người dùng hỏi “Món này có healthy không?”, chatbot sẽ trả lời dựa trên model + giải thích (ví dụ: cao Protein, thấp Sugar…).
Module 3.2: Diet Type Classification (Multi-label)
•	Mô hình: Multi-label Classification (XGBoost hoặc Transformer)
•	Output: Dự đoán thực phẩm phù hợp với những chế độ nào (Keto, Vegan, Low Sodium, Diabetes-friendly, Muscle Gain…)
•	Tính năng cho Chatbot: “Thực phẩm này phù hợp với Keto và Muscle Gain.”
Module 3.3: Content-based Recommendation
•	Phương pháp: Cosine Similarity + Food Embedding
•	Output: Tìm thực phẩm thay thế tương tự (ví dụ: thay thế cho cá hồi)
•	Tính năng cho Chatbot: “Bạn muốn thay thế cá hồi trong Keto thì thử cá ngừ hoặc trứng là phù hợp.”
Module 3.4: Personalized Diet Recommendation (Hybrid System)
•	Phương pháp: Kết hợp Rule-based + ML Scoring
•	Output: Top-N thực phẩm theo mục tiêu người dùng
•	Tính năng cho Chatbot: Trả lời theo ngữ cảnh hội thoại (“Hôm nay bạn tập gym, nên ăn gì?”)

MODULE 6: Power BI Master Dashboard
Mục tiêu: Đóng gói toàn bộ insight thành dạng báo cáo BI tương tác.
•	Import file food_cleaned.csv và kết quả trả về từ các module Machine Learning.
•	Xây dựng các tab tương tác:
 o	Overview & Trend: Dashboard dành cho góc nhìn vĩ mô (So sánh Plant-based vs Animal, Processed vs Raw).
 o	Nutritional Profiler: Cho phép drill-down vào từng nhóm Sub_group để xem phân bố vi chất.
 o	Meal Planner Simulator: Bảng tính giả lập cho phép user kéo thả các món ăn để xem chỉ số calo/macro tổng cộng thay đổi thế nào.

import os
import sys
from openai import OpenAI
import module6_deep_rag as m6

# Khoi tao ket noi den LM Studio (mac dinh cong 1234)
client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

print("=" * 65)
print("🚀 KHOI DONG MODULE 7: AGENTIC RAG (LM STUDIO INTEGRATION)")
print("=" * 65)
print("Dang ket noi voi LM Studio tai http://localhost:1234/v1 ...")

try:
    # Kiem tra model dang load trong LM Studio
    models = client.models.list()
    model_name = models.data[0].id if models.data else "local-model"
    print(f"✅ Ket noi thanh cong! Model dang chay: {model_name}")
except Exception as e:
    print("❌ LOI KET NOI: Khong the ket noi den LM Studio.")
    print("Vui long mo LM Studio -> Developer (hoac Local Server) -> Nhan 'Start Server'.")
    sys.exit(1)

# Prompt he thong huong dan LLM cach tra loi
SYSTEM_PROMPT = """Bạn là một Chuyên gia Dinh dưỡng AI. Bạn đang tư vấn cho người dùng bằng tiếng Việt.
Dưới đây là một số dữ liệu thực phẩm tôi đã trích xuất từ cơ sở dữ liệu dựa trên câu hỏi của người dùng.
Hãy sử dụng những thông tin này để tư vấn thật tự nhiên, logic và khoa học.

QUY TẮC CẦN NHỚ:
1. LUÔN trả lời bằng tiếng Việt một cách tự nhiên và lịch sự.
2. KHÔNG ĐƯỢC bịaa ra chỉ số dinh dưỡng. Chỉ dùng số liệu tôi cung cấp trong phần DỮ LIỆU THỰC PHẨM.
3. Nếu người dùng hỏi một món ăn mà trong DỮ LIỆU THỰC PHẨM có nhắc tới, hãy tóm tắt lượng Calo, Đạm, Carb, Béo của món đó.
4. Nếu người dùng hỏi xin tư vấn cho bệnh lý (tiểu đường, tim mạch, gym, giảm cân), hãy phân tích dữ liệu cung cấp xem có phù hợp không (Nhắc nhở về Carb cao cho tiểu đường, Sodium cao cho tim mạch, Calo cao cho giảm cân...).
5. Nếu DỮ LIỆU THỰC PHẨM trống rỗng, hãy xin lỗi và nói rằng bạn không có dữ liệu cho câu hỏi này.
"""

def chat_with_lmstudio():
    # Luu tru lich su cuoc hoi thoai
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    print("\n" + "="*65)
    print("=== AGENTIC RAG CHATBOT (Sponsor by LM Studio) ===")
    print("Goi y: Hay hoi cac cau phuc tap hon nhu: 'Toi dang tap gym, mon nao tot nhat trong nhung mon nay?'")
    print("Go 'exit' hoac 'quit' de thoat.")
    print("="*65)

    while True:
        try:
            user_input = input("\n[Ban] >> ")
            if user_input.lower().strip() in ['exit', 'quit']:
                print("Tam biet! Hen gap lai.")
                break
                
            if not user_input.strip():
                continue
            
            # B1: Tim kiem Vector ngu nghia
            print(f"   [System] Dang quet Database tim '{user_input}'...")
            matches = m6.semantic_search(user_input, top_k=5)
            
            # B2: Ghep du lieu vao Context cho LLM
            context = "DỮ LIỆU THỰC PHẨM TÌM ĐƯỢC:\n"
            if matches:
                for idx, m in enumerate(matches):
                    hl = "Healthy" if m['health_label']==2 else "Neutral" if m['health_label']==1 else "Unhealthy"
                    context += (f"{idx+1}. Món: {m['description']} ({m['main_group']})\n"
                                f"   - Calo: {m['calories']} kcal, Đạm: {m['protein']}g, "
                                f"Carb: {m['carbohydrate']}g, Béo: {m['fat_total_lipid']}g\n"
                                f"   - Sodium: {m['sodium']}mg, Đường: {m['sugar_total']}g\n"
                                f"   - Đánh giá ML: {hl} (Điểm: {m['health_score']:.1f}/100)\n\n")
            else:
                context += "(Không tìm thấy món ăn nào khớp với câu hỏi trong database)\n"
                
            # Tao thong diep cho luot hoi hien tai
            user_msg = f"{context}\n\nCÂU HỎI CỦA NGƯỜI DÙNG:\n{user_input}"
            messages.append({"role": "user", "content": user_msg})
            
            # B3: Goi LM Studio API de sinh cau tra loi (Streaming)
            print(f"[AI Nutritionist] >> ", end="")
            response_stream = client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.7,
                stream=True
            )
            
            full_response = ""
            for chunk in response_stream:
                if chunk.choices[0].delta.content is not None:
                    text = chunk.choices[0].delta.content
                    print(text, end="", flush=True)
                    full_response += text
                    
            print() # Xuong dong sau khi stream xong
            
            # Luu cau tra loi vao lich su (Khong luu context de tranh day context window)
            # Chung ta thay the tin nhan cuoi bang cau hoi that su cua user thay vi nguyen cuc context dai
            messages[-1] = {"role": "user", "content": user_input}
            messages.append({"role": "assistant", "content": full_response})
            
        except KeyboardInterrupt:
            print("\nTam biet! Hen gap lai.")
            break
        except Exception as e:
            print(f"\n[ERROR] Co loi xay ra khi goi LM Studio: {e}")

if __name__ == "__main__":
    chat_with_lmstudio()

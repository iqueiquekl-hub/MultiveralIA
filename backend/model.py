# Integração com modelo local (gpt4all ou llama-cpp)
# O código tenta usar gpt4all se disponível; caso contrário, retorna uma resposta simulada.
import os
def get_model_response(prompt: str) -> str:
    try:
        from gpt4all import GPT4All
        model_path = os.environ.get("GPT4ALL_MODEL_PATH", "ggml-gpt4all-l13b-snoozy.bin")
        m = GPT4All(model_path)
        # generate can return different types; usamos a simples API abaixo
        resp = m.generate(prompt, max_tokens=256)
        if isinstance(resp, (list, tuple)):
            return "\n".join(resp)
        return str(resp)
    except Exception as e:
        # Fallback simples se gpt4all não estiver instalado
        print("[model] gpt4all não disponível ou falha no carregamento:", e)
        return f"Resposta simulada (modo fallback) para: {prompt}"

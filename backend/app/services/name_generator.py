import os
import json
import httpx
from typing import List
from openai import OpenAI
from dotenv import load_dotenv
from app.schemas.schemas import NameGeneratorRequest, GeneratedName

# Load environment variables
load_dotenv()


class NameGeneratorService:
    def __init__(self):
        base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        api_key = os.getenv("LLM_API_KEY")

        # Configure the OpenAI client based on the API being used
        if "openrouter.ai" in base_url:
            self.client = OpenAI(
                api_key=api_key,
                base_url=base_url,
                http_client=httpx.Client(
                    headers={
                        "HTTP-Referer": "http://localhost:3000",  # OpenRouter requires this
                        "X-Title": "Baby Name Generator",  # Optional product name
                    }
                ),
            )
        else:
            self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.model = os.getenv("LLM_MODEL", "gpt-4-1106-preview")

    async def generate_names(
        self, request: NameGeneratorRequest
    ) -> List[GeneratedName]:
        prompt = self._create_prompt(request)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Chinese name generation expert.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"},
            )

            result = json.loads(response.choices[0].message.content)
            return [
                GeneratedName(
                    name=name["name"],
                    gender=name["gender"],
                    meaning=name["meaning"],
                    source=name["source"],
                    explanation=name["explanation"],
                )
                for name in result["names"]
            ]
        except Exception as e:
            print(f"Error generating names: {e}")
            return []

    def _create_prompt(self, request: NameGeneratorRequest) -> str:
        gender_text = {"male": "男孩", "female": "女孩", "neutral": "中性"}.get(
            request.gender, "不限"
        )

        name_length_text = {
            "single": "单字名（一个字）",
            "double": "双字名（两个字）",
            "any": "单字名或双字名均可",
        }.get(request.nameLength, "单字名或双字名均可")

        avoid_chars = (
            ", ".join(request.avoidCharacters) if request.avoidCharacters else "无"
        )
        avoid_sounds = ", ".join(request.avoidSounds) if request.avoidSounds else "无"

        prompt = f"""
请根据以下要求生成{request.count}个中文名字，并以JSON格式返回：

命名要求：
1. 性别：{gender_text}
2. 名字长度：{name_length_text}
3. 期望寓意：{', '.join(request.meanings)}
4. 文化溯源：{', '.join(request.culturalSource)}
5. 回避字：{avoid_chars}
6. 回避读音：{avoid_sounds}

特别说明：
- 根据指定的名字长度要求生成名字，确保完全符合要求
- 姓名要遵循中国传统起名习惯，音韵和谐
- 名字要有美感和寓意，避免生僻字或难写的字
- 每个名字都要提供详细的出处和解释

请以如下JSON格式返回结果：
{{
    "names": [
        {{
            "name": "完整名字",
            "gender": "male/female/neutral",
            "meaning": ["寓意1", "寓意2"],
            "source": "出处",
            "explanation": "详细解释"
        }},
        ...
    ]
}}"""

        return prompt

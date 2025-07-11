from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict


class NameGeneratorRequest(BaseModel):
    gender: Optional[str] = None
    meanings: List[str]
    culturalSource: List[str]
    avoidCharacters: Optional[List[str]] = None
    avoidSounds: Optional[List[str]] = None
    count: int = 3  # Default value of 3 if not specified
    nameLength: Optional[Literal["single", "double", "any"]] = "any"


class GeneratedName(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    gender: str
    meaning: List[str]
    source: str
    explanation: str

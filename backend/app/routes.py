from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List
from fastapi.responses import StreamingResponse
import json
import asyncio
from app.models.database import get_db
from app.schemas.schemas import NameGeneratorRequest, GeneratedName
from app.services.name_generator import NameGeneratorService

router = APIRouter()
name_generator = NameGeneratorService()


@router.get("/generate-name/stream")
async def generate_names_stream(
    request: Request, params: str, db: Session = Depends(get_db)
):
    async def event_generator():
        try:
            # Parse the JSON params
            generator_params = NameGeneratorRequest(**json.loads(params))

            # Generate names one by one
            names = await name_generator.generate_names(generator_params)

            for name in names:
                # Check if client disconnected
                if await request.is_disconnected():
                    break

                # Send each name as it's generated
                yield f"data: {json.dumps(name.dict())}\n\n"
                await asyncio.sleep(0.1)  # Small delay between names

            # Send completion event
            yield "event: done\ndata: complete\n\n"

        except Exception as e:
            print(f"Error in name generation: {e}")
            yield f"event: error\ndata: {str(e)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )

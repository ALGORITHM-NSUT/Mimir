from fastapi import APIRouter, Query, Response
import httpx

router = APIRouter()

@router.get("/proxy")
async def proxy(url: str = Query(...)):
    if not url.startswith(("http://", "https://")):
        return Response(content="Invalid URL format", status_code=400)

    headers = {
        "Origin": "https://www.imsnsit.org/imsnsit/notifications.php",
        "Referer": "https://www.imsnsit.org/imsnsit/notifications.php",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
    }

    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
        except httpx.RequestError as e:
            return Response(content=f"Error fetching URL: {str(e)}", status_code=400)

    return Response(content=resp.content, media_type=resp.headers.get("content-type", "text/html"))

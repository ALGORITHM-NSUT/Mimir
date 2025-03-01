import requests
from fastapi.responses import RedirectResponse
from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/proxy")
async def proxy_request(url: str, request: Request):
    if not url.startswith("http://") and not url.startswith("https://"):
        return {"error": "Invalid URL format"}  # Prevent errors

    headers = {"Origin": request.headers.get("Origin", "https://www.imsnsit.org/imsnsit/notifications.php")}

    try:
        response = requests.get(url, headers=headers, allow_redirects=True)
        return RedirectResponse(url)  # Redirect to original link
    except requests.RequestException:
        return {"error": "Failed to fetch URL"}
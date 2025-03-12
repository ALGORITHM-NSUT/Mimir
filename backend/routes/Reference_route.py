from fastapi import APIRouter, Request, HTTPException, Response
from fastapi.responses import RedirectResponse
from urllib.parse import urlparse, unquote

router = APIRouter()

ALLOWED_DOMAINS = ["https://www.imsnsit.org"]  # Add trusted domains

@router.get("/proxy")
async def proxy_request(url: str, request: Request):
    decoded_url = unquote(url)  # Decode the URL
    
    # Basic URL validation
    if not decoded_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid URL format")

    # OPTIONAL: Restrict proxying to specific domains
    parsed_url = urlparse(decoded_url)
    if parsed_url.netloc not in ALLOWED_DOMAINS:
        raise HTTPException(status_code=403, detail="Domain not allowed")

    # Manually create a redirect response with the Referer header
    response = Response(
        status_code=307,  # Temporary redirect (preserves method & body)
        headers={
            "Location": decoded_url,
            "Referer": "https://www.imsnsit.org/imsnsit/notifications.php"
        }
    )
    return response

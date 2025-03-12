from fastapi import APIRouter, Request, HTTPException, Response
from urllib.parse import urlparse, unquote

router = APIRouter()

@router.get("/proxy")
async def proxy_request(url: str, request: Request):
    decoded_url = unquote(url)  # Decode the URL
    
    # Basic URL validation
    if not decoded_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid URL format")

    # OPTIONAL: Restrict proxying to specific domains
    parsed_url = urlparse(decoded_url)

    # Manually create a redirect response with the Referer header
    response = Response(
        status_code=307,  # Temporary redirect (preserves method & body)
        headers={
            "Location": decoded_url,
            "Referer": "https://www.imsnsit.org/imsnsit/notifications.php"
        }
    )
    return response

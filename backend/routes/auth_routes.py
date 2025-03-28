from fastapi import APIRouter, Response, Request
from controllers.auth_controller import login_user, logout_user, get_current_user

router = APIRouter()

@router.post("/login")
async def google_login(response: Response, request: Request, data: dict ):
    return await login_user(request, response)

@router.post("/logout")
async def logout(response: Response):
    return await logout_user(response)

@router.get("/getUser")
async def get_user(request: Request):
    return await get_current_user(request)

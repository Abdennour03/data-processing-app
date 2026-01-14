from fastapi import FastAPI
from backend.controllers.upload_controller import router as upload_router

app = FastAPI()

app.include_router(upload_router)


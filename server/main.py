#!/usr/bin/env python3

import random

from fastapi import FastAPI, HTTPException, Request

app = FastAPI()
@app.post("/api/login")
async def login(request: Request):
    form = await request.json()
    if random.randint(0, 1) == 0:
        raise HTTPException(status_code=400, detail="I don't think so pal")
    return { "ok": True }

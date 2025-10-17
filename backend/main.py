from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from model import get_model_response
from database import SessionLocal, User, Chat, Base, engine, get_db
from auth import hash_password, verify_password, create_access_token, decode_token

# Cria tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Multiversal - Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

class Message(BaseModel):
    prompt: str

@app.post('/register')
def register(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == form.username).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")
    user = User(username=form.username, password=hash_password(form.password))
    db.add(user)
    db.commit()
    return {"message": "Usuário registrado com sucesso"}

@app.post('/login')
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form.username).first()
    if not user or not verify_password(form.password, user.password):
        raise HTTPException(status_code=400, detail="Credenciais inválidas")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.post('/ask')
def ask(msg: Message, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    username = decode_token(token)
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário inválido")
    print(f"[ASK] {user.username}: {msg.prompt}")
    resposta = get_model_response(msg.prompt)
    chat = Chat(prompt=msg.prompt, response=resposta, user_id=user.id)
    db.add(chat)
    db.commit()
    print(f"[RESPONSE] {user.username}: {resposta}")
    return {"response": resposta}

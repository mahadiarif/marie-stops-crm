from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import models, database, auth

app = FastAPI(title="Marie Stopes CRM API")

# Pydantic models for auth
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "staff"  # default role

class LoginResponse(BaseModel):
    access_token: str
    user_id: int
    username: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
models.Base.metadata.create_all(bind=database.engine)

# AUTH ENDPOINTS
@app.post("/auth/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(database.get_db)):
    """User login endpoint"""
    user = db.query(models.User).filter(models.User.username == credentials.username).first()

    if not user or not auth.verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive"
        )

    access_token = auth.create_access_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "user_id": user.id,
        "username": user.username,
        "role": user.role
    }

@app.post("/auth/register", response_model=UserResponse)
def register(
    req: RegisterRequest,
    current_user: models.User = Depends(auth.require_role("admin", "manager")),
    db: Session = Depends(database.get_db)
):
    """Register new user (Admin/Manager only)"""
    # Check if user already exists
    existing_user = db.query(models.User).filter(
        (models.User.username == req.username) | (models.User.email == req.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    # Validate role
    if req.role not in ["admin", "manager", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be admin, manager, or staff"
        )

    # Create new user
    new_user = models.User(
        username=req.username,
        email=req.email,
        password_hash=auth.hash_password(req.password),
        role=req.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.get("/auth/me", response_model=UserResponse)
def get_current_user(current_user: models.User = Depends(auth.verify_token)):
    """Get current logged-in user info"""
    return current_user

@app.get("/users", response_model=List[UserResponse])
def list_users(
    current_user: models.User = Depends(auth.require_role("admin", "manager")),
    db: Session = Depends(database.get_db)
):
    """List all users (Admin/Manager only)"""
    users = db.query(models.User).all()
    return users

@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: dict,
    current_user: models.User = Depends(auth.require_role("admin", "manager")),
    db: Session = Depends(database.get_db)
):
    """Update user (Admin/Manager only)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Allow updating email, role, and is_active
    if "email" in user_data:
        db_user.email = user_data["email"]
    if "role" in user_data:
        db_user.role = user_data["role"]
    if "is_active" in user_data:
        db_user.is_active = user_data["is_active"]

    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: models.User = Depends(auth.require_role("admin")),
    db: Session = Depends(database.get_db)
):
    """Delete user (Admin only)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()

    return {"message": "User deleted"}

@app.get("/")
def read_root():
    return {"message": "Marie Stopes CRM API is running"}

# SETTINGS ENDPOINTS
@app.get("/settings", response_model=List[dict])
def get_settings(
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    settings = db.query(models.Setting).all()
    return [{"id": s.id, "category": s.category, "value": s.value} for s in settings]

@app.post("/settings")
def add_setting(
    category: str,
    value: str,
    current_user: models.User = Depends(auth.require_role("admin")),
    db: Session = Depends(database.get_db)
):
    db_setting = models.Setting(category=category, value=value)
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

@app.delete("/settings/{setting_id}")
def delete_setting(
    setting_id: int,
    current_user: models.User = Depends(auth.require_role("admin")),
    db: Session = Depends(database.get_db)
):
    setting = db.query(models.Setting).filter(models.Setting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    db.delete(setting)
    db.commit()
    return {"message": "Setting deleted"}

# APPOINTMENTS ENDPOINTS
@app.get("/appointments")
def get_appointments(
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    appointments = db.query(models.Appointment).all()
    result = []
    for a in appointments:
        client = db.query(models.Client).filter(models.Client.id == a.client_id).first()
        result.append({
            "id": a.id,
            "client_id": a.client_id,
            "client_name": client.name if client else "Unknown",
            "client_phone": client.phone if client else "N/A",
            "clinic": a.clinic,
            "reason": a.reason,
            "visit_date": a.visit_date,
            "remarks": a.remarks,
            "referral_fee": a.referral_fee,
            "reconfirmation": a.reconfirmation,
            "unsafe_to_call": a.unsafe_to_call,
            "visit_status_clinic": a.visit_status_clinic,
            "followup_status_cc": a.followup_status_cc,
            "generated_from": a.generated_from,
            "ref_id": a.ref_id
        })
    return result

@app.post("/appointments")
def create_appointment(
    appointment_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    db_appt = models.Appointment(**appointment_data)
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    return db_appt

@app.put("/appointments/{appointment_id}")
def update_appointment(
    appointment_id: int,
    appointment_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    db_appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for key, value in appointment_data.items():
        setattr(db_appt, key, value)
    db.commit()
    db.refresh(db_appt)
    return db_appt

@app.delete("/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    current_user: models.User = Depends(auth.can_delete),
    db: Session = Depends(database.get_db)
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted"}

# CLIENTS ENDPOINTS
@app.get("/clients")
def get_clients(
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Client).all()

@app.post("/clients")
def create_client(
    client_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    db_client = models.Client(**client_data)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.put("/clients/{client_id}")
def update_client(
    client_id: int,
    client_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    for key, value in client_data.items():
        setattr(db_client, key, value)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.delete("/clients/{client_id}")
def delete_client(
    client_id: int,
    current_user: models.User = Depends(auth.can_delete),
    db: Session = Depends(database.get_db)
):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(db_client)
    db.commit()
    return {"message": "Client deleted"}

# CALL LOGS ENDPOINTS
@app.get("/call-logs")
def get_call_logs(
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    return db.query(models.CallLog).all()

@app.post("/call-logs")
def create_call_log(
    log_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    db_log = models.CallLog(**log_data)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.put("/call-logs/{log_id}")
def update_call_log(
    log_id: int,
    log_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    db_log = db.query(models.CallLog).filter(models.CallLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Call log not found")
    for key, value in log_data.items():
        setattr(db_log, key, value)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.delete("/call-logs/{log_id}")
def delete_call_log(
    log_id: int,
    current_user: models.User = Depends(auth.can_delete),
    db: Session = Depends(database.get_db)
):
    db_log = db.query(models.CallLog).filter(models.CallLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Call log not found")
    db.delete(db_log)
    db.commit()
    return {"message": "Call log deleted"}

# WAIVERS ENDPOINTS
@app.get("/waivers")
def get_waivers(
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Waiver).all()

@app.post("/waivers")
def create_waiver(
    waiver_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    db_waiver = models.Waiver(**waiver_data)
    db.add(db_waiver)
    db.commit()
    db.refresh(db_waiver)
    return db_waiver

@app.put("/waivers/{waiver_id}")
def update_waiver_endpoint(
    waiver_id: int,
    waiver_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    db_waiver = db.query(models.Waiver).filter(models.Waiver.id == waiver_id).first()
    if not db_waiver:
        raise HTTPException(status_code=404, detail="Waiver not found")
    for key, value in waiver_data.items():
        setattr(db_waiver, key, value)
    db.commit()
    db.refresh(db_waiver)
    return db_waiver

@app.delete("/waivers/{waiver_id}")
def delete_waiver(
    waiver_id: int,
    current_user: models.User = Depends(auth.can_delete),
    db: Session = Depends(database.get_db)
):
    waiver = db.query(models.Waiver).filter(models.Waiver.id == waiver_id).first()
    if not waiver:
        raise HTTPException(status_code=404, detail="Waiver not found")
    db.delete(waiver)
    db.commit()
    return {"message": "Waiver deleted"}

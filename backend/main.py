from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import models, database, auth
import datetime

app = FastAPI(title="Marie Stopes CRM API")

# Pydantic models for auth
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "staff"
    assigned_clinic: str | None = None

class LoginResponse(BaseModel):
    access_token: str
    user_id: int
    username: str
    role: str
    assigned_clinic: str | None = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    assigned_clinic: str | None = None

    class Config:
        from_attributes = True

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
models.Base.metadata.create_all(bind=database.engine)

# Run migrations for new columns
def run_migrations():
    from sqlalchemy import text
    with database.engine.connect() as conn:
        for table, col in [
            ("appointments", "created_by_user_id INTEGER"),
            ("call_logs",    "created_by_user_id INTEGER"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col}"))
                conn.commit()
            except Exception:
                pass  # Column already exists

run_migrations()

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
        "role": user.role,
        "assigned_clinic": user.assigned_clinic
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
    if req.role not in ["admin", "manager", "staff", "clinic"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be admin, manager, staff, or clinic"
        )

    # Create new user
    new_user = models.User(
        username=req.username,
        email=req.email,
        password_hash=auth.hash_password(req.password),
        role=req.role,
        assigned_clinic=req.assigned_clinic
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

    if "email" in user_data:
        db_user.email = user_data["email"]
    if "role" in user_data:
        db_user.role = user_data["role"]
    if "is_active" in user_data:
        db_user.is_active = user_data["is_active"]
    if "assigned_clinic" in user_data:
        db_user.assigned_clinic = user_data["assigned_clinic"]

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
    query = db.query(models.Appointment)
    if current_user.role == models.RoleEnum.clinic and current_user.assigned_clinic:
        query = query.filter(models.Appointment.clinic == current_user.assigned_clinic)
    elif current_user.role == models.RoleEnum.staff:
        query = query.filter(models.Appointment.created_by_user_id == current_user.id)
    appointments = query.all()
    result = []
    for a in appointments:
        client = db.query(models.Client).filter(models.Client.id == a.client_id).first()
        result.append({
            "id": a.id,
            "client_id": a.client_id,
            "client_name": client.name if client else "Unknown",
            "client_phone": client.phone if client else "N/A",
            "age": client.age if client else "",
            "address": client.address if client else "",
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
            "ref_id": a.ref_id,
            "agent_name": a.agent_name,
            "source_name": a.source_name,
            "source_phone": a.source_phone,
            "ngo": a.ngo,
            "added_by": a.added_by,
            "enumerator": a.enumerator,
            "source_remarks": a.source_remarks,
            "alt_phone": a.alt_phone,
            "followup_preference": a.followup_preference,
            "spending_amount": a.spending_amount or 0
        })
    return result

def _validate_appointment_refs(appointment_data: dict, db: Session):
    clinic = appointment_data.get("clinic")
    if clinic:
        exists = db.query(models.Setting).filter(
            models.Setting.category == "clinic",
            models.Setting.value == clinic
        ).first()
        if not exists:
            raise HTTPException(status_code=400, detail=f"Clinic '{clinic}' not found")

    agent = appointment_data.get("agent_name")
    if agent:
        exists = db.query(models.Setting).filter(
            models.Setting.category == "agentName",
            models.Setting.value == agent
        ).first()
        if not exists:
            raise HTTPException(status_code=400, detail=f"Agent '{agent}' not found")


@app.post("/appointments")
def create_appointment(
    appointment_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    _validate_appointment_refs(appointment_data, db)

    # Extract client data
    client_name = appointment_data.pop("client_name", None)
    client_phone = appointment_data.pop("client_phone", None)
    age = appointment_data.pop("age", None)
    address = appointment_data.pop("address", None)

    # Find or create client
    client = None
    if client_phone:
        client = db.query(models.Client).filter(models.Client.phone == client_phone).first()
    
    if not client:
        client = models.Client(
            name=client_name, 
            phone=client_phone, 
            age=int(age) if age else 0, 
            address=address
        )
        db.add(client)
        db.commit()
        db.refresh(client)
    else:
        if client_name: client.name = client_name
        if age is not None: client.age = int(age) if age else 0
        if address: client.address = address
        db.commit()

    # Parse visit_date
    if "visit_date" in appointment_data and isinstance(appointment_data["visit_date"], str):
        try:
            # Handle ISO format from frontend
            dt_str = appointment_data["visit_date"].replace('Z', '')
            appointment_data["visit_date"] = datetime.datetime.fromisoformat(dt_str)
        except Exception as e:
            print(f"Date parse error: {e}")
            appointment_data["visit_date"] = datetime.datetime.utcnow()

    # Filter only valid fields for the model
    valid_fields = {k: v for k, v in appointment_data.items() if hasattr(models.Appointment, k)}
    valid_fields["client_id"] = client.id
    valid_fields["created_by_user_id"] = current_user.id

    db_appt = models.Appointment(**valid_fields)
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

    if current_user.role != models.RoleEnum.clinic:
        _validate_appointment_refs(appointment_data, db)

    # Extract client data
    client_name = appointment_data.pop("client_name", None)
    client_phone = appointment_data.pop("client_phone", None)
    age = appointment_data.pop("age", None)
    address = appointment_data.pop("address", None)

    # Update client if exists
    if db_appt.client_id:
        client = db.query(models.Client).filter(models.Client.id == db_appt.client_id).first()
        if client:
            if client_name: client.name = client_name
            if client_phone: client.phone = client_phone
            if age: client.age = age
            if address: client.address = address
            db.commit()

    # Clinic role can only update 3 fields
    if current_user.role == models.RoleEnum.clinic:
        allowed = {"visit_status_clinic", "followup_status_cc", "spending_amount"}
        appointment_data = {k: v for k, v in appointment_data.items() if k in allowed}

    for key, value in appointment_data.items():
        if hasattr(db_appt, key):
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
    query = db.query(models.CallLog)
    if current_user.role == models.RoleEnum.staff:
        query = query.filter(models.CallLog.created_by_user_id == current_user.id)
    return query.all()

@app.post("/call-logs")
def create_call_log(
    log_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    log_data["created_by_user_id"] = current_user.id
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
    query = db.query(models.Waiver)
    if current_user.role == models.RoleEnum.clinic and current_user.assigned_clinic:
        query = query.filter(models.Waiver.center == current_user.assigned_clinic)
    return query.all()

@app.post("/waivers")
def create_waiver(
    waiver_data: dict,
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    center = waiver_data.get("center")
    if center:
        exists = db.query(models.ClinicCenter).filter(models.ClinicCenter.name == center).first()
        if not exists:
            raise HTTPException(status_code=400, detail=f"Clinic center '{center}' not found")

    # Parse date
    if "date" in waiver_data and isinstance(waiver_data["date"], str):
        try:
            dt_str = waiver_data["date"].replace('Z', '')
            if 'T' in dt_str:
                waiver_data["date"] = datetime.datetime.fromisoformat(dt_str)
            else:
                waiver_data["date"] = datetime.datetime.strptime(dt_str, "%Y-%m-%d")
        except:
            waiver_data["date"] = datetime.datetime.utcnow()

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

# CLINIC CENTERS ENDPOINTS
@app.get("/clinic-centers")
def get_clinic_centers(
    current_user: models.User = Depends(auth.verify_token),
    db: Session = Depends(database.get_db)
):
    centers = db.query(models.ClinicCenter).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "address": c.address,
            "phone": c.phone,
            "district": c.district,
            "center_type": c.center_type,
            "contact_person": c.contact_person,
        }
        for c in centers
    ]

@app.post("/clinic-centers")
def create_clinic_center(
    data: dict,
    current_user: models.User = Depends(auth.require_role("admin", "manager")),
    db: Session = Depends(database.get_db)
):
    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Clinic name is required")

    existing = db.query(models.ClinicCenter).filter(models.ClinicCenter.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Clinic with this name already exists")

    # Create clinic center record
    center = models.ClinicCenter(
        name=name,
        address=data.get("address", ""),
        phone=data.get("phone", ""),
        district=data.get("district", ""),
        center_type=data.get("center_type", ""),
        contact_person=data.get("contact_person", ""),
    )
    db.add(center)

    # Add to settings if not already present
    existing_setting = db.query(models.Setting).filter(
        models.Setting.category == "clinic",
        models.Setting.value == name
    ).first()
    if not existing_setting:
        db.add(models.Setting(category="clinic", value=name))

    # Create user account if credentials provided
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    created_user = None
    if username and password:
        existing_user = db.query(models.User).filter(models.User.username == username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail=f"Username '{username}' already taken")
        new_user = models.User(
            username=username,
            email=data.get("email", f"{username}@mariestopes.org"),
            password_hash=auth.hash_password(password),
            role="clinic",
            is_active=True,
            assigned_clinic=name,
        )
        db.add(new_user)
        created_user = username

    db.commit()
    db.refresh(center)
    return {
        "id": center.id,
        "name": center.name,
        "address": center.address,
        "phone": center.phone,
        "district": center.district,
        "center_type": center.center_type,
        "contact_person": center.contact_person,
        "user_created": created_user,
    }

@app.put("/clinic-centers/{center_id}")
def update_clinic_center(
    center_id: int,
    data: dict,
    current_user: models.User = Depends(auth.require_role("admin", "manager")),
    db: Session = Depends(database.get_db)
):
    center = db.query(models.ClinicCenter).filter(models.ClinicCenter.id == center_id).first()
    if not center:
        raise HTTPException(status_code=404, detail="Clinic not found")
    for field in ["address", "phone", "district", "center_type", "contact_person"]:
        if field in data:
            setattr(center, field, data[field])
    db.commit()
    db.refresh(center)
    return {"id": center.id, "name": center.name, "address": center.address,
            "phone": center.phone, "district": center.district,
            "center_type": center.center_type, "contact_person": center.contact_person}

# ADMIN IMPERSONATE CLINIC
@app.post("/auth/impersonate/{user_id}")
def impersonate_user(
    user_id: int,
    current_user: models.User = Depends(auth.require_role("admin")),
    db: Session = Depends(database.get_db)
):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.role != "clinic":
        raise HTTPException(status_code=403, detail="Can only impersonate clinic users")
    token = auth.create_access_token(data={"sub": target.username})
    return {
        "access_token": token,
        "user_id": target.id,
        "username": target.username,
        "role": target.role,
        "assigned_clinic": target.assigned_clinic,
    }

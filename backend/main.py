from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, database

app = FastAPI(title="Marie Stopes CRM API")

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

@app.get("/")
def read_root():
    return {"message": "Marie Stopes CRM API is running"}

# SETTINGS ENDPOINTS
@app.get("/settings", response_model=List[dict])
def get_settings(db: Session = Depends(database.get_db)):
    settings = db.query(models.Setting).all()
    return [{"id": s.id, "category": s.category, "value": s.value} for s in settings]

@app.post("/settings")
def add_setting(category: str, value: str, db: Session = Depends(database.get_db)):
    db_setting = models.Setting(category=category, value=value)
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

@app.delete("/settings/{setting_id}")
def delete_setting(setting_id: int, db: Session = Depends(database.get_db)):
    setting = db.query(models.Setting).filter(models.Setting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    db.delete(setting)
    db.commit()
    return {"message": "Setting deleted"}

# APPOINTMENTS ENDPOINTS
@app.get("/appointments")
def get_appointments(db: Session = Depends(database.get_db)):
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
def create_appointment(appointment_data: dict, db: Session = Depends(database.get_db)):
    db_appt = models.Appointment(**appointment_data)
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    return db_appt

@app.put("/appointments/{appointment_id}")
def update_appointment(appointment_id: int, appointment_data: dict, db: Session = Depends(database.get_db)):
    db_appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for key, value in appointment_data.items():
        setattr(db_appt, key, value)
    db.commit()
    db.refresh(db_appt)
    return db_appt

@app.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(database.get_db)):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted"}

# CLIENTS ENDPOINTS
@app.get("/clients")
def get_clients(db: Session = Depends(database.get_db)):
    return db.query(models.Client).all()

@app.post("/clients")
def create_client(client_data: dict, db: Session = Depends(database.get_db)):
    db_client = models.Client(**client_data)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.put("/clients/{client_id}")
def update_client(client_id: int, client_data: dict, db: Session = Depends(database.get_db)):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    for key, value in client_data.items():
        setattr(db_client, key, value)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.delete("/clients/{client_id}")
def delete_client(client_id: int, db: Session = Depends(database.get_db)):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(db_client)
    db.commit()
    return {"message": "Client deleted"}

# CALL LOGS ENDPOINTS
@app.get("/call-logs")
def get_call_logs(db: Session = Depends(database.get_db)):
    return db.query(models.CallLog).all()

@app.post("/call-logs")
def create_call_log(log_data: dict, db: Session = Depends(database.get_db)):
    db_log = models.CallLog(**log_data)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.put("/call-logs/{log_id}")
def update_call_log(log_id: int, log_data: dict, db: Session = Depends(database.get_db)):
    db_log = db.query(models.CallLog).filter(models.CallLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Call log not found")
    for key, value in log_data.items():
        setattr(db_log, key, value)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.delete("/call-logs/{log_id}")
def delete_call_log(log_id: int, db: Session = Depends(database.get_db)):
    db_log = db.query(models.CallLog).filter(models.CallLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Call log not found")
    db.delete(db_log)
    db.commit()
    return {"message": "Call log deleted"}

# WAIVERS ENDPOINTS
@app.get("/waivers")
def get_waivers(db: Session = Depends(database.get_db)):
    return db.query(models.Waiver).all()

@app.post("/waivers")
def create_waiver(waiver_data: dict, db: Session = Depends(database.get_db)):
    db_waiver = models.Waiver(**waiver_data)
    db.add(db_waiver)
    db.commit()
    db.refresh(db_waiver)
    return db_waiver

@app.put("/waivers/{waiver_id}")
def update_waiver_endpoint(waiver_id: int, waiver_data: dict, db: Session = Depends(database.get_db)):
    db_waiver = db.query(models.Waiver).filter(models.Waiver.id == waiver_id).first()
    if not db_waiver:
        raise HTTPException(status_code=404, detail="Waiver not found")
    for key, value in waiver_data.items():
        setattr(db_waiver, key, value)
    db.commit()
    db.refresh(db_waiver)
    return db_waiver

@app.delete("/waivers/{waiver_id}")
def delete_waiver(waiver_id: int, db: Session = Depends(database.get_db)):
    waiver = db.query(models.Waiver).filter(models.Waiver.id == waiver_id).first()
    if not waiver:
        raise HTTPException(status_code=404, detail="Waiver not found")
    db.delete(waiver)
    db.commit()
    return {"message": "Waiver deleted"}

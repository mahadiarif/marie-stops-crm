from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, index=True)
    age = Column(Integer)
    address = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    clinic = Column(String)
    reason = Column(String)
    visit_date = Column(DateTime)
    remarks = Column(Text)
    referral_fee = Column(String)
    reconfirmation = Column(String)
    unsafe_to_call = Column(Boolean, default=False)
    visit_status_clinic = Column(String)
    followup_status_cc = Column(String)
    generated_from = Column(String)
    ref_id = Column(String)
    
    client = relationship("Client")

class CallLog(Base):
    __tablename__ = "call_logs"
    id = Column(Integer, primary_key=True, index=True)
    caller_name = Column(String)
    phone = Column(String)
    call_date = Column(DateTime)
    caller_type = Column(String)
    reason = Column(String)
    district = Column(String)
    division = Column(String)
    duration = Column(String)
    status = Column(String)
    notes = Column(Text)

class Setting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String) # clinic, ngo, reason, etc.
    value = Column(String)

class Waiver(Base):
    __tablename__ = "waivers"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime)
    center = Column(String)
    client_id_code = Column(String) # e.g. DWC-ae-0001
    first_name = Column(String)
    service = Column(String)
    total_price = Column(Integer)
    waiver_amount = Column(Integer)
    paid_amount = Column(Integer)
    waiver_code = Column(String)
    remarks = Column(Text)

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    staff = "staff"
    clinic = "clinic"

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
    client_name = Column(String)
    client_phone = Column(String)
    age = Column(String)
    address = Column(Text)
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
    
    # Missing fields for full appointment details
    agent_name = Column(String)
    source_name = Column(String)
    source_phone = Column(String)
    ngo = Column(String)
    added_by = Column(String)
    enumerator = Column(String)
    source_remarks = Column(Text)
    alt_phone = Column(String)
    followup_preference = Column(String)
    spending_amount = Column(Integer, default=0)
    created_by_user_id = Column(Integer, nullable=True)

    client = relationship("Client")

class CallLog(Base):
    __tablename__ = "call_logs"
    id = Column(Integer, primary_key=True, index=True)
    call_date = Column(DateTime, default=datetime.datetime.utcnow)
    caller_name = Column(String)
    source_of_number = Column(String)
    age = Column(Integer)
    caller_type = Column(String)
    language = Column(String, default="Bangla")
    is_repeat_caller = Column(String)
    hear_about_us = Column(String)
    reason_for_calling = Column(Text) # Multiple values joined or JSON
    detailed_reasons = Column(Text) # Detailed sub-reasons
    district = Column(String)
    division = Column(String)
    living_area = Column(String)
    end_pregnancy_tried = Column(String)
    purchased_mrm = Column(String)
    mrm_medicine_name = Column(String)
    medicine_taken = Column(String)
    referred_status = Column(String)
    followup_preference = Column(String)
    phone = Column(String)
    duration = Column(String)
    status = Column(String, default="Pending")
    notes = Column(Text)
    created_by_user_id = Column(Integer, nullable=True)

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

class ClinicCenter(Base):
    __tablename__ = "clinic_centers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    address = Column(Text)
    phone = Column(String)
    district = Column(String)
    center_type = Column(String)
    contact_person = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.staff)
    is_active = Column(Boolean, default=True)
    assigned_clinic = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

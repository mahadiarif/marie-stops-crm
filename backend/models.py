from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from database import Base
import datetime
import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    staff = "staff"
    clinic = "clinic"

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(255))
    client_phone = Column(String(50))
    age = Column(String(20))
    address = Column(Text)
    clinic = Column(String(255))
    reason = Column(String(255))
    visit_date = Column(DateTime)
    remarks = Column(Text)
    referral_fee = Column(String(50))
    reconfirmation = Column(String(100))
    unsafe_to_call = Column(Boolean, default=False)
    visit_status_clinic = Column(String(100))
    followup_status_cc = Column(String(100))
    generated_from = Column(String(100))
    ref_id = Column(String(100))
    agent_name = Column(String(255))
    source_name = Column(String(255))
    source_phone = Column(String(50))
    ngo = Column(String(255))
    added_by = Column(String(255))
    enumerator = Column(String(255))
    source_remarks = Column(Text)
    alt_phone = Column(String(50))
    followup_preference = Column(String(100))
    spending_amount = Column(Integer, default=0)
    created_by_user_id = Column(Integer, nullable=True)

class AppointmentVisit(Base):
    __tablename__ = "appointment_visits"
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, nullable=False, index=True)
    clinic = Column(String(255))
    visit_date = Column(DateTime)
    remarks = Column(Text)
    referral_fee = Column(String(50))
    reconfirmation = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Setting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100))
    value = Column(Text)

class Waiver(Base):
    __tablename__ = "waivers"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime)
    center = Column(String(255))
    client_id_code = Column(String(100))
    discount_client_id = Column(String(100))
    first_name = Column(String(255))
    service = Column(String(255))
    total_price = Column(Integer)
    waiver_amount = Column(Integer)
    paid_amount = Column(Integer)
    waiver_code = Column(String(100))
    remarks = Column(Text)

class ClinicCenter(Base):
    __tablename__ = "clinic_centers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    address = Column(Text)
    phone = Column(String(50))
    district = Column(String(100))
    center_type = Column(String(100))
    contact_person = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(Enum(RoleEnum), default=RoleEnum.staff)
    is_active = Column(Boolean, default=True)
    assigned_clinic = Column(String(255), nullable=True)
    agent_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

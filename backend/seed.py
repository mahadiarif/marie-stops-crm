import datetime
from database import engine, SessionLocal, Base
import models
import auth

def seed_data():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    now = datetime.datetime.utcnow

    try:
        # ── Settings ──
        existing_settings = db.query(models.Setting).count()
        if existing_settings == 0:
            print("Seeding settings...")
            settings_data = [
                ('clinic', "Premium Dhanmondi"),
                ('clinic', "Premium Mirpur-10"),
                ('clinic', "Bogura RC Centre"),
                ('clinic', "Gazipur Maternity"),
                ('clinic', "Dhanmondi Women's Clinic"),
                ('clinic', "Narayanganj Clinic"),
                ('clinic', "Chattogram Centre"),
                ('clinic', "Sylhet Clinic"),
                ('clinic', "Rangpur"),
                ('ngo', "MSI Bangladesh"),
                ('ngo', "Family Planning Assoc."),
                ('ngo', "BRAC Health"),
                ('ngo', "Pathfinder International"),
                ('ngo', "Marie Stopes"),
                ('reason', "Family Planning"),
                ('reason', "Maternal Health"),
                ('reason', "General Health"),
                ('reason', "Adolescent Care"),
                ('reason', "MR / PAC"),
                ('reason', "Reproductive Health"),
                ('reason', "ANC"),
                ('reason', "PNC"),
                ('agentName', "Zeba Akter"),
                ('agentName', "Farhana Islam"),
                ('agentName', "Riya Ahmed"),
                ('agentName', "Nasrin Sultana"),
                ('agentName', "Mitu Begum"),
                ('visitStatus', "Visited"),
                ('visitStatus', "No Show"),
                ('visitStatus', "Cancelled"),
                ('visitStatus', "Rescheduled"),
                ('followupStatus', "Pending"),
                ('followupStatus', "Completed"),
                ('followupStatus', "Not Reachable"),
                ('followupStatus', "Appointment Set"),
                ('waiverService', "MR"),
                ('waiverService', "PAC"),
                ('waiverService', "ANC"),
                ('waiverService', "PNC"),
                ('waiverService', "Family Planning"),
                ('waiverService', "Normal Delivery"),
                ('waiverService', "C-Section"),
                ('waiverService', "Implant"),
                ('waiverService', "IUD"),
            ]
            for cat, val in settings_data:
                db.add(models.Setting(category=cat, value=val))
            db.commit()
        else:
            print("Settings already exist, skipping...")

        # ── Users ──
        print("Seeding users...")
        user_data = [
            ("admin",   "admin@mariestopes.org",   "admin123",   "admin",   None,                   None),
            ("manager", "manager@mariestopes.org", "manager123", "manager", None,                   None),
            ("zeba",    "zeba@mariestopes.org",    "staff123",   "staff",   None,                   "Zeba Akter"),
            ("farhana", "farhana@mariestopes.org", "staff123",   "staff",   None,                   "Farhana Islam"),
            ("riya",    "riya@mariestopes.org",    "staff123",   "staff",   None,                   "Riya Ahmed"),
            ("clinic1", "clinic1@mariestopes.org", "clinic123",  "clinic",  "Premium Dhanmondi",    None),
            ("clinic2", "clinic2@mariestopes.org", "clinic123",  "clinic",  "Premium Mirpur-10",    None),
            ("clinic3", "clinic3@mariestopes.org", "clinic123",  "clinic",  "Chattogram Centre",    None),
        ]
        for username, email, password, role, assigned_clinic, agent_name in user_data:
            existing = db.query(models.User).filter(models.User.username == username).first()
            if not existing:
                db.add(models.User(
                    username=username, email=email,
                    password_hash=auth.hash_password(password),
                    role=role, is_active=True,
                    assigned_clinic=assigned_clinic,
                    agent_name=agent_name
                ))
                print(f"  Created user: {username} / {password}")
            else:
                print(f"  User {username} already exists, skipping...")
        db.commit()

        # ── Appointments ──
        existing_appts = db.query(models.Appointment).count()
        if existing_appts == 0:
            print("Seeding appointments...")
            appts = [
                models.Appointment(
                    client_name="Nusrat Jahan", client_phone="01712345678",
                    age="28", address="Mirpur-1, Dhaka", clinic="Premium Dhanmondi",
                    reason="Family Planning", visit_date=now() - datetime.timedelta(days=2),
                    remarks="Follow-up visit for implant check",
                    ref_id="REF-2025-001", agent_name="Zeba Akter",
                    generated_from="Direct", alt_phone="01555111222",
                    unsafe_to_call=False, followup_preference="Call Only",
                    visit_status_clinic="Visited", followup_status_cc="Completed",
                    spending_amount=2500, source_name="", source_phone="",
                    ngo="", source_remarks=""
                ),
                models.Appointment(
                    client_name="Farhana Islam", client_phone="01811223344",
                    age="32", address="Dhanmondi 32, Dhaka", clinic="Premium Mirpur-10",
                    reason="Maternal Health", visit_date=now() - datetime.timedelta(days=1),
                    remarks="First ANC visit",
                    ref_id="REF-2025-002", agent_name="Farhana Islam",
                    generated_from="Referral", ngo="MSI Bangladesh",
                    source_name="Health Post A", source_phone="01733223344",
                    alt_phone="01999111222",
                    unsafe_to_call=False, followup_preference="Call & SMS",
                    visit_status_clinic="Visited", followup_status_cc="Pending",
                    spending_amount=3200, source_remarks="Referred by community health worker"
                ),
                models.Appointment(
                    client_name="Sabina Yasmin", client_phone="01911223344",
                    age="25", address="Uttara Sector 7, Dhaka", clinic="Dhanmondi Women's Clinic",
                    reason="MR / PAC", visit_date=now() - datetime.timedelta(days=5),
                    remarks="Post-procedure followup needed",
                    ref_id="REF-2025-003", agent_name="Riya Ahmed",
                    generated_from="Direct", alt_phone="01877334455",
                    unsafe_to_call=False, followup_preference="SMS Only",
                    visit_status_clinic="Visited", followup_status_cc="Completed",
                    spending_amount=4800, source_name="", source_phone="",
                    ngo="", source_remarks=""
                ),
                models.Appointment(
                    client_name="Runa Laila", client_phone="01611223344",
                    age="40", address="Gulshan 2, Dhaka", clinic="Chattogram Centre",
                    reason="Reproductive Health", visit_date=now() + datetime.timedelta(days=3),
                    remarks="IUD removal appointment",
                    ref_id="REF-2025-004", agent_name="Nasrin Sultana",
                    generated_from="Direct", alt_phone="01600112233",
                    unsafe_to_call=False, followup_preference="Call Only",
                    visit_status_clinic="", followup_status_cc="Pending",
                    spending_amount=0, source_name="", source_phone="",
                    ngo="", source_remarks=""
                ),
                models.Appointment(
                    client_name="Tania Akter", client_phone="01755667788",
                    age="29", address="Mohammadpur, Dhaka", clinic="Premium Dhanmondi",
                    reason="Family Planning", visit_date=now() - datetime.timedelta(days=9),
                    remarks="Injectable contraceptive",
                    ref_id="REF-2025-005", agent_name="Mitu Begum",
                    generated_from="Referral", ngo="Family Planning Assoc.",
                    source_name="NGO Outreach", source_phone="01700223344",
                    alt_phone="01755001122",
                    unsafe_to_call=False, followup_preference="Call & SMS",
                    visit_status_clinic="No Show", followup_status_cc="Not Reachable",
                    spending_amount=0, source_remarks="Missed appointment"
                ),
                models.Appointment(
                    client_name="Rekha Begum", client_phone="01622334455",
                    age="35", address="Banani, Dhaka", clinic="Premium Mirpur-10",
                    reason="ANC", visit_date=now() - datetime.timedelta(days=4),
                    remarks="Second ANC checkup",
                    ref_id="REF-2025-006", agent_name="Zeba Akter",
                    generated_from="Direct", alt_phone="",
                    unsafe_to_call=False, followup_preference="Call Only",
                    visit_status_clinic="Visited", followup_status_cc="Appointment Set",
                    spending_amount=1800, source_name="", source_phone="",
                    ngo="", source_remarks=""
                ),
                models.Appointment(
                    client_name="Moriam Khatun", client_phone="01533445566",
                    age="22", address="Demra, Dhaka", clinic="Dhanmondi Women's Clinic",
                    reason="Adolescent Care", visit_date=now() + datetime.timedelta(days=1),
                    remarks="First visit, referral from BRAC",
                    ref_id="REF-2025-007", agent_name="Farhana Islam",
                    generated_from="Referral", ngo="BRAC Health",
                    source_name="BRAC Field Office", source_phone="01944556677",
                    alt_phone="01533001122",
                    unsafe_to_call=True, followup_preference="SMS Only",
                    visit_status_clinic="", followup_status_cc="Pending",
                    spending_amount=0, source_remarks="Referred by BRAC field worker"
                ),
                models.Appointment(
                    client_name="Shirin Akter", client_phone="01844556677",
                    age="31", address="Khilkhet, Dhaka", clinic="Chattogram Centre",
                    reason="PNC", visit_date=now() - datetime.timedelta(days=12),
                    remarks="Post-natal care visit 2",
                    ref_id="REF-2025-008", agent_name="Riya Ahmed",
                    generated_from="Direct", alt_phone="01844001122",
                    unsafe_to_call=False, followup_preference="Call Only",
                    visit_status_clinic="Visited", followup_status_cc="Completed",
                    spending_amount=2200, source_name="", source_phone="",
                    ngo="", source_remarks=""
                ),
                models.Appointment(
                    client_name="Hosne Ara", client_phone="01966778899",
                    age="38", address="Lalbagh, Dhaka", clinic="Premium Dhanmondi",
                    reason="General Health", visit_date=now() - datetime.timedelta(days=6),
                    remarks="General checkup, blood pressure monitoring",
                    ref_id="REF-2025-009", agent_name="Nasrin Sultana",
                    generated_from="Direct", alt_phone="",
                    unsafe_to_call=False, followup_preference="Call & SMS",
                    visit_status_clinic="Visited", followup_status_cc="Completed",
                    spending_amount=1500, source_name="", source_phone="",
                    ngo="", source_remarks=""
                ),
                models.Appointment(
                    client_name="Dilruba Parvin", client_phone="01677889900",
                    age="27", address="Bashundhara R/A, Dhaka", clinic="Premium Mirpur-10",
                    reason="Family Planning", visit_date=now() + datetime.timedelta(days=6),
                    remarks="Implant insertion scheduled",
                    ref_id="REF-2025-010", agent_name="Zeba Akter",
                    generated_from="Referral", ngo="Pathfinder International",
                    source_name="Community Clinic B", source_phone="01611223300",
                    alt_phone="",
                    unsafe_to_call=False, followup_preference="SMS Only",
                    visit_status_clinic="", followup_status_cc="Pending",
                    spending_amount=0, source_remarks="Referred via Pathfinder network"
                ),
            ]
            db.add_all(appts)
            db.commit()
        else:
            print(f"Appointments already exist ({existing_appts}), skipping...")

        # ── Discounts (Waivers) ──
        existing_waivers = db.query(models.Waiver).count()
        if existing_waivers == 0:
            print("Seeding discounts...")
            waivers = [
                models.Waiver(
                    date=now() - datetime.timedelta(days=1),
                    center="Premium Dhanmondi", client_id_code="Dhk-0001",
                    discount_client_id="CL-2025-001",
                    first_name="Nusrat", service="ANC",
                    total_price=1200, waiver_amount=200, paid_amount=1000,
                    waiver_code="DC-87654", remarks="Antenatal care subsidy"
                ),
                models.Waiver(
                    date=now() - datetime.timedelta(days=2),
                    center="Premium Mirpur-10", client_id_code="Mir-0005",
                    discount_client_id="CL-2025-002",
                    first_name="Farhana", service="MR",
                    total_price=5000, waiver_amount=1000, paid_amount=4000,
                    waiver_code="DC-11223", remarks="Low-income patient support"
                ),
                models.Waiver(
                    date=now() - datetime.timedelta(days=3),
                    center="Chattogram Centre", client_id_code="Ctg-0009",
                    discount_client_id="CL-2025-003",
                    first_name="Zohra", service="PAC",
                    total_price=3000, waiver_amount=500, paid_amount=2500,
                    waiver_code="DC-44556", remarks="Institutional discount applied"
                ),
                models.Waiver(
                    date=now() - datetime.timedelta(days=5),
                    center="Premium Dhanmondi", client_id_code="Dhk-0012",
                    discount_client_id="CL-2025-004",
                    first_name="Tania", service="Implant",
                    total_price=8000, waiver_amount=2000, paid_amount=6000,
                    waiver_code="DC-55667", remarks="NGO referral discount"
                ),
                models.Waiver(
                    date=now() - datetime.timedelta(days=7),
                    center="Dhanmondi Women's Clinic", client_id_code="DWC-0003",
                    discount_client_id="CL-2025-005",
                    first_name="Sabina", service="IUD",
                    total_price=4500, waiver_amount=900, paid_amount=3600,
                    waiver_code="DC-66778", remarks="Community outreach discount"
                ),
            ]
            db.add_all(waivers)
            db.commit()
        else:
            print(f"Discounts already exist ({existing_waivers}), skipping...")

        # ── Clinic Centers ──
        existing_centers = db.query(models.ClinicCenter).count()
        if existing_centers == 0:
            print("Seeding clinic centers...")
            clinic_centers = [
                models.ClinicCenter(name="Premium Dhanmondi",        address="House 7, Road 5, Dhanmondi, Dhaka",   phone="02-9664478",  district="Dhaka",       center_type="Premium Centre",   contact_person="Dr. Farzana Alam"),
                models.ClinicCenter(name="Premium Mirpur-10",        address="Section 10, Block A, Mirpur, Dhaka",  phone="02-8058432",  district="Dhaka",       center_type="Premium Centre",   contact_person="Nasrin Sultana"),
                models.ClinicCenter(name="Bogura RC Centre",         address="Rangpur Road, Bogura Sadar",           phone="051-67234",   district="Bogura",      center_type="RC Centre",        contact_person="Md. Anisur Rahman"),
                models.ClinicCenter(name="Gazipur Maternity",        address="Gazipur Sadar, Gazipur",               phone="02-9801234",  district="Gazipur",     center_type="Maternity Clinic", contact_person="Dr. Sumaiya Khatun"),
                models.ClinicCenter(name="Dhanmondi Women's Clinic", address="Road 2, Dhanmondi, Dhaka",            phone="02-9660321",  district="Dhaka",       center_type="Women's Clinic",   contact_person="Riya Ahmed"),
                models.ClinicCenter(name="Narayanganj Clinic",       address="Tanbazar, Narayanganj Sadar",          phone="02-7641122",  district="Narayanganj", center_type="General Clinic",   contact_person="Dr. Habibur Rahman"),
                models.ClinicCenter(name="Chattogram Centre",        address="Nasirabad Housing, Chattogram",        phone="031-653210",  district="Chattogram",  center_type="General Clinic",   contact_person="Dr. Sumaiya Khan"),
                models.ClinicCenter(name="Sylhet Clinic",            address="Zindabazar, Sylhet Sadar",             phone="0821-712345", district="Sylhet",      center_type="General Clinic",   contact_person="Khadija Begum"),
                models.ClinicCenter(name="Rangpur",                  address="Station Road, Rangpur Sadar",          phone="0521-63210",  district="Rangpur",     center_type="General Clinic",   contact_person="Md. Rafiqul Islam"),
            ]
            db.add_all(clinic_centers)
            db.commit()
        else:
            print(f"Clinic centers already exist ({existing_centers}), skipping...")

        print("\nSeeding completed!")
        print("\nLogin credentials:")
        print("  admin   / admin123")
        print("  manager / manager123")
        print("  zeba    / staff123   (agent: Zeba Akter)")
        print("  farhana / staff123   (agent: Farhana Islam)")
        print("  riya    / staff123   (agent: Riya Ahmed)")
        print("  clinic1 / clinic123  (Premium Dhanmondi)")
        print("  clinic2 / clinic123  (Premium Mirpur-10)")
        print("  clinic3 / clinic123  (Chattogram Centre)")

    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback; traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()

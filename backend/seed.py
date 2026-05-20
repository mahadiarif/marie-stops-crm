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
        print("Seeding settings...")
        settings_data = [
            ('clinic', "Dhanmondi Women's Clinic"),
            ('clinic', "Mirpur-10 Maternity"),
            ('clinic', "Bogura RC Centre"),
            ('clinic', "Chattogram Centre"),
            ('clinic', "Premium Dhanmondi"),
            ('clinic', "Sylhet Clinic"),
            ('ngo', "MSI Bangladesh"),
            ('ngo', "Family Planning Assoc."),
            ('ngo', "BRAC Health"),
            ('ngo', "Pathfinder International"),
            ('reason', "Family Planning"),
            ('reason', "Maternal Health"),
            ('reason', "General Health"),
            ('reason', "Adolescent Care"),
            ('reason', "MR / PAC"),
            ('reason', "Reproductive Health"),
            ('agentName', "Zeba Akter"),
            ('agentName', "Farhana Islam"),
            ('agentName', "Riya Ahmed"),
            ('agentName', "Nasrin Sultana"),
            ('agentName', "Mitu Begum"),
            ('addedBy', "Field Worker"),
            ('addedBy', "Enumerator"),
            ('addedBy', "Walk-in"),
            ('addedBy', "Referred"),
            ('enumerator', "Karim Uddin"),
            ('enumerator', "Monira Khatun"),
            ('enumerator', "Rakib Hasan"),
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
        ]
        for cat, val in settings_data:
            db.add(models.Setting(category=cat, value=val))

        # ── Appointments ──
        print("Seeding appointments...")
        appointments = [
            models.Appointment(
                client_name="Nusrat Jahan", client_phone="01712345678",
                age="28", address="Mirpur-1, Dhaka", clinic="Premium Dhanmondi",
                reason="Family Planning", visit_date=now() + datetime.timedelta(days=2),
                remarks="Follow-up visit for implant check",
                referral_fee="No", reconfirmation="Okay",
                ref_id="REF-2025-001", agent_name="Zeba Akter",
                generated_from="Direct", alt_phone="01555111222",
                unsafe_to_call=False, followup_preference="Call Only",
                visit_status_clinic="Visited", followup_status_cc="Completed",
                spending_amount=2500, source_name="", source_phone="",
                ngo="", added_by="Walk-in", enumerator="Karim Uddin",
                source_remarks="Client came directly"
            ),
            models.Appointment(
                client_name="Farhana Islam", client_phone="01811223344",
                age="32", address="Dhanmondi 32, Dhaka", clinic="Mirpur-10 Maternity",
                reason="Maternal Health", visit_date=now() + datetime.timedelta(days=1),
                remarks="First ANC visit",
                referral_fee="Yes", reconfirmation="Pending",
                ref_id="REF-2025-002", agent_name="Farhana Islam",
                generated_from="Referral", ngo="MSI Bangladesh",
                added_by="Field Worker", source_name="Health Post A",
                source_phone="01733223344", alt_phone="01999111222",
                unsafe_to_call=False, followup_preference="Call & SMS",
                visit_status_clinic="Visited", followup_status_cc="Pending",
                spending_amount=3200, enumerator="Monira Khatun",
                source_remarks="Referred by community health worker"
            ),
            models.Appointment(
                client_name="Sabina Yasmin", client_phone="01911223344",
                age="25", address="Uttara Sector 7, Dhaka", clinic="Dhanmondi Women's Clinic",
                reason="MR / PAC", visit_date=now() - datetime.timedelta(days=3),
                remarks="Post-procedure followup needed",
                referral_fee="No", reconfirmation="Okay",
                ref_id="REF-2025-003", agent_name="Riya Ahmed",
                generated_from="Direct", alt_phone="01877334455",
                unsafe_to_call=False, followup_preference="SMS Only",
                visit_status_clinic="Visited", followup_status_cc="Completed",
                spending_amount=4800, source_name="", source_phone="",
                ngo="", added_by="Walk-in", enumerator="Rakib Hasan",
                source_remarks=""
            ),
            models.Appointment(
                client_name="Runa Laila", client_phone="01611223344",
                age="40", address="Gulshan 2, Dhaka", clinic="Chattogram Centre",
                reason="Reproductive Health", visit_date=now() + datetime.timedelta(days=5),
                remarks="IUD removal appointment",
                referral_fee="No", reconfirmation="Okay",
                ref_id="REF-2025-004", agent_name="Nasrin Sultana",
                generated_from="Direct", alt_phone="01600112233",
                unsafe_to_call=False, followup_preference="Call Only",
                visit_status_clinic="", followup_status_cc="Pending",
                spending_amount=0, source_name="", source_phone="",
                ngo="", added_by="Walk-in", enumerator="Karim Uddin",
                source_remarks=""
            ),
            models.Appointment(
                client_name="Tania Akter", client_phone="01755667788",
                age="29", address="Mohammadpur, Dhaka", clinic="Premium Dhanmondi",
                reason="Family Planning", visit_date=now() - datetime.timedelta(days=7),
                remarks="Injectable contraceptive",
                referral_fee="Yes", reconfirmation="Okay",
                ref_id="REF-2025-005", agent_name="Mitu Begum",
                generated_from="Referral", ngo="Family Planning Assoc.",
                added_by="Enumerator", source_name="NGO Outreach",
                source_phone="01700223344", alt_phone="01755001122",
                unsafe_to_call=False, followup_preference="Call & SMS",
                visit_status_clinic="No Show", followup_status_cc="Not Reachable",
                spending_amount=0, enumerator="Monira Khatun",
                source_remarks="Missed appointment, try rescheduling"
            ),
        ]
        db.add_all(appointments)

        # ── Waivers ──
        print("Seeding waivers...")
        waivers = [
            models.Waiver(
                date=now() - datetime.timedelta(days=1),
                center="Premium Dhanmondi", client_id_code="DWC-ae-0001",
                first_name="Nusrat", service="ANC",
                total_price=1200, waiver_amount=200, paid_amount=1000,
                waiver_code="WV-87654", remarks="Antenatal care subsidy"
            ),
            models.Waiver(
                date=now() - datetime.timedelta(days=2),
                center="Mirpur-10 Maternity", client_id_code="MIR-ae-0005",
                first_name="Farhana", service="MR",
                total_price=5000, waiver_amount=1000, paid_amount=4000,
                waiver_code="WV-11223", remarks="Low-income patient support"
            ),
            models.Waiver(
                date=now() - datetime.timedelta(days=3),
                center="Chattogram Centre", client_id_code="CTG-ae-0009",
                first_name="Zohra", service="PAC",
                total_price=3000, waiver_amount=500, paid_amount=2500,
                waiver_code="WV-44556", remarks="Institutional discount applied"
            ),
        ]
        db.add_all(waivers)

        # ── Clinic Centers ──
        print("Seeding clinic centers...")
        clinic_centers = [
            models.ClinicCenter(name="Premium Dhanmondi",       address="House 7, Road 5, Dhanmondi, Dhaka",  phone="02-9664478", district="Dhaka",      center_type="Premium Centre",   contact_person="Dr. Farzana Alam"),
            models.ClinicCenter(name="Mirpur-10 Maternity",     address="Section 10, Block A, Mirpur, Dhaka", phone="02-8058432", district="Dhaka",      center_type="Maternity Clinic", contact_person="Nasrin Sultana"),
            models.ClinicCenter(name="Bogura RC Centre",        address="Rangpur Road, Bogura Sadar",          phone="051-67234",  district="Bogura",     center_type="RC Centre",        contact_person="Md. Anisur Rahman"),
            models.ClinicCenter(name="Chattogram Centre",       address="Nasirabad Housing, Chattogram",       phone="031-653210", district="Chattogram", center_type="General Clinic",   contact_person="Dr. Sumaiya Khan"),
            models.ClinicCenter(name="Dhanmondi Women's Clinic",address="Road 2, Dhanmondi, Dhaka",           phone="02-9660321", district="Dhaka",      center_type="Women's Clinic",   contact_person="Riya Ahmed"),
            models.ClinicCenter(name="Sylhet Clinic",           address="Zindabazar, Sylhet Sadar",            phone="0821-712345",district="Sylhet",     center_type="General Clinic",   contact_person="Khadija Begum"),
        ]
        db.add_all(clinic_centers)

        # ── Users ──
        print("Seeding users...")
        user_data = [
            ("admin",   "admin@mariestopes.org",   "admin123",   "admin",   None),
            ("manager", "manager@mariestopes.org", "manager123", "manager", None),
            ("staff",   "staff@mariestopes.org",   "staff123",   "staff",   None),
            ("clinic",  "clinic@mariestopes.org",  "clinic123",  "clinic",  "Premium Dhanmondi"),
            ("clinic2", "clinic2@mariestopes.org", "clinic123",  "clinic",  "Mirpur-10 Maternity"),
        ]
        for username, email, password, role, assigned_clinic in user_data:
            existing = db.query(models.User).filter(models.User.username == username).first()
            if not existing:
                db.add(models.User(
                    username=username, email=email,
                    password_hash=auth.hash_password(password),
                    role=role, is_active=True,
                    assigned_clinic=assigned_clinic
                ))
                print(f"  Created user: {username} / {password}")
            else:
                print(f"  User {username} already exists, skipping...")

        db.commit()
        print("\nSeeding completed successfully!")
        print("\nLogin credentials:")
        print("  admin   / admin123")
        print("  manager / manager123")
        print("  staff   / staff123")
        print("  clinic  / clinic123")

    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback; traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()

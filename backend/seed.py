import os
import sys
import datetime
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models

def seed_data():
    # 1. Delete existing database file to start fresh
    if os.path.exists("crm.db"):
        print("Removing existing database...")
        os.remove("crm.db")

    # 2. Recreate tables
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 3. Seed Settings
        print("Seeding settings...")
        settings_data = [
            # Clinics
            ('clinic', "Dhanmondi Women's Clinic"),
            ('clinic', "Mirpur-10 Maternity"),
            ('clinic', "Bogura RC Centre"),
            ('clinic', "Chattogram Centre"),
            ('clinic', "Premium Dhanmondi"),
            ('clinic', "Sylhet Clinic"),
            # NGOs
            ('ngo', "MSI Bangladesh"),
            ('ngo', "Family Planning Assoc."),
            ('ngo', "BRAC Health"),
            # Reasons
            ('reason', "Family Planning"),
            ('reason', "Maternal Health"),
            ('reason', "General Health"),
            ('reason', "Adolescent Care"),
            # Agents
            ('agentName', "Zeba Akter"),
            ('agentName', "Farhana Islam"),
            ('agentName', "Riya Ahmed"),
            # Waiver Services
            ('waiverService', "MR"),
            ('waiverService', "PAC"),
            ('waiverService', "ANC"),
            ('waiverService', "PNC"),
            ('waiverService', "Family Planning"),
        ]
        for cat, val in settings_data:
            db.add(models.Setting(category=cat, value=val))

        # 4. Seed Clients
        print("Seeding clients...")
        clients = [
            models.Client(name="Nusrat Jahan", phone="01712345678", age=28, address="Mirpur-1, Dhaka"),
            models.Client(name="Farhana Islam", phone="01811223344", age=32, address="Dhanmondi 32, Dhaka"),
            models.Client(name="Sabina Yasmin", phone="01911223344", age=25, address="Uttara Sector 7, Dhaka"),
            models.Client(name="Runa Laila", phone="01611223344", age=40, address="Gulshan 2, Dhaka"),
            models.Client(name="Tania Akter", phone="01755667788", age=29, address="Mohammadpur, Dhaka"),
            models.Client(name="Ayesha Siddiqua", phone="01511223344", age=35, address="Banani, Dhaka"),
            models.Client(name="Khadija Begum", phone="01311223344", age=45, address="Badda, Dhaka"),
            models.Client(name="Sumaiya Akter", phone="01411223344", age=22, address="Khilgaon, Dhaka"),
        ]
        db.add_all(clients)
        db.flush() # To get IDs

        # 5. Seed Appointments
        print("Seeding appointments...")
        appointments = [
            models.Appointment(
                client_id=clients[0].id,
                clinic="Premium Dhanmondi",
                reason="Family Planning",
                visit_date=datetime.datetime.now() + datetime.timedelta(days=2),
                remarks="Follow-up visit",
                referral_fee="No",
                reconfirmation="Okay",
                ref_id="REF-2024-12345"
            ),
            models.Appointment(
                client_id=clients[1].id,
                clinic="Mirpur-10 Maternity",
                reason="Maternal Health",
                visit_date=datetime.datetime.now() + datetime.timedelta(days=1),
                remarks="First time checkup",
                referral_fee="Yes",
                reconfirmation="Pending",
                ref_id="REF-2024-67890"
            ),
            models.Appointment(
                client_id=clients[2].id,
                clinic="Bogura RC Centre",
                reason="General Health",
                visit_date=datetime.datetime.now() + datetime.timedelta(days=3),
                remarks="Regular checkup",
                referral_fee="No",
                reconfirmation="Confirmed",
                ref_id="REF-2024-11223"
            ),
            models.Appointment(
                client_id=clients[3].id,
                clinic="Sylhet Clinic",
                reason="Adolescent Care",
                visit_date=datetime.datetime.now() + datetime.timedelta(days=5),
                remarks="Counselling session",
                referral_fee="No",
                reconfirmation="Okay",
                ref_id="REF-2024-44556"
            ),
        ]
        db.add_all(appointments)

        # 6. Seed Call Logs
        print("Seeding call logs...")
        logs = [
            models.CallLog(
                caller_name="Nusrat Jahan",
                phone="01712345678",
                call_date=datetime.datetime.now(),
                caller_type="Female",
                reason="Inquiry about clinic services",
                district="Dhaka",
                duration="00:05:30",
                status="Resolved"
            ),
            models.CallLog(
                caller_name="Unknown",
                phone="01800000000",
                call_date=datetime.datetime.now() - datetime.timedelta(hours=2),
                caller_type="General",
                reason="Address inquiry",
                district="Gazipur",
                duration="00:02:15",
                status="Follow-up"
            ),
            models.CallLog(
                caller_name="Rahima Khatun",
                phone="01999888777",
                call_date=datetime.datetime.now() - datetime.timedelta(days=1),
                caller_type="Female",
                reason="Price inquiry",
                district="Chattogram",
                duration="00:03:45",
                status="Completed"
            ),
            models.CallLog(
                caller_name="Karim Ullah",
                phone="01555444333",
                call_date=datetime.datetime.now() - datetime.timedelta(days=1, hours=5),
                caller_type="Male",
                reason="Family Planning consultation",
                district="Sylhet",
                duration="00:10:20",
                status="Resolved"
            ),
        ]
        db.add_all(logs)

        # 7. Seed Waivers
        print("Seeding waivers...")
        waivers = [
            models.Waiver(
                date=datetime.datetime.now(),
                center="Premium Dhanmondi",
                client_id_code="Dhk-ae-0001",
                first_name="Nusrat",
                service="ANC",
                total_price=1200,
                waiver_amount=200,
                paid_amount=1000,
                waiver_code="wv-87654",
                remarks="Special discount"
            ),
            models.Waiver(
                date=datetime.datetime.now() - datetime.timedelta(days=2),
                center="Mirpur-10 Maternity",
                client_id_code="Mir-ae-0005",
                first_name="Farhana",
                service="MR",
                total_price=5000,
                waiver_amount=1000,
                paid_amount=4000,
                waiver_code="wv-11223",
                remarks="Poor patient support"
            ),
            models.Waiver(
                date=datetime.datetime.now() - datetime.timedelta(days=3),
                center="Chattogram Centre",
                client_id_code="Ctg-ae-0009",
                first_name="Zohra",
                service="PAC",
                total_price=3000,
                waiver_amount=500,
                paid_amount=2500,
                waiver_code="wv-44556",
                remarks="Institutional discount"
            )
        ]
        db.add_all(waivers)

        db.commit()
        print("Seeding completed successfully!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()

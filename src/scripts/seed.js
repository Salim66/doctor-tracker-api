require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const doctorsData = [
  {
    name: "Dr. Ayesha Rahman",
    specialization: "Cardiology",
    hospital: "Square Hospital",
    phone: "01711000001",
    email: "ayesha.rahman@hospital.com",
  },
  {
    name: "Dr. Karim Hossain",
    specialization: "Neurology",
    hospital: "Evercare Hospital",
    phone: "01711000002",
    email: "karim.hossain@hospital.com",
  },
  {
    name: "Dr. Nadia Islam",
    specialization: "Pediatrics",
    hospital: "Apollo Hospital",
    phone: "01711000003",
    email: "nadia.islam@hospital.com",
  },
  {
    name: "Dr. Rafiq Ahmed",
    specialization: "Orthopedics",
    hospital: "Popular Diagnostic",
    phone: "01711000004",
    email: "rafiq.ahmed@hospital.com",
  },
];

const patientsData = [
  { name: "Hasan Ali", age: 45, gender: "Male", phone: "01811000001", condition: "Hypertension" },
  { name: "Fatima Begum", age: 38, gender: "Female", phone: "01811000002", condition: "Diabetes" },
  { name: "Rahim Uddin", age: 52, gender: "Male", phone: "01811000003", condition: "Migraine" },
  { name: "Salma Khatun", age: 29, gender: "Female", phone: "01811000004", condition: "Asthma" },
  { name: "Imran Khan", age: 7, gender: "Male", phone: "01811000005", condition: "Fever" },
  { name: "Nusrat Jahan", age: 4, gender: "Female", phone: "01811000006", condition: "Cold" },
  { name: "Jamal Hossain", age: 61, gender: "Male", phone: "01811000007", condition: "Arthritis" },
  { name: "Ruma Akter", age: 34, gender: "Female", phone: "01811000008", condition: "Back Pain" },
  { name: "Tanvir Hasan", age: 41, gender: "Male", phone: "01811000009", condition: "Hypertension" },
  { name: "Maya Chowdhury", age: 27, gender: "Female", phone: "01811000010", condition: "Diabetes" },
];

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
    ]);

    const admin = await User.create({
      name: process.env.ADMIN_NAME || "Admin",
      email: process.env.ADMIN_EMAIL || "admin@doctortracker.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
    });

    const doctors = await Doctor.insertMany(doctorsData);

    const patientDocs = patientsData.map((patient, index) => ({
      ...patient,
      doctor: doctors[index % doctors.length]._id,
      createdAt: daysAgo(index * 2),
      updatedAt: daysAgo(index * 2),
    }));

    await Patient.insertMany(patientDocs);

    console.log("Seed completed");
    console.log("Admin:", admin.email);
    console.log("Doctors:", doctors.length);
    console.log("Patients:", patientDocs.length);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seed();

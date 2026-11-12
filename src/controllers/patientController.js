const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const buildPatientFilter = (query) => {
  const { search, condition, doctor, startDate, endDate } = query;
  const filter = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (condition) {
    filter.condition = new RegExp(condition, "i");
  }

  if (doctor) {
    filter.doctor = doctor;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  return filter;
};

const createPatient = async (req, res, next) => {
  try {
    const doctorId = req.params.id || req.body.doctor;
    const { name, age, gender, phone, condition } = req.body;

    if (!doctorId || !name || age === undefined || !gender || !phone || !condition) {
      return res.status(400).json({
        success: false,
        message: "Doctor and all patient fields are required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      condition,
      doctor: doctorId,
    });

    const populated = await Patient.findById(patient._id).populate(
      "doctor",
      "name specialization hospital"
    );

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

const getPatients = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;
    const filter = buildPatientFilter(req.query);

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate("doctor", "name specialization hospital")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Patient.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: patients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPatientsByDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {
      doctor: req.params.id,
      ...buildPatientFilter(req.query),
    };
    filter.doctor = req.params.id;

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate("doctor", "name specialization hospital")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Patient.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: patients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "doctor",
      "name specialization hospital phone email"
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const { name, age, gender, phone, condition, doctor } = req.body;
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (doctor) {
      const doctorExists = await Doctor.findById(doctor);
      if (!doctorExists) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
      patient.doctor = doctor;
    }

    if (name !== undefined) patient.name = name;
    if (age !== undefined) patient.age = age;
    if (gender !== undefined) patient.gender = gender;
    if (phone !== undefined) patient.phone = phone;
    if (condition !== undefined) patient.condition = condition;

    await patient.save();

    const populated = await Patient.findById(patient._id).populate(
      "doctor",
      "name specialization hospital"
    );

    res.json({
      success: true,
      message: "Patient updated successfully",
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientsByDoctor,
  getPatientById,
  updatePatient,
  deletePatient,
};

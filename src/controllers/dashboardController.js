const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const getDashboardStats = async (req, res, next) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));

    const [totalDoctors, totalPatients, patientsPerDoctor, patientsByDate, patientsByCondition] =
      await Promise.all([
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Patient.aggregate([
          {
            $group: {
              _id: "$doctor",
              patientCount: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "doctors",
              localField: "_id",
              foreignField: "_id",
              as: "doctor",
            },
          },
          { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              doctorId: "$_id",
              doctorName: { $ifNull: ["$doctor.name", "Unknown"] },
              specialization: { $ifNull: ["$doctor.specialization", ""] },
              patientCount: 1,
            },
          },
          { $sort: { patientCount: -1 } },
        ]),
        Patient.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id",
              count: 1,
            },
          },
        ]),
        Patient.aggregate([
          {
            $group: {
              _id: "$condition",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              condition: "$_id",
              count: 1,
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        totals: {
          doctors: totalDoctors,
          patients: totalPatients,
        },
        patientsPerDoctor,
        patientsByDate,
        patientsByCondition,
        rangeDays: days,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };

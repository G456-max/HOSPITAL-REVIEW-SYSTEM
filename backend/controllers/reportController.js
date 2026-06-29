const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Export patient reviews and rating grids as Excel
 * @route   GET /api/reports/excel
 * @access  Private
 */
const exportExcel = async (req, res, next) => {
  try {
    const query = {};
    if (req.user && req.user.role === 'DepartmentAdmin') {
      query.department = req.user.department;
    }

    if (req.query.patientType) {
      query.patientType = req.query.patientType;
    }

    const reviews = await Review.find(query).sort({ reviewDate: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inpatient Reviews Log');

    // Define columns
    worksheet.columns = [
      { header: 'Review Date', key: 'date', width: 20 },
      { header: 'Patient ID', key: 'patientId', width: 15 },
      { header: 'Patient Name', key: 'patientName', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Treating Doctor', key: 'doctor', width: 25 },
      { header: 'Overall Score', key: 'overallScore', width: 15 },
      { header: 'Sentiment', key: 'sentiment', width: 15 },
      
      // Sub-ratings
      { header: 'Registration Process', key: 'registration', width: 20 },
      { header: 'Doctor Listened', key: 'docListened', width: 18 },
      { header: 'Doctor Explained', key: 'docExplained', width: 18 },
      { header: 'Doctor Spent Time', key: 'docTime', width: 18 },
      { header: 'Doctor Behaviour', key: 'docBehavior', width: 18 },
      { header: 'Doctor Confidence', key: 'docConfidence', width: 18 },
      
      { header: 'Nurses Polite', key: 'nursePolite', width: 18 },
      { header: 'Nurses Quick', key: 'nurseQuick', width: 18 },
      { header: 'Nurses Medicines Time', key: 'nurseMeds', width: 20 },
      { header: 'Nurses Pain Mgmt', key: 'nursePain', width: 20 },
      { header: 'Nurses Support', key: 'nurseSupport', width: 18 },
      
      { header: 'Ward Cleanliness', key: 'cleanWard', width: 18 },
      { header: 'Bathroom Cleanliness', key: 'cleanBath', width: 18 },
      { header: 'Bed Cleanliness', key: 'cleanBed', width: 18 },
      { header: 'Dust-free Ward', key: 'cleanDust', width: 18 },
      { header: 'Overall Hygiene', key: 'cleanOverall', width: 18 },
      
      { header: 'Lab Collection', key: 'labCollection', width: 18 },
      { header: 'Lab Wait Time', key: 'labWait', width: 18 },
      { header: 'Lab Staff', key: 'labStaff', width: 18 },
      { header: 'Lab Delivery', key: 'labDelivery', width: 18 },
      
      { header: 'Pharmacy Availability', key: 'pharmAvailability', width: 20 },
      { header: 'Pharmacy Wait Time', key: 'pharmWait', width: 20 },
      { header: 'Pharmacy Explanation', key: 'pharmExplain', width: 20 },
      { header: 'Pharmacy Quality', key: 'pharmQuality', width: 20 },
      
      { header: 'Food Quality', key: 'foodQuality', width: 18 },
      { header: 'Food Taste', key: 'foodTaste', width: 18 },
      { header: 'Food Temp', key: 'foodTemp', width: 18 },
      { header: 'Food Timely', key: 'foodTimely', width: 18 },
      { header: 'Food Diet', key: 'foodDiet', width: 18 },
      
      { header: 'Billing Process', key: 'billProcess', width: 18 },
      { header: 'Billing Transparency', key: 'billTrans', width: 18 },
      { header: 'Billing Wait Time', key: 'billWait', width: 18 },
      { header: 'Billing Satisfaction', key: 'billSatisfaction', width: 18 },
      
      { header: 'Hospital Security', key: 'hospSecurity', width: 18 },
      { header: 'Hospital Navigation', key: 'hospNavigation', width: 18 },
      { header: 'Hospital Environment', key: 'hospEnv', width: 18 },
      { header: 'Hospital Recommend', key: 'hospRecommend', width: 18 },
      { header: 'Hospital Overall', key: 'hospOverall', width: 18 },
      
      { header: 'Text Suggestions', key: 'suggestions', width: 45 }
    ];

    // Format headers
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0273CA' }
    };

    reviews.forEach(r => {
      worksheet.addRow({
        date: r.reviewDate.toISOString().split('T')[0],
        patientId: r.patientId,
        patientName: r.patientName,
        department: r.department,
        doctor: r.doctorName,
        overallScore: r.overallRating,
        sentiment: r.sentiment,
        
        registration: r.ratings.registrationProcess,
        docListened: r.ratings.doctorListened,
        docExplained: r.ratings.doctorExplained,
        docTime: r.ratings.doctorSpentTime,
        docBehavior: r.ratings.doctorBehaved,
        docConfidence: r.ratings.doctorConfidence,
        
        nursePolite: r.ratings.nursesPolite,
        nurseQuick: r.ratings.nursesQuick,
        nurseMeds: r.ratings.nursesMedicinesTime,
        nursePain: r.ratings.nursesPainManagement,
        nurseSupport: r.ratings.nursesOverallSupport,
        
        cleanWard: r.ratings.wardCleanliness,
        cleanBath: r.ratings.bathroomCleanliness,
        cleanBed: r.ratings.bedCleanliness,
        cleanDust: r.ratings.dustFreeEnvironment,
        cleanOverall: r.ratings.overallHygiene,
        
        labCollection: r.ratings.sampleCollectionExperience,
        labWait: r.ratings.waitingTimeLab,
        labStaff: r.ratings.staffBehaviourLab,
        labDelivery: r.ratings.reportDeliveryLab,
        
        pharmAvailability: r.ratings.medicineAvailability,
        pharmWait: r.ratings.waitingTimePharmacy,
        pharmExplain: r.ratings.pharmacistExplanation,
        pharmQuality: r.ratings.medicineQuality,
        
        foodQuality: r.ratings.foodQuality,
        foodTaste: r.ratings.foodTaste,
        foodTemp: r.ratings.foodTemperature,
        foodTimely: r.ratings.foodTimelyDelivery,
        foodDiet: r.ratings.foodDietFollowed,
        
        billProcess: r.ratings.billingProcess,
        billTrans: r.ratings.billingTransparency,
        billWait: r.ratings.billingWaitingTime,
        billSatisfaction: r.ratings.billingOverallSatisfaction,
        
        hospSecurity: r.ratings.hospitalSecurity,
        hospNavigation: r.ratings.hospitalNavigation,
        hospEnv: r.ratings.hospitalEnvironment,
        hospRecommend: r.ratings.hospitalRecommendation,
        hospOverall: r.ratings.hospitalOverallExperience,
        
        suggestions: r.suggestions
      });
    });

    // Write audit log
    await AuditLog.create({
      action: 'Export Excel Report',
      performedBy: req.user ? req.user.username : 'System Admin',
      details: `Inpatient feedback registry exported to Excel file (${reviews.length} logs).`
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'hospital_reviews_export.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export hospital and department statistics as PDF
 * @route   GET /api/reports/pdf
 * @access  Private
 */
const exportPdf = async (req, res, next) => {
  try {
    const query = {};
    if (req.user && req.user.role === 'DepartmentAdmin') {
      query.department = req.user.department;
    }

    if (req.query.patientType) {
      query.patientType = req.query.patientType;
    }

    const reviews = await Review.find(query);
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=visakha_steel_hospital_report.pdf'
    );

    doc.pipe(res);

    // Document header
    doc
      .fillColor('#0273CA')
      .fontSize(22)
      .text('VISAKHA STEEL GENERAL HOSPITAL', { align: 'center', bold: true })
      .moveDown(0.2);

    doc
      .fillColor('#4B5563')
      .fontSize(14)
      .text('In-Patient Review & Satisfaction Index Report', { align: 'center' })
      .moveDown(0.5);

    doc
      .strokeColor('#D1D5DB')
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(1);

    // Summary metadata
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length 
      : 0;

    const positiveCount = reviews.filter(r => r.sentiment === 'Positive').length;
    const mixedCount = reviews.filter(r => r.sentiment === 'Mixed').length;
    const negativeCount = reviews.filter(r => r.sentiment === 'Negative').length;

    doc
      .fillColor('#1F2937')
      .fontSize(12)
      .text(`Report Date: ${new Date().toLocaleDateString()}`)
      .text(`Scope: ${req.user && req.user.role === 'DepartmentAdmin' ? req.user.department + ' Department' : 'Hospital-wide stays'}`)
      .text(`Total Feedback Logs Evaluated: ${reviews.length}`)
      .text(`Mean Patient Satisfaction Score: ${avgRating.toFixed(2)} / 5.0`)
      .moveDown(1);

    doc
      .fillColor('#035CA3')
      .fontSize(14)
      .text('Sentiment Distribution Analysis', { bold: true })
      .moveDown(0.4);

    doc
      .fillColor('#1F2937')
      .fontSize(11)
      .text(`- Positive Sentiment Stays: ${positiveCount} (${reviews.length > 0 ? Math.round((positiveCount / reviews.length) * 100) : 0}%)`)
      .text(`- Mixed / Neutral Stays: ${mixedCount} (${reviews.length > 0 ? Math.round((mixedCount / reviews.length) * 100) : 0}%)`)
      .text(`- Negative Sentiment Stays: ${negativeCount} (${reviews.length > 0 ? Math.round((negativeCount / reviews.length) * 100) : 0}%)`)
      .moveDown(1.5);

    // Draw a list of key category scores
    doc
      .fillColor('#035CA3')
      .fontSize(14)
      .text('Category Satisfaction Index', { bold: true })
      .moveDown(0.4);

    const categories = [
      { label: 'Registration Process', key: 'registrationProcess' },
      { label: 'Doctor Care & Diagnosis', key: 'doctorConfidence' },
      { label: 'Nursing Care & Promptness', key: 'nursesOverallSupport' },
      { label: 'Housekeeping & Hygiene', key: 'overallHygiene' },
      { label: 'Laboratory Services', key: 'reportDeliveryLab' },
      { label: 'Pharmacy Medicine Stock', key: 'medicineAvailability' },
      { header: 'Dietary Food Services', key: 'foodQuality' },
      { label: 'Discharge Billing Transparency', key: 'billingOverallSatisfaction' },
      { label: 'Overall Hospital Environment', key: 'hospitalOverallExperience' }
    ];

    categories.forEach(cat => {
      let sum = 0;
      reviews.forEach(r => {
        sum += r.ratings[cat.key] || 3;
      });
      const avg = reviews.length > 0 ? sum / reviews.length : 0;
      doc
        .fillColor('#1F2937')
        .fontSize(11)
        .text(`- ${cat.label || cat.header}: ${avg.toFixed(2)} / 5.0`);
    });

    doc.moveDown(2);

    // Note section
    doc
      .fillColor('#9CA3AF')
      .fontSize(9)
      .text('This is an AI-generated dashboard summary report compiled automatically from database logs.', { align: 'center', italic: true })
      .text('Visakha Steel General Hospital - Confidential Document.', { align: 'center', italic: true });

    // Write audit log
    await AuditLog.create({
      action: 'Export PDF Report',
      performedBy: req.user ? req.user.username : 'System Admin',
      details: `Inpatient analytics report PDF exported (${reviews.length} feedback logs evaluated).`
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportExcel,
  exportPdf
};

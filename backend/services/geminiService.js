const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check for API Key in env
const geminiApiKey = process.env.GEMINI_API_KEY || '';

// Initialize Gemini client if key exists
let genAI = null;
if (geminiApiKey.trim()) {
  try {
    genAI = new GoogleGenerativeAI(geminiApiKey);
  } catch (error) {
    console.error('Error initializing Google Gemini Client:', error);
  }
}

/**
 * Service to analyze patient review text and rating breakdown using Gemini 1.5 Flash
 */
const analyzeReview = async (reviewData) => {
  const { department, doctorName, ratings, suggestions, overallRating } = reviewData;

  const promptText = `
Analyze this patient review and rating breakdown for Visakha Steel General Hospital.
Return JSON only. Do not include markdown code block formatting (such as \`\`\`json).

INPUT DETAILS:
- Department: ${department}
- Doctor Name: ${doctorName}
- Ratings Breakdown (1-5 scale):
  * Registration: ${ratings.registrationProcess}
  * Doctor Care (Listened: ${ratings.doctorListened}, Explained: ${ratings.doctorExplained}, Spent Time: ${ratings.doctorSpentTime}, Behaviour: ${ratings.doctorBehaved}, Confidence: ${ratings.doctorConfidence})
  * Nursing (Polite: ${ratings.nursesPolite}, Promptness: ${ratings.nursesQuick}, Timely Meds: ${ratings.nursesMedicinesTime}, Pain Mgmt: ${ratings.nursesPainManagement}, Support: ${ratings.nursesOverallSupport})
  * Cleanliness (Ward: ${ratings.wardCleanliness}, Bathroom: ${ratings.bathroomCleanliness}, Bed: ${ratings.bedCleanliness}, Dust-Free: ${ratings.dustFreeEnvironment}, Hygiene: ${ratings.overallHygiene})
  * Laboratory (Collection: ${ratings.sampleCollectionExperience}, Wait Time: ${ratings.waitingTimeLab}, Staff: ${ratings.staffBehaviourLab}, Report: ${ratings.reportDeliveryLab})
  * Pharmacy (Meds Availability: ${ratings.medicineAvailability}, Wait Time: ${ratings.waitingTimePharmacy}, Pharmacist Explanation: ${ratings.pharmacistExplanation}, Med Quality: ${ratings.medicineQuality})
  * Food Services (Quality: ${ratings.foodQuality}, Taste: ${ratings.foodTaste}, Temp: ${ratings.foodTemperature}, Timely: ${ratings.foodTimelyDelivery}, Diet Followed: ${ratings.foodDietFollowed})
  * Billing (Process: ${ratings.billingProcess}, Transparency: ${ratings.billingTransparency}, Wait Time: ${ratings.billingWaitingTime}, Satisfaction: ${ratings.billingOverallSatisfaction})
  * Hospital Experience (Security: ${ratings.hospitalSecurity}, Navigation: ${ratings.hospitalNavigation}, Environment: ${ratings.hospitalEnvironment}, Recommendation: ${ratings.hospitalRecommendation}, Overall: ${ratings.hospitalOverallExperience})
- Suggestions/Comments: "${suggestions}"
- Submitter's Overall Rating: ${overallRating}

JSON STRUCTURE TO RETURN:
{
  "overallSentiment": "Positive" | "Negative" | "Mixed",
  "positivePercentage": <number between 0 and 100>,
  "negativePercentage": <number between 0 and 100>,
  "summary": "<2-3 sentence summary of the patient feedback>",
  "positivePoints": ["<point 1>", "<point 2>"],
  "negativePoints": ["<point 1>", "<point 2>"],
  "departmentIssues": ["<department 1 needing attention>", "<department 2>"],
  "doctorFeedback": "<feedback about doctor care and diagnosis>",
  "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>"],
  "urgencyLevel": "Low" | "Medium" | "High"
}
`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });
      const responseText = response.response.text();
      if (responseText && responseText.trim()) {
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
      }
    } catch (error) {
      console.error('Gemini API call failed, falling back to local analyzer. Error:', error.message);
    }
  }

  // Fallback engine if Gemini is disabled or fails
  return runLocalFallback(reviewData);
};

/**
 * Rules-based local fallback engine to keep the system running robustly
 */
const runLocalFallback = (reviewData) => {
  const { department, doctorName, ratings, suggestions, overallRating } = reviewData;

  // Determine sentiment
  let sentiment = 'Mixed';
  let positivePercentage = 50;
  let negativePercentage = 30;
  let urgency = 'Medium';

  if (overallRating >= 4) {
    sentiment = 'Positive';
    positivePercentage = 85;
    negativePercentage = 10;
    urgency = 'Low';
  } else if (overallRating <= 2) {
    sentiment = 'Negative';
    positivePercentage = 15;
    negativePercentage = 80;
    urgency = 'High';
  }

  // Analyze rating categories
  const positivePoints = [];
  const negativePoints = [];
  const departmentIssues = [];
  const improvementSuggestions = [];

  // 1. Registration
  if (ratings.registrationProcess >= 4) {
    positivePoints.push('Smooth registration process');
  } else if (ratings.registrationProcess <= 2) {
    negativePoints.push('Delays in registration and front desk reception');
    departmentIssues.push('Registration');
    improvementSuggestions.push('Reduce waiting time and streamline paperwork at patient registration.');
  }

  // 2. Doctor Care
  const avgDoctor = (ratings.doctorListened + ratings.doctorExplained + ratings.doctorSpentTime + ratings.doctorBehaved + ratings.doctorConfidence) / 5;
  let doctorFeedback = `Doctor ${doctorName} generally handled the treatment.`;
  if (avgDoctor >= 4) {
    positivePoints.push(`Excellent care and clear explanations from Dr. ${doctorName}`);
    doctorFeedback = `Patient expressed high confidence in Dr. ${doctorName}'s diagnosis, listening, and polite behaviour.`;
  } else if (avgDoctor <= 2.5) {
    negativePoints.push(`Unsatisfactory communication from Dr. ${doctorName}`);
    departmentIssues.push('Clinical / Doctors');
    doctorFeedback = `Patient felt Dr. ${doctorName} was rushed or did not explain the treatment regimen clearly.`;
    improvementSuggestions.push(`Improve patient engagement and communication skills for Dr. ${doctorName}.`);
  }

  // 3. Nursing Care
  const avgNurses = (ratings.nursesPolite + ratings.nursesQuick + ratings.nursesMedicinesTime + ratings.nursesPainManagement + ratings.nursesOverallSupport) / 5;
  if (avgNurses >= 4) {
    positivePoints.push('Attentive and polite nursing care team');
  } else if (avgNurses <= 2.5) {
    negativePoints.push('Slow response times and delays in medicine administration from nurses');
    departmentIssues.push('Nursing Care');
    improvementSuggestions.push('Ensure nurses respond quickly to call lights and administer medications strictly on schedule.');
  }

  // 4. Housekeeping
  const avgClean = (ratings.wardCleanliness + ratings.bathroomCleanliness + ratings.bedCleanliness + ratings.dustFreeEnvironment + ratings.overallHygiene) / 5;
  if (avgClean >= 4) {
    positivePoints.push('Pristine ward cleanliness and bathroom hygiene');
  } else if (avgClean <= 2.5) {
    negativePoints.push('Dirty bathrooms or unclean linen in the ward');
    departmentIssues.push('Housekeeping & Sanitation');
    improvementSuggestions.push('Increase the frequency of toilet cleaning and replace bed linens daily in the wards.');
  }

  // 5. Laboratory
  const avgLab = (ratings.sampleCollectionExperience + ratings.waitingTimeLab + ratings.staffBehaviourLab + ratings.reportDeliveryLab) / 5;
  if (avgLab >= 4) {
    positivePoints.push('Fast sample collection and polite staff in the lab');
  } else if (avgLab <= 2.5) {
    negativePoints.push('Long queues or late reports from the laboratory');
    departmentIssues.push('Laboratory');
    improvementSuggestions.push('Improve queue management in the lab and automate report delivery to prevent delays.');
  }

  // 6. Pharmacy
  const avgPharmacy = (ratings.medicineAvailability + ratings.waitingTimePharmacy + ratings.pharmacistExplanation + ratings.medicineQuality) / 5;
  if (avgPharmacy >= 4) {
    positivePoints.push('Good availability of prescribed drugs at the pharmacy');
  } else if (avgPharmacy <= 2.5) {
    negativePoints.push('Prescribed medicines were out of stock or pharmacist explanation was inadequate');
    departmentIssues.push('Pharmacy');
    improvementSuggestions.push('Optimize inventory to ensure stock of essential drugs and ensure pharmacists explain dosages clearly.');
  }

  // 7. Food Services
  const avgFood = (ratings.foodQuality + ratings.foodTaste + ratings.foodTemperature + ratings.foodTimelyDelivery + ratings.foodDietFollowed) / 5;
  if (avgFood >= 4) {
    positivePoints.push('Tasty, warm, and timely food service matching prescribed diet');
  } else if (avgFood <= 2.5) {
    negativePoints.push('Cold food, poor taste, or delayed food tray deliveries');
    departmentIssues.push('Catering & Dietetics');
    improvementSuggestions.push('Ensure food trays are delivered warm and maintain strict adherence to therapeutic diet plans.');
  }

  // 8. Billing
  const avgBilling = (ratings.billingProcess + ratings.billingTransparency + ratings.billingWaitingTime + ratings.billingOverallSatisfaction) / 5;
  if (avgBilling >= 4) {
    positivePoints.push('Transparent and smooth discharge billing');
  } else if (avgBilling <= 2.5) {
    negativePoints.push('Lack of billing transparency or extremely long waiting time at discharge counter');
    departmentIssues.push('Billing & Finance');
    improvementSuggestions.push('Enhance transparency in itemized bills and create separate express counters for discharge clearance.');
  }

  // 9. Overall Experience
  if (ratings.hospitalOverallExperience >= 4) {
    positivePoints.push('Secure hospital environment and simple navigation');
  } else if (ratings.hospitalOverallExperience <= 2.5) {
    negativePoints.push('Confusing navigation layout or poor overall environment');
    improvementSuggestions.push('Install clearer directional signage throughout the hospital premises.');
  }

  // Ensure default elements in list
  if (positivePoints.length === 0) positivePoints.push('Overall stable medical support');
  if (negativePoints.length === 0 && overallRating <= 3) negativePoints.push('Minor administrative wait times');

  const summary = suggestions.trim()
    ? `Patient left suggestions: "${suggestions.substring(0, 150)}...". They rated overall stay ${overallRating}/5 in the ${department} department under Dr. ${doctorName}.`
    : `Patient completed inpatient survey for the ${department} department under Dr. ${doctorName} with an overall rating of ${overallRating}/5.`;

  return {
    overallSentiment: sentiment,
    positivePercentage,
    negativePercentage,
    summary,
    positivePoints,
    negativePoints,
    departmentIssues,
    doctorFeedback,
    improvementSuggestions,
    urgencyLevel: urgency
  };
};

/**
 * Service to draft patient feedback comments based on ratings and stars
 */
const draftReviewComments = async (ratings, overallRating, existingSuggestions) => {
  let promptText = `
You are a patient feedback assistant for Visakha Steel General Hospital.
Draft a realistic 2-3 sentence review suggestion/comment in a natural, polite patient voice based on these ratings (1-5 scale):
${JSON.stringify(ratings)}
Overall satisfaction rating selected: ${overallRating}/5.
`;

  if (existingSuggestions && existingSuggestions.trim()) {
    promptText += `\nThe patient has also typed the following initial comments: "${existingSuggestions.trim()}". Please incorporate, expand, or refine these comments naturally into the drafted paragraph.\n`;
  }

  promptText += `
Draft instructions:
- If overall rating is high (4-5), focus on appreciating the positive elements (scores 4-5).
- If overall rating is low (1-2), express disappointment politely about negative elements (scores 1-2).
- If overall rating is mixed (3), mention both strengths and weaknesses.
- Return ONLY the draft text paragraph. No explanations, no markdown formatting, no JSON wrappers.
`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent(promptText);
      const text = response.response.text();
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (error) {
      console.error('Gemini draft generation failed, falling back to local drafter. Error:', error.message);
    }
  }

  return runLocalDrafter(ratings, overallRating, existingSuggestions);
};

/**
 * Local rule-based drafter fallback
 */
const runLocalDrafter = (ratings, overallRating, existingSuggestions) => {
  const positives = [];
  const negatives = [];

  // Check categories
  if (ratings.registrationProcess >= 4) positives.push('smooth registration');
  else if (ratings.registrationProcess <= 2) negatives.push('slow registration and paperwork delays');

  const avgDoc = (ratings.doctorListened + ratings.doctorExplained + ratings.doctorSpentTime + ratings.doctorBehaved + ratings.doctorConfidence) / 5;
  if (avgDoc >= 4) positives.push('attentive care from consulting doctors');
  else if (avgDoc <= 2.5) negatives.push('inadequate communication and brief doctor checkups');

  const avgNurse = (ratings.nursesPolite + ratings.nursesQuick + ratings.nursesMedicinesTime + ratings.nursesPainManagement + ratings.nursesOverallSupport) / 5;
  if (avgNurse >= 4) positives.push('caring and prompt nursing staff');
  else if (avgNurse <= 2.5) negatives.push('slow response times and delays in medicines from nurses');

  const avgClean = (ratings.wardCleanliness + ratings.bathroomCleanliness + ratings.bedCleanliness + ratings.dustFreeEnvironment + ratings.overallHygiene) / 5;
  if (avgClean >= 4) positives.push('pristine ward cleanliness and bathroom hygiene');
  else if (avgClean <= 2.5) negatives.push('unclean ward bathrooms and dirty bed linens');

  const avgPharmacy = (ratings.medicineAvailability + ratings.waitingTimePharmacy + ratings.pharmacistExplanation + ratings.medicineQuality) / 5;
  if (avgPharmacy >= 4) positives.push('excellent drug availability at the pharmacy');
  else if (avgPharmacy <= 2.5) negatives.push('long pharmacy queues and medicines being out of stock');

  const avgBilling = (ratings.billingProcess + ratings.billingTransparency + ratings.billingWaitingTime + ratings.billingOverallSatisfaction) / 5;
  if (avgBilling >= 4) positives.push('smooth billing clearance');
  else if (avgBilling <= 2.5) negatives.push('poor billing transparency and extreme waiting times at discharge');

  let text = '';
  if (overallRating >= 4) {
    text = `I had a very comfortable stay at the hospital. I really appreciated the ${positives.slice(0, 3).join(', ')}. The clinical team is highly professional.`;
    if (negatives.length > 0) {
      text += ` Only minor concern was ${negatives[0]}.`;
    }
  } else if (overallRating <= 2) {
    text = `I am disappointed with my hospital experience. There were significant issues with the ${negatives.slice(0, 3).join(', ')}.`;
    if (positives.length > 0) {
      text += ` Although, we had ${positives[0]}.`;
    }
    text += ` I hope the administration takes corrective steps.`;
  } else {
    text = `My stay at the hospital was mixed. On one hand, I was pleased with the ${positives.slice(0, 2).join(' and ')}. On the other hand, there were delays in ${negatives.slice(0, 2).join(' and ')}.`;
  }

  if (existingSuggestions && existingSuggestions.trim()) {
    text = `${existingSuggestions.trim()} - ${text}`;
  }

  return text;
};

module.exports = {
  analyzeReview,
  draftReviewComments
};

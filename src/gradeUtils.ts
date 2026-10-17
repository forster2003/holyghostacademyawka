/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentResult, SubjectScore } from './types';

export const SCHOOL_LOGO_URL = 'https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg';
export const SCHOOL_OFFICIAL_NAME = 'Holy Ghost Academy Group of Schools, Awka';
export const SCHOOL_OFFICIAL_EMAIL = 'holyghostacademy@gmail.com';
export const SCHOOL_MOTTO = 'Moral and Academics (MALU CHUKWU, MALU AKWUKO)';
export const SCHOOL_MANAGER_NAME = 'Engr. ThankGod Ndibe B.Engr., M.Engr.';
export const SCHOOL_MANAGER_PHOTO = 'https://i.ibb.co/pj9SBTbc/cccg.jpg';
export const FOUNDER_NAME = 'Late Archbishop Dr. Ephraim Ndife Jp2';
export const FOUNDER_PHOTO = 'https://i.ibb.co/DPkn77Md/hg16.jpg';
export const SCHOOL_WHATSAPP_PHONE_1 = '+234 (0) 905 414 5339';
export const SCHOOL_WHATSAPP_PHONE_2 = '+234 (0) 706 898 6865';
export const SCHOOL_WHATSAPP_URL_1 = 'https://wa.me/2349054145339?text=Hello%20Holy%20Ghost%20Academy%2C%20I%20would%20like%20to%20inquire%20about%20student%20enrollment%20and%20admissions.';
export const SCHOOL_WHATSAPP_URL_2 = 'https://wa.me/2347068986865?text=Hello%20Holy%20Ghost%20Academy%2C%20I%20would%20like%20to%20inquire%20about%20student%20enrollment%20and%20admissions.';

/**
 * Standard WAEC/NECO/Diocesan grading breakdown
 */
export function getGradeFromScore(totalScore: number): { grade: string; remark: string; gradePoint: number } {
  if (totalScore >= 75) {
    return { grade: 'A', remark: 'Excellent', gradePoint: 5.0 };
  } else if (totalScore >= 65) {
    return { grade: 'B', remark: 'Very Good', gradePoint: 4.0 };
  } else if (totalScore >= 50) {
    return { grade: 'C', remark: 'Credit', gradePoint: 3.0 };
  } else if (totalScore >= 45) {
    return { grade: 'D', remark: 'Pass', gradePoint: 2.0 };
  } else if (totalScore >= 40) {
    return { grade: 'E', remark: 'Fair Pass', gradePoint: 1.0 };
  } else {
    return { grade: 'F', remark: 'Fail', gradePoint: 0.0 };
  }
}

/**
 * Generate insightful subject assessment remark based on total score
 */
export function getSubjectAssessmentRemark(subject: string, totalScore: number): string {
  if (totalScore >= 90) return 'Exceptional mastery and superior analytical acumen.';
  if (totalScore >= 80) return 'Distinguished performance with firm conceptual grasp.';
  if (totalScore >= 70) return 'Very good coursework and consistent academic rigor.';
  if (totalScore >= 60) return 'Good comprehension; active class contribution.';
  if (totalScore >= 50) return 'Credit pass; capable of higher achievement with dedication.';
  if (totalScore >= 40) return 'Pass level; targeted review and tutorial focus advised.';
  return 'Below pass threshold; mandatory remedial reinforcement recommended.';
}

export const STANDARD_PROMOTION_STATUS_OPTIONS = [
  'Promoted to Next Class',
  'Promoted to JSS 2',
  'Promoted to JSS 3',
  'Promoted to SS 1',
  'Promoted to SS 2',
  'Promoted to SS 3',
  'Promoted on Trial',
  'Recommended for Advancement',
  'Repeats Class / Not Promoted',
  'Graduated / Passed Out (Certificate Issued)',
  'Advancement Pending Remedial Evaluation',
  'In Progress (Academic Term Ongoing)'
];

/**
 * Determine the next academic class progression in Nigerian secondary school curriculum
 */
export function getNextClassLevel(currentClass?: string): string {
  if (!currentClass) return 'Next Class';
  const trimmed = currentClass.trim();
  const progressionMap: Record<string, string> = {
    'JSS 1': 'JSS 2',
    'JSS 2': 'JSS 3',
    'JSS 3': 'SS 1 (Senior Secondary)',
    'SS 1': 'SS 2',
    'SS 2': 'SS 3',
    'SS 3': 'Graduated / Higher Institution',
  };
  return progressionMap[trimmed] || 'Next Class';
}

/**
 * Automatically determine promotion status according to diocesan pass standards
 */
export function computePromotionStatus(
  classLevel: string = 'SS 2',
  terminalAverage: number = 0,
  failedSubjectsCount: number = 0,
  term?: string
): string {
  const nextClass = getNextClassLevel(classLevel);
  const normalizedClass = classLevel.trim().toUpperCase();

  if (normalizedClass === 'SS 3') {
    return terminalAverage >= 50 
      ? 'Graduated - Eligible for WASSCE / NECO Certification' 
      : 'Advised for Remedial Examination';
  }

  // Check if term is 1st or 2nd term
  if (term && (term.includes('1st') || term.includes('2nd'))) {
    if (terminalAverage >= 50) return `In Good Standing - Advancement on Track to ${nextClass}`;
    if (terminalAverage >= 40) return 'Academic Warning - Remedial Focus Advised';
    return 'Academic Probation - Critical Improvement Needed';
  }

  // 3rd Term (Annual Promotion Decision) or general
  if (terminalAverage >= 50 && failedSubjectsCount <= 2) {
    return `Promoted to ${nextClass}`;
  } else if (terminalAverage >= 45 && failedSubjectsCount <= 3) {
    return `Promoted on Trial to ${nextClass}`;
  } else {
    return `Repeats ${classLevel}`;
  }
}

export interface AcademicEvaluationMetrics {
  grossTotalMarks: number;
  totalMaxMarks: number;
  terminalAverage: number;
  gradePoint: number; // e.g. 4.75 out of 5.00
  accreditedGradeBracket: string; // e.g. "Distinction (A1) - Grade A"
  classStanding: string; // e.g. "1st Class Honors - Exceptional Scholar"
  promotionStatus: string; // e.g. "Promoted to SS 3"
  totalSubjects: number;
}

/**
 * Compute aggregate academic metrics from subject scores and optional saved overrides
 */
export function computeAcademicMetrics(
  subjectScores: SubjectScore[],
  savedResult?: Partial<StudentResult>
): AcademicEvaluationMetrics {
  const totalSubjects = subjectScores.length || 1;
  const calculatedGrossTotal = subjectScores.reduce((sum, s) => sum + (Number(s.totalScore) || 0), 0);
  const totalMaxMarks = totalSubjects * 100;
  const calculatedAverage = Number((calculatedGrossTotal / totalSubjects).toFixed(2));

  // Count failed subjects (< 40)
  const failedSubjectsCount = subjectScores.filter(s => (Number(s.totalScore) || 0) < 40).length;

  // Compute Grade Point Average (GPA out of 5.0)
  const totalGradePoints = subjectScores.reduce((sum, s) => {
    const total = Number(s.totalScore) || 0;
    const { gradePoint } = getGradeFromScore(total);
    return sum + gradePoint;
  }, 0);
  const calculatedGPA = Number((totalGradePoints / totalSubjects).toFixed(2));

  // Use stored metric if provided, otherwise compute standard bracket
  let accreditedGradeBracket = savedResult?.accreditedGradeBracket;
  if (!accreditedGradeBracket) {
    if (calculatedAverage >= 75) {
      accreditedGradeBracket = 'Distinction (A1) - Grade A';
    } else if (calculatedAverage >= 65) {
      accreditedGradeBracket = 'Upper Credit (B2-B3) - Grade B';
    } else if (calculatedAverage >= 50) {
      accreditedGradeBracket = 'Credit (C4-C6) - Grade C';
    } else if (calculatedAverage >= 40) {
      accreditedGradeBracket = 'Pass (P7-P8) - Grade D/E';
    } else {
      accreditedGradeBracket = 'Fail (F9) - Grade F';
    }
  }

  // Use stored standing if provided, otherwise compute standard honors
  let classStanding = savedResult?.classStanding;
  if (!classStanding) {
    if (calculatedAverage >= 85) {
      classStanding = '1st Class Honors - Exceptional Scholar';
    } else if (calculatedAverage >= 75) {
      classStanding = 'High Honors Roll - Distinction';
    } else if (calculatedAverage >= 65) {
      classStanding = 'Honors Standing - Upper Credit';
    } else if (calculatedAverage >= 50) {
      classStanding = 'Credit Standing - Satisfactory';
    } else {
      classStanding = 'Remedial Standing - Academic Probation';
    }
  }

  // Use stored promotion status if provided, otherwise compute standard decision
  let promotionStatus = savedResult?.promotionStatus;
  if (!promotionStatus || !promotionStatus.trim()) {
    promotionStatus = computePromotionStatus(
      savedResult?.classLevel || 'SS 2',
      savedResult?.terminalAverage !== undefined ? savedResult.terminalAverage : calculatedAverage,
      failedSubjectsCount,
      savedResult?.term
    );
  }

  return {
    grossTotalMarks: savedResult?.grossTotalMarks !== undefined ? savedResult.grossTotalMarks : calculatedGrossTotal,
    totalMaxMarks,
    terminalAverage: savedResult?.terminalAverage !== undefined ? savedResult.terminalAverage : calculatedAverage,
    gradePoint: savedResult?.gradePoint !== undefined ? savedResult.gradePoint : calculatedGPA,
    accreditedGradeBracket,
    classStanding,
    promotionStatus,
    totalSubjects,
  };
}

/**
 * Standard curriculum subjects for Junior Secondary (JSS 1 - JSS 3)
 */
export const STANDARD_JUNIOR_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Basic Science',
  'Basic Technology',
  'Civic Education',
  'Social Studies',
  'Christian Religious Studies (CRS)',
  'Agricultural Science',
  'Computer Studies / ICT',
  'Business Studies',
  'Physical & Health Education (PHE)',
  'Igbo Language'
];

/**
 * Standard curriculum subjects for Senior Secondary (SS 1 - SS 3)
 */
export const STANDARD_SENIOR_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Civic Education',
  'Computer Science / ICT',
  'Agricultural Science',
  'Literature in English',
  'Further Mathematics',
  'Christian Religious Studies (CRS)',
  'Government'
];

/**
 * Calculate cumulative metrics for a single subject across 1st, 2nd, and 3rd terms
 */
export function computeCumulativeSubjectMetrics(
  term1?: number,
  term2?: number,
  term3?: number
): {
  cumulativeTotal: number;
  cumulativeAverage: number;
  grade: string;
  remark: string;
  termsCount: number;
} {
  const scores: number[] = [];
  if (term1 !== undefined && term1 !== null && !isNaN(term1)) scores.push(Math.min(100, Math.max(0, Number(term1))));
  if (term2 !== undefined && term2 !== null && !isNaN(term2)) scores.push(Math.min(100, Math.max(0, Number(term2))));
  if (term3 !== undefined && term3 !== null && !isNaN(term3)) scores.push(Math.min(100, Math.max(0, Number(term3))));

  const termsCount = scores.length || 1;
  const cumulativeTotal = scores.reduce((sum, val) => sum + val, 0);
  const cumulativeAverage = Number((cumulativeTotal / (scores.length || 1)).toFixed(1));

  const { grade, remark } = getGradeFromScore(cumulativeAverage);

  return {
    cumulativeTotal,
    cumulativeAverage,
    grade,
    remark,
    termsCount: scores.length
  };
}

export interface CumulativeSessionEvaluation {
  sessionGrossTotal: number;
  sessionTotalMaxMarks: number;
  sessionAverage: number;
  gradePoint: number;
  accreditedGradeBracket: string;
  classStanding: string;
  promotionStatus: string;
  totalSubjects: number;
}

/**
 * Calculate session cumulative aggregate metrics from an array of multi-term subject scores
 */
export function computeSessionCumulativeMetrics(
  subjectScores: SubjectScore[],
  studentMeta?: Partial<StudentResult>
): CumulativeSessionEvaluation {
  const totalSubjects = subjectScores.length || 1;

  // Calculate gross total across cumulative averages or totals
  const totalCumulativeAverages = subjectScores.reduce((sum, s) => {
    const avg = s.cumulativeAverage !== undefined 
      ? s.cumulativeAverage 
      : (s.totalScore || 0);
    return sum + Number(avg);
  }, 0);

  const sessionAverage = Number((totalCumulativeAverages / totalSubjects).toFixed(2));
  const sessionGrossTotal = Math.round(totalCumulativeAverages);
  const sessionTotalMaxMarks = totalSubjects * 100;

  // Grade point average (out of 5.0)
  const totalGradePoints = subjectScores.reduce((sum, s) => {
    const avg = s.cumulativeAverage !== undefined ? s.cumulativeAverage : (s.totalScore || 0);
    const { gradePoint } = getGradeFromScore(avg);
    return sum + gradePoint;
  }, 0);
  const gradePoint = Number((totalGradePoints / totalSubjects).toFixed(2));

  // Accredited grade bracket
  let accreditedGradeBracket = studentMeta?.accreditedGradeBracket;
  if (!accreditedGradeBracket) {
    if (sessionAverage >= 75) accreditedGradeBracket = 'Distinction (A1) - Session Honors';
    else if (sessionAverage >= 65) accreditedGradeBracket = 'Upper Credit (B2-B3) - Superior Standing';
    else if (sessionAverage >= 50) accreditedGradeBracket = 'Credit (C4-C6) - Satisfactory Standing';
    else if (sessionAverage >= 40) accreditedGradeBracket = 'Pass (P7-P8) - Conditional Advancement';
    else accreditedGradeBracket = 'Fail (F9) - Repeat Recommended';
  }

  // Class standing
  let classStanding = studentMeta?.classStanding;
  if (!classStanding) {
    if (sessionAverage >= 85) classStanding = 'Principal\'s Honor List - First Class Cumulative';
    else if (sessionAverage >= 75) classStanding = 'Distinction Roll - Outstanding Academic Year';
    else if (sessionAverage >= 65) classStanding = 'Merit Standing - Commendable Achievement';
    else if (sessionAverage >= 50) classStanding = 'Good Standing - Progression Permitted';
    else classStanding = 'Academic Warning - Remedial Attention Required';
  }

  // Promotion status
  const failedCount = subjectScores.filter(s => {
    const avg = s.cumulativeAverage !== undefined ? s.cumulativeAverage : (s.totalScore || 0);
    return avg < 40;
  }).length;

  let promotionStatus = studentMeta?.promotionStatus;
  if (!promotionStatus || !promotionStatus.trim()) {
    promotionStatus = computePromotionStatus(
      studentMeta?.classLevel || 'SS 2',
      sessionAverage,
      failedCount,
      'Annual Cumulative'
    );
  }

  return {
    sessionGrossTotal,
    sessionTotalMaxMarks,
    sessionAverage,
    gradePoint,
    accreditedGradeBracket,
    classStanding,
    promotionStatus,
    totalSubjects
  };
}

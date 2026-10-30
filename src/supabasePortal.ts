/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Production Default Supabase credentials for seamless multi-device auto-connection
export const DEFAULT_SUPABASE_URL = "https://deqdcwkhzodctbibtspw.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_of-ch6e__VSV6uiE4M4DIg_lvA6rk7Z";

// Retrieve credentials from localStorage (user override via UI), process env, or production defaults
export function getSupabaseCredentials() {
  const metaEnv = (import.meta as any)?.env || {};
  const isExplicitlyDisconnected = typeof window !== 'undefined' && localStorage.getItem('hgass_supabase_disconnected') === 'true';

  let url = (typeof window !== 'undefined' ? localStorage.getItem('hgass_supabase_url') : '') || (metaEnv.VITE_SUPABASE_URL as string) || '';
  let anonKey = (typeof window !== 'undefined' ? localStorage.getItem('hgass_supabase_anon_key') : '') || (metaEnv.VITE_SUPABASE_ANON_KEY as string) || '';

  // If not overridden in localStorage or env, and user has not explicitly clicked disconnect, auto-connect via defaults
  if (!url && !isExplicitlyDisconnected) {
    url = DEFAULT_SUPABASE_URL;
  }
  if (!anonKey && !isExplicitlyDisconnected) {
    anonKey = DEFAULT_SUPABASE_ANON_KEY;
  }
  
  url = url.trim();
  // Strip trailing REST endpoints if accidentally pasted by user
  if (url.endsWith('/rest/v1/')) {
    url = url.slice(0, -9);
  } else if (url.endsWith('/rest/v1')) {
    url = url.slice(0, -8);
  }
  
  return { url, anonKey: anonKey.trim() };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseCredentials();
  return !!(url && anonKey);
}

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Map database column names (snake_case) to state properties (camelCase)
export function mapFromDb(table: string, row: any): any {
  if (!row) return row;
  const mapped: any = { ...row };

  if (table === 'news') {
    mapped.imageUrl = row.image_url;
    mapped.isPublished = row.is_published;
    delete mapped.image_url;
    delete mapped.is_published;
  } else if (table === 'projects') {
    mapped.imageUrl = row.image_url;
    mapped.startDate = row.start_date;
    mapped.expectedCompletionDate = row.expected_completion_date;
    mapped.percentageCompletion = row.percentage_completion;
    delete mapped.image_url;
    delete mapped.start_date;
    delete mapped.expected_completion_date;
    delete mapped.percentage_completion;
  } else if (table === 'gallery') {
    mapped.imageUrl = row.image_url;
    mapped.uploadDate = row.upload_date;
    delete mapped.image_url;
    delete mapped.upload_date;
  } else if (table === 'videos') {
    mapped.uploadDate = row.upload_date;
    delete mapped.upload_date;
  } else if (table === 'documents') {
    mapped.fileType = row.file_type;
    mapped.fileSize = row.file_size;
    mapped.downloadUrl = row.download_url;
    mapped.uploadDate = row.upload_date;
    mapped.accessPassword = row.access_password;
    delete mapped.file_type;
    delete mapped.file_size;
    delete mapped.download_url;
    delete mapped.upload_date;
    delete mapped.access_password;
  } else if (table === 'student_results') {
    mapped.studentId = row.student_id;
    mapped.studentName = row.student_name;
    mapped.classLevel = row.class_level;
    mapped.academicSession = row.academic_session;
    mapped.rollNumber = row.roll_number;
    mapped.principalRemarks = row.principal_remarks || '';
    mapped.teacherRemarks = row.teacher_remarks || '';
    mapped.subjectScores = typeof row.subject_scores === 'string' ? JSON.parse(row.subject_scores) : (row.subject_scores || []);
    mapped.accessPassword = row.access_password;
    if (row.passport_photo) mapped.passportPhoto = row.passport_photo;
    if (row.promotion_status) mapped.promotionStatus = row.promotion_status;
    if (row.gross_total_marks !== null && row.gross_total_marks !== undefined) mapped.grossTotalMarks = Number(row.gross_total_marks);
    if (row.terminal_average !== null && row.terminal_average !== undefined) mapped.terminalAverage = Number(row.terminal_average);
    if (row.grade_point !== null && row.grade_point !== undefined) mapped.gradePoint = Number(row.grade_point);
    if (row.accredited_grade_bracket) mapped.accreditedGradeBracket = row.accredited_grade_bracket;
    if (row.class_standing) mapped.classStanding = row.class_standing;
    if (row.pass_fail_status) mapped.passFailStatus = row.pass_fail_status;
    if (row.term === 'Annual Cumulative' || (row.term && String(row.term).toLowerCase().includes('cumulative'))) {
      mapped.isCumulative = true;
    }

    delete mapped.student_id;
    delete mapped.student_name;
    delete mapped.class_level;
    delete mapped.academic_session;
    delete mapped.roll_number;
    delete mapped.principal_remarks;
    delete mapped.teacher_remarks;
    delete mapped.subject_scores;
    delete mapped.access_password;
    delete mapped.passport_photo;
    delete mapped.promotion_status;
    delete mapped.gross_total_marks;
    delete mapped.terminal_average;
    delete mapped.grade_point;
    delete mapped.accredited_grade_bracket;
    delete mapped.class_standing;
    delete mapped.pass_fail_status;
  } else if (table === 'hero_slides') {
    mapped.imageUrl = row.image_url;
    mapped.order = row.slide_order ?? 0;
    delete mapped.image_url;
    delete mapped.slide_order;
  } else if (table === 'subjects') {
    mapped.desc = row.description || row.desc || '';
    mapped.isCore = row.is_core ?? false;
    delete mapped.description;
    delete mapped.is_core;
    delete mapped.syllabus_code;
    delete mapped.display_order;
    delete mapped.department;
    delete mapped.weekly_periods;
    delete mapped.is_active;
    delete mapped.created_at;
    delete mapped.updated_at;
  } else if (table === 'staff') {
    mapped.desc = row.description || row.desc || '';
    mapped.qualifications = row.qualifications || '';
    mapped.image = row.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400';
    delete mapped.description;
    delete mapped.display_order;
    delete mapped.created_at;
    delete mapped.updated_at;
  } else if (table === 'contact_messages') {
    mapped.isRead = row.is_read;
    delete mapped.is_read;
  } else if (table === 'payments') {
    mapped.referenceNumber = row.reference_number;
    mapped.payerName = row.payer_name;
    mapped.payerPhone = row.payer_phone;
    mapped.payerEmail = row.payer_email;
    mapped.studentName = row.student_name;
    mapped.studentId = row.student_id;
    mapped.classLevel = row.class_level;
    mapped.paymentDate = row.payment_date;
    mapped.paymentMethod = row.payment_method;
    mapped.bankReference = row.bank_reference;
    mapped.proofImageUrl = row.proof_image_url;
    mapped.createdAt = row.created_at;
    delete mapped.reference_number;
    delete mapped.payer_name;
    delete mapped.payer_phone;
    delete mapped.payer_email;
    delete mapped.student_name;
    delete mapped.student_id;
    delete mapped.class_level;
    delete mapped.payment_date;
    delete mapped.payment_method;
    delete mapped.bank_reference;
    delete mapped.proof_image_url;
  } else if (table === 'calendar_events') {
    mapped.startDate = row.start_date;
    mapped.endDate = row.end_date || undefined;
    mapped.isImportant = row.is_important ?? false;
    delete mapped.start_date;
    delete mapped.end_date;
    delete mapped.is_important;
  }

  return mapped;
}

export function mapToDb(table: string, item: any): any {
  if (!item) return item;
  const mapped: any = { ...item };

  if (table === 'news') {
    mapped.image_url = item.imageUrl || null;
    mapped.is_published = item.isPublished ?? true;
    delete mapped.imageUrl;
    delete mapped.isPublished;
  } else if (table === 'projects') {
    mapped.image_url = item.imageUrl || null;
    mapped.start_date = item.startDate;
    mapped.expected_completion_date = item.expectedCompletionDate;
    mapped.percentage_completion = item.percentageCompletion || 0;
    delete mapped.imageUrl;
    delete mapped.startDate;
    delete mapped.expectedCompletionDate;
    delete mapped.percentageCompletion;
  } else if (table === 'gallery') {
    mapped.image_url = item.imageUrl;
    mapped.upload_date = item.uploadDate || new Date().toISOString().split('T')[0];
    delete mapped.imageUrl;
    delete mapped.uploadDate;
  } else if (table === 'videos') {
    mapped.upload_date = item.uploadDate || new Date().toISOString().split('T')[0];
    delete mapped.uploadDate;
  } else if (table === 'documents') {
    mapped.file_type = item.fileType;
    mapped.file_size = item.fileSize;
    mapped.download_url = item.downloadUrl;
    mapped.upload_date = item.uploadDate || new Date().toISOString().split('T')[0];
    mapped.access_password = item.accessPassword || null;
    delete mapped.fileType;
    delete mapped.fileSize;
    delete mapped.downloadUrl;
    delete mapped.uploadDate;
    delete mapped.accessPassword;
  } else if (table === 'student_results') {
    const resPayload: any = {
      id: item.id,
      student_id: item.studentId || item.student_id,
      student_name: item.studentName || item.student_name,
      class_level: item.classLevel || item.class_level,
      academic_session: item.academicSession || item.academic_session,
      term: item.term || '1st Term',
      gender: item.gender || 'Male',
      position: item.position || '',
      principal_remarks: item.principalRemarks || item.principal_remarks || '',
      teacher_remarks: item.teacherRemarks || item.teacher_remarks || '',
      subject_scores: item.subjectScores || item.subject_scores || [],
      access_password: item.accessPassword || item.access_password || null,
      passport_photo: item.passportPhoto || item.passport_photo || null,
      promotion_status: item.promotionStatus || item.promotion_status || null,
      gross_total_marks: item.grossTotalMarks !== undefined && item.grossTotalMarks !== null ? item.grossTotalMarks : (item.gross_total_marks !== undefined ? item.gross_total_marks : null),
      terminal_average: item.terminalAverage !== undefined && item.terminalAverage !== null ? item.terminalAverage : (item.terminal_average !== undefined ? item.terminal_average : null),
      grade_point: item.gradePoint !== undefined && item.gradePoint !== null ? item.gradePoint : (item.grade_point !== undefined ? item.grade_point : null),
      accredited_grade_bracket: item.accreditedGradeBracket || item.accredited_grade_bracket || null,
      class_standing: item.classStanding || item.class_standing || null,
      pass_fail_status: item.passFailStatus || item.pass_fail_status || null
    };

    if (item.rollNumber || item.roll_number) {
      resPayload.roll_number = item.rollNumber || item.roll_number;
    }

    return resPayload;
  } else if (table === 'hero_slides') {
    mapped.image_url = item.imageUrl;
    mapped.slide_order = item.order ?? 0;
    delete mapped.imageUrl;
    delete mapped.order;
  } else if (table === 'subjects') {
    mapped.description = item.desc || item.description || '';
    mapped.desc = item.desc || item.description || '';
    mapped.is_core = item.isCore ?? false;
    delete mapped.isCore;
  } else if (table === 'staff') {
    mapped.description = item.desc || item.description || '';
    mapped.desc = item.desc || item.description || '';
    mapped.qualifications = item.qualifications || '';
    mapped.image = item.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400';
    mapped.display_order = item.display_order ?? item.displayOrder ?? 0;
    delete mapped.displayOrder;
  } else if (table === 'contact_messages') {
    mapped.is_read = item.isRead ?? false;
    delete mapped.isRead;
  } else if (table === 'payments') {
    mapped.reference_number = item.referenceNumber;
    mapped.payer_name = item.payerName;
    mapped.payer_phone = item.payerPhone;
    mapped.payer_email = item.payerEmail || null;
    mapped.student_name = item.studentName;
    mapped.student_id = item.studentId || null;
    mapped.class_level = item.classLevel;
    mapped.payment_date = item.paymentDate;
    mapped.payment_method = item.paymentMethod;
    mapped.bank_reference = item.bankReference;
    mapped.proof_image_url = item.proofImageUrl || null;
    delete mapped.referenceNumber;
    delete mapped.payerName;
    delete mapped.payerPhone;
    delete mapped.payerEmail;
    delete mapped.studentName;
    delete mapped.studentId;
    delete mapped.classLevel;
    delete mapped.paymentDate;
    delete mapped.paymentMethod;
    delete mapped.bankReference;
    delete mapped.proofImageUrl;
  } else if (table === 'calendar_events') {
    mapped.start_date = item.startDate;
    mapped.end_date = item.endDate || null;
    mapped.is_important = item.isImportant ?? false;
    delete mapped.startDate;
    delete mapped.endDate;
    delete mapped.isImportant;
  }

  // Remove timestamp or calculated fields from local state before posting
  delete mapped.created_at;
  delete mapped.createdAt;
  delete mapped.updated_at;
  delete mapped.updatedAt;

  return mapped;
}

/**
 * Safe upsert that automatically recovers from PGRST204 errors when a column does not exist
 * in the remote Supabase schema cache (e.g. dropped attendance or legacy columns).
 */
export async function safeUpsertToSupabase(supabase: any, table: string, rows: any[] | any): Promise<{ data: any; error: any }> {
  const isArray = Array.isArray(rows);
  let batch = isArray ? rows.map((r: any) => ({ ...r })) : [{ ...rows }];
  let attempts = 0;

  while (attempts < 6) {
    const res = await supabase.from(table).upsert(isArray ? batch : batch[0]);
    if (!res.error) {
      return res;
    }

    const err = res.error;
    // Check if error is PGRST204 or contains missing column details
    if (err.code === 'PGRST204' || err.message?.includes('schema cache') || err.message?.includes('Could not find')) {
      const match = err.message?.match(/Could not find the '([^']+)' column/i);
      if (match && match[1]) {
        const missingCol = match[1];
        console.warn(`Supabase ${table} table missing column '${missingCol}'; dynamically pruning and retrying upsert`);
        batch = batch.map((r: any) => {
          const copy = { ...r };
          delete copy[missingCol];
          return copy;
        });
        attempts++;
        continue;
      }
    }

    // Return the error if it cannot be auto-pruned
    return res;
  }

  return await supabase.from(table).upsert(isArray ? batch : batch[0]);
}

import { StudentEntity, ClassEntity, SectionEntity, Tenant } from '../../../types';
import { formatDate, toBengaliNumerals } from '../../../utils/format';

/**
 * Exports students list to Excel-compatible CSV with UTF-8 BOM
 */
export function exportStudentsToCSV(
  students: StudentEntity[],
  classes: ClassEntity[],
  sections: SectionEntity[],
  tenant: Tenant
) {
  const classMap = new Map(classes.map((c) => [c.id, c.nameBangla]));
  const sectionMap = new Map(sections.map((s) => [s.id, s.name]));

  const headers = [
    'রোল নম্বর (Roll)',
    'শিক্ষার্থী আইডি (Student ID)',
    'ভর্তি নম্বর (Admission No)',
    'ভর্তির তারিখ (Admission Date)',
    'শিক্ষার্থীর নাম (বাংলা)',
    'Student Name (English)',
    'الاسم بالعربية (Arabic Name)',
    'শ্রেণি / জামাত (Class)',
    'শাখা (Section)',
    'বিভাগ (Department)',
    'শিক্ষাবর্ষ (Session)',
    'দাখিলা নম্বর (Dakhila No)',
    'রেজিস্ট্রেশন নম্বর (Reg No)',
    'বায়োমেট্রিক আইডি (Biometric ID)',
    'লিঙ্গ (Gender)',
    'জন্ম তারিখ (Date of Birth)',
    'রক্তের গ্রুপ (Blood Group)',
    'ধর্ম (Religion)',
    'জন্ম নিবন্ধন নম্বর (Birth Certificate No)',
    'পূর্ববর্তী শিক্ষা প্রতিষ্ঠান (Previous Institution)',
    'পিতার নাম (Father Name)',
    'পিতার পেশা (Father Occupation)',
    'পিতার মোবাইল (Father Mobile)',
    'পিতার এনআইডি (Father NID)',
    'মাতার নাম (Mother Name)',
    'মাতার পেশা (Mother Occupation)',
    'মাতার মোবাইল (Mother Mobile)',
    'অভিভাবকের নাম (Guardian Name)',
    'সম্পর্ক (Relation)',
    'অভিভাবকের মোবাইল (Guardian Mobile)',
    'অভিভাবকের এনআইডি (Guardian NID)',
    'বর্তমান ঠিকানা (Present Address)',
    'স্থায়ী ঠিকানা (Permanent Address)',
    'আবাসিক স্ট্যাটাস (Residential)',
    'ছাত্রাবাস / হল (Residence Hall)',
    'কক্ষ ও সিট (Room & Seat)',
    'শিক্ষার্থীর অবস্থা (Status)',
  ];

  const rows = students.map((std) => {
    const className = classMap.get(std.classId) || std.className || '';
    const sectionName = sectionMap.get(std.sectionId) || std.sectionName || '';
    const residentialText = std.isResidential ? 'আবাসিক' : 'অনাবাসিক';
    const statusText = {
      ACTIVE: 'সক্রিয় (Active)',
      INACTIVE: 'নিষ্ক্রিয় (Inactive)',
      TRANSFERRED: 'ছাড়পত্রপ্রাপ্ত (Transferred)',
      GRADUATED: 'উত্তীর্ণ / ফারেগ (Graduated)',
      EXPELLED: 'বহিষ্কৃত (Expelled)',
      DROPPED: 'বাতিল (Dropped)',
    }[std.status] || std.status;

    return [
      std.rollNo,
      std.studentIdCardNo || '',
      std.admissionNo || '',
      std.admissionDate || '',
      std.nameBangla || '',
      std.nameEnglish || '',
      std.nameArabic || '',
      className,
      sectionName,
      std.department || '',
      std.sessionName || '1446-1447 হি. / 2025-2026',
      std.dakhilaNo || '',
      std.registrationNo || '',
      std.biometricId || '',
      std.gender === 'FEMALE' ? 'মহিলা' : 'পুরুষ',
      std.dateOfBirth || '',
      std.bloodGroup || '',
      std.religion || 'ইসলাম',
      std.birthCertificateNo || '',
      std.previousInstitution || '',
      std.fatherName || '',
      std.fatherOccupation || '',
      std.fatherMobile || '',
      std.fatherNid || '',
      std.motherName || '',
      std.motherOccupation || '',
      std.motherMobile || '',
      std.guardianName || '',
      std.guardianRelation || 'পিতা',
      std.guardianMobile || '',
      std.guardianNid || '',
      std.presentAddress || '',
      std.permanentAddress || std.presentAddress || '',
      residentialText,
      std.residenceHall || '',
      std.roomNo ? `কক্ষ: ${std.roomNo}, সিট: ${std.bedNo || 'N/A'}` : '',
      statusText,
    ];
  });

  // Convert to CSV with escaping
  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel to recognize Bangla characters
    [headers, ...rows]
      .map((row) =>
        row
          .map((field) => {
            const str = String(field ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeMadrasahName = tenant.nameBangla.replace(/[/\\?%*:|"<>]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  link.setAttribute('href', url);
  link.setAttribute('download', `শিক্ষার্থী_তালিকা_${safeMadrasahName}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a dedicated print view for the student list
 */
export function printStudentListReport(
  students: StudentEntity[],
  classes: ClassEntity[],
  sections: SectionEntity[],
  tenant: Tenant
) {
  const classMap = new Map(classes.map((c) => [c.id, c.nameBangla]));
  const sectionMap = new Map(sections.map((s) => [s.id, s.name]));

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('পপ-আপ উইন্ডো ব্লক করা হয়েছে। অনুগ্রহ করে ব্রাউজার সেটিংস থেকে অনুমতি দিন।');
    return;
  }

  const rowsHtml = students
    .map(
      (std, idx) => `
    <tr>
      <td style="text-align: center; font-weight: bold;">${toBengaliNumerals(idx + 1)}</td>
      <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${toBengaliNumerals(std.rollNo)}</td>
      <td style="font-family: monospace; font-size: 11px;">${std.studentIdCardNo}</td>
      <td style="font-weight: 600;">
        ${std.nameBangla}
        <div style="font-size: 10px; color: #64748b;">${std.nameEnglish || ''}</div>
      </td>
      <td>${classMap.get(std.classId) || std.className || '-'}</td>
      <td>${sectionMap.get(std.sectionId) || std.sectionName || '-'}</td>
      <td>
        <div>${std.guardianName || std.fatherName || '-'}</div>
        <div style="font-size: 11px; font-family: monospace; color: #475569;">${std.guardianMobile || '-'}</div>
      </td>
      <td style="text-align: center;">${std.bloodGroup || '-'}</td>
      <td style="text-align: center;">${std.isResidential ? '<span style="color:#059669;font-weight:bold;">আবাসিক</span>' : 'অনাবাসিক'}</td>
      <td style="text-align: center;">${std.status === 'ACTIVE' ? 'সক্রিয়' : std.status}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>শিক্ষার্থীদের তালিকা - ${tenant.nameBangla}</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { font-family: 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', Arial, sans-serif; font-size: 12px; color: #0f172a; margin: 0; padding: 0; }
        .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
        .madrasah-title { font-size: 22px; font-weight: bold; color: #065f46; margin: 0; }
        .madrasah-sub { font-size: 13px; color: #475569; margin-top: 4px; }
        .report-title { font-size: 15px; font-weight: bold; background: #f1f5f9; display: inline-block; padding: 4px 16px; border-radius: 4px; margin-top: 8px; border: 1px solid #cbd5e1; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11.5px; }
        th { background-color: #f8fafc; font-weight: bold; text-align: left; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; padding-top: 40px; font-size: 11px; }
        .signature-line { border-top: 1px dashed #64748b; width: 160px; text-align: center; padding-top: 4px; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="madrasah-title">${tenant.nameBangla}</h1>
        <div class="madrasah-sub">${tenant.nameEnglish || ''} | ${tenant.address}, ${tenant.district} | ফোন: ${tenant.phone}</div>
        <div class="report-title">শিক্ষার্থীদের পূর্ণাঙ্গ তালিকা ও বিবরণী (মোট: ${toBengaliNumerals(students.length)} জন)</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 30px; text-align: center;">ক্র.</th>
            <th style="width: 40px; text-align: center;">রোল</th>
            <th style="width: 100px;">আইডি নং</th>
            <th>শিক্ষার্থীর নাম</th>
            <th>শ্রেণি / জামাত</th>
            <th>শাখা</th>
            <th>অভিভাবক ও মোবাইল</th>
            <th style="width: 50px; text-align: center;">রক্ত</th>
            <th style="width: 60px; text-align: center;">আবাসন</th>
            <th style="width: 60px; text-align: center;">অবস্থা</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="footer">
        <div class="signature-line">প্রস্তুতকারক (অফিস সহকারী)</div>
        <div class="signature-line">নাজেমে তা'লীমাত (শিক্ষা সচিব)</div>
        <div class="signature-line">মুহতামিম / প্রিন্সিপাল</div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

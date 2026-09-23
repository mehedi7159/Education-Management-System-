import {
  GradeRule,
  GradingSystemConfig,
  GradeConfigEntity,
  SubjectMarkItem,
  ResultEntity,
  ClassPerformanceSummary,
  SubjectPerformanceItem,
} from '../types';

/**
 * Evaluates an individual percentage against the configured dynamic grading rules.
 * No hardcoded thresholds: uses the rules array supplied by the tenant's configuration.
 */
export function evaluateGradeByRules(
  percentage: number,
  rules: GradeRule[],
  defaultPassPercentage: number = 33
): {
  gradeBangla: string;
  gradeEnglish: string;
  gpaPoint: number;
  isPassing: boolean;
  remarksBn: string;
  colorTag?: string;
} {
  const sortedRules = [...rules].sort((a, b) => b.minPercentage - a.minPercentage);

  for (const rule of sortedRules) {
    if (percentage >= rule.minPercentage) {
      return {
        gradeBangla: rule.gradeBangla || rule.gradeName || 'উত্তীর্ণ',
        gradeEnglish: rule.gradeEnglish || rule.gradeNameEnglish || 'Passed',
        gpaPoint: rule.gpaPoint !== undefined ? rule.gpaPoint : (rule.isPassing ? 3.0 : 0.0),
        isPassing: rule.isPassing ?? (percentage >= defaultPassPercentage),
        remarksBn: rule.remarksBn || '',
        colorTag: rule.colorTag,
      };
    }
  }

  // Fallback for 0 or sub-zero
  const lowestRule = sortedRules[sortedRules.length - 1];
  if (lowestRule) {
    return {
      gradeBangla: lowestRule.gradeBangla || lowestRule.gradeName || 'রাসিব / F',
      gradeEnglish: lowestRule.gradeEnglish || lowestRule.gradeNameEnglish || 'Failed',
      gpaPoint: lowestRule.gpaPoint !== undefined ? lowestRule.gpaPoint : 0,
      isPassing: lowestRule.isPassing ?? false,
      remarksBn: lowestRule.remarksBn || 'অনুত্তীর্ণ',
      colorTag: lowestRule.colorTag || 'rose',
    };
  }

  return {
    gradeBangla: percentage >= defaultPassPercentage ? 'মাকবুল' : 'রাসিব',
    gradeEnglish: percentage >= defaultPassPercentage ? 'Pass' : 'Fail',
    gpaPoint: percentage >= defaultPassPercentage ? 2.0 : 0,
    isPassing: percentage >= defaultPassPercentage,
    remarksBn: '',
  };
}

/**
 * Computes individual subject evaluation
 */
export function calculateSubjectResult(
  subject: {
    subjectId: string;
    subjectName: string;
    subjectCode?: string;
    fullMarks: number;
    passMarks: number;
    writtenMarks?: number;
    oralMarks?: number;
    mcqMarks?: number;
    practicalMarks?: number;
    obtainedMarks?: number;
  },
  gradingRules: GradeRule[],
  passMarkPercentage: number
): SubjectMarkItem {
  const full = subject.fullMarks > 0 ? subject.fullMarks : 100;
  const pass = subject.passMarks > 0 ? subject.passMarks : Math.round(full * (passMarkPercentage / 100));

  let obtained = subject.obtainedMarks;
  if (obtained === undefined) {
    obtained =
      (subject.writtenMarks || 0) +
      (subject.oralMarks || 0) +
      (subject.mcqMarks || 0) +
      (subject.practicalMarks || 0);
  }

  const percentage = Math.min(100, Math.max(0, Math.round((obtained / full) * 100)));
  const evaluated = evaluateGradeByRules(percentage, gradingRules, passMarkPercentage);

  // Subject is passed only if obtained meets or exceeds subject pass marks AND rule is passing
  const isPassed = obtained >= pass && evaluated.isPassing;

  return {
    subjectId: subject.subjectId,
    subjectName: subject.subjectName,
    subjectCode: subject.subjectCode,
    fullMarks: full,
    passMarks: pass,
    writtenMarks: subject.writtenMarks,
    oralMarks: subject.oralMarks,
    mcqMarks: subject.mcqMarks,
    practicalMarks: subject.practicalMarks,
    obtainedMarks: obtained,
    percentage,
    grade: evaluated.gradeEnglish,
    gradeBangla: evaluated.gradeBangla,
    gpaPoint: isPassed ? evaluated.gpaPoint : 0,
    isPassed,
    remarks: evaluated.remarksBn,
  };
}

/**
 * Calculates complete student result from subject marks and dynamic grading system
 */
export function calculateStudentOverallResult(
  studentInfo: {
    id: string;
    tenantId: string;
    examId: string;
    examName?: string;
    examTerm?: string;
    academicYear?: string | number;
    studentId: string;
    studentName: string;
    studentNameEnglish?: string;
    studentNameArabic?: string;
    rollNo: number;
    classId?: string;
    className: string;
    sectionId?: string;
    sectionName?: string;
    guardianName?: string;
    guardianMobile?: string;
  },
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    subjectCode?: string;
    fullMarks: number;
    passMarks: number;
    writtenMarks?: number;
    oralMarks?: number;
    mcqMarks?: number;
    practicalMarks?: number;
    obtainedMarks?: number;
  }>,
  gradingConfig: GradingSystemConfig | GradeConfigEntity,
  status: 'DRAFT' | 'REVIEWED' | 'PUBLISHED' = 'DRAFT'
): ResultEntity {
  const rules = gradingConfig.rules || [];
  const passPct = gradingConfig.passMarkPercentage || 33;

  const subjectResults: SubjectMarkItem[] = subjects.map((sub) =>
    calculateSubjectResult(sub, rules, passPct)
  );

  const totalFullMarks = subjectResults.reduce((acc, curr) => acc + curr.fullMarks, 0);
  const totalObtainedMarks = subjectResults.reduce((acc, curr) => acc + curr.obtainedMarks, 0);

  const overallPercentage =
    totalFullMarks > 0 ? Math.round((totalObtainedMarks / totalFullMarks) * 100) : 0;

  const failedSubjects = subjectResults.filter((s) => !s.isPassed);
  const failedSubjectCount = failedSubjects.length;

  const overallEvaluation = evaluateGradeByRules(overallPercentage, rules, passPct);

  // In standard academic systems, if any subject is failed, the overall status is FAIL and GPA is 0
  const isOverallPassed = failedSubjectCount === 0 && overallPercentage >= passPct;

  // Average GPA across subjects
  const totalGpaPoints = subjectResults.reduce((acc, curr) => acc + curr.gpaPoint, 0);
  const calculatedGpa =
    subjectResults.length > 0 && isOverallPassed
      ? Number((totalGpaPoints / subjectResults.length).toFixed(2))
      : 0;

  const finalGrade = isOverallPassed ? overallEvaluation.gradeEnglish : 'F';
  const finalGradeBangla = isOverallPassed ? overallEvaluation.gradeBangla : 'রাসিব (Fail)';
  const displayGpaOrGrade = isOverallPassed
    ? `${finalGradeBangla} (GPA: ${calculatedGpa.toFixed(2)})`
    : 'রাসিব (Fail)';

  return {
    id: `res-${studentInfo.examId}-${studentInfo.studentId}`,
    tenantId: studentInfo.tenantId,
    examId: studentInfo.examId,
    examName: studentInfo.examName || 'বার্ষিক পরীক্ষা',
    examTerm: studentInfo.examTerm || 'বার্ষিক',
    academicYear: studentInfo.academicYear || new Date().getFullYear(),
    studentId: studentInfo.studentId,
    studentName: studentInfo.studentName,
    studentNameEnglish: studentInfo.studentNameEnglish,
    studentNameArabic: studentInfo.studentNameArabic,
    rollNo: studentInfo.rollNo,
    classId: studentInfo.classId,
    className: studentInfo.className,
    sectionId: studentInfo.sectionId,
    sectionName: studentInfo.sectionName,
    guardianName: studentInfo.guardianName,
    guardianMobile: studentInfo.guardianMobile,
    totalMarks: totalFullMarks,
    obtainedMarks: totalObtainedMarks,
    percentage: overallPercentage,
    gpa: calculatedGpa,
    grade: finalGrade,
    gradeBangla: finalGradeBangla,
    gpaOrGrade: displayGpaOrGrade,
    passed: isOverallPassed,
    failedSubjectCount,
    subjectMarks: subjectResults,
    remarks: isOverallPassed
      ? overallEvaluation.remarksBn || 'পরবর্তী জামাতে উত্তীর্ণ'
      : `${failedSubjectCount} বিষয়ে অনুত্তীর্ণ`,
    status,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Sorts and assigns merit positions to a batch of class results
 */
export function rankClassResults(results: ResultEntity[]): ResultEntity[] {
  // Sort priority:
  // 1. Passed students ahead of failed students
  // 2. Higher total obtained marks
  // 3. Higher GPA
  // 4. Lower roll number
  const sorted = [...results].sort((a, b) => {
    if (a.passed !== b.passed) {
      return a.passed ? -1 : 1;
    }
    if (b.obtainedMarks !== a.obtainedMarks) {
      return b.obtainedMarks - a.obtainedMarks;
    }
    if ((b.gpa || 0) !== (a.gpa || 0)) {
      return (b.gpa || 0) - (a.gpa || 0);
    }
    return a.rollNo - b.rollNo;
  });

  return sorted.map((res, index) => ({
    ...res,
    position: res.passed ? index + 1 : undefined,
  }));
}

/**
 * Computes deep Class Performance and Subject-wise Analytics
 */
export function computeClassPerformance(
  classResults: ResultEntity[],
  examId: string,
  examName: string,
  classId: string,
  className: string
): ClassPerformanceSummary {
  const totalStudents = classResults.length;
  const appearedStudents = classResults.filter((r) => r.obtainedMarks > 0 || r.subjectMarks?.length).length;
  const passedStudents = classResults.filter((r) => r.passed).length;
  const failedStudents = totalStudents - passedStudents;
  const passRate = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;

  const obtainedArray = classResults.map((r) => r.obtainedMarks);
  const highestMarks = obtainedArray.length > 0 ? Math.max(...obtainedArray) : 0;
  const lowestMarks = obtainedArray.length > 0 ? Math.min(...obtainedArray) : 0;
  const totalObtainedSum = obtainedArray.reduce((a, b) => a + b, 0);
  const averageMarks = totalStudents > 0 ? Math.round(totalObtainedSum / totalStudents) : 0;

  const totalGpaSum = classResults.reduce((a, b) => a + (b.gpa || 0), 0);
  const averageGpa = totalStudents > 0 ? Number((totalGpaSum / totalStudents).toFixed(2)) : 0;

  // Grade distribution
  const gradeDistribution: Record<string, number> = {};
  for (const res of classResults) {
    const g = res.gradeBangla || res.grade || (res.passed ? 'উত্তীর্ণ' : 'রাসিব');
    gradeDistribution[g] = (gradeDistribution[g] || 0) + 1;
  }

  // Subject Performances map
  const subjectMap = new Map<
    string,
    {
      subjectId: string;
      subjectName: string;
      fullMarks: number;
      passMarks: number;
      marksList: number[];
      passCount: number;
      failCount: number;
    }
  >();

  for (const res of classResults) {
    if (res.subjectMarks && res.subjectMarks.length > 0) {
      for (const sm of res.subjectMarks) {
        if (!subjectMap.has(sm.subjectId)) {
          subjectMap.set(sm.subjectId, {
            subjectId: sm.subjectId,
            subjectName: sm.subjectName,
            fullMarks: sm.fullMarks,
            passMarks: sm.passMarks,
            marksList: [],
            passCount: 0,
            failCount: 0,
          });
        }
        const item = subjectMap.get(sm.subjectId)!;
        item.marksList.push(sm.obtainedMarks);
        if (sm.isPassed) {
          item.passCount++;
        } else {
          item.failCount++;
        }
      }
    }
  }

  const subjectPerformances: SubjectPerformanceItem[] = Array.from(subjectMap.values()).map(
    (item) => {
      const avg =
        item.marksList.length > 0
          ? Math.round(item.marksList.reduce((a, b) => a + b, 0) / item.marksList.length)
          : 0;
      const high = item.marksList.length > 0 ? Math.max(...item.marksList) : 0;
      const low = item.marksList.length > 0 ? Math.min(...item.marksList) : 0;
      const rate =
        item.marksList.length > 0
          ? Math.round((item.passCount / item.marksList.length) * 100)
          : 0;

      return {
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        fullMarks: item.fullMarks,
        passMarks: item.passMarks,
        averageMarks: avg,
        highestMarks: high,
        lowestMarks: low,
        passCount: item.passCount,
        failCount: item.failCount,
        passRate: rate,
      };
    }
  );

  // Top Performers (Up to 5)
  const topPerformers = classResults
    .filter((r) => r.passed)
    .sort((a, b) => (b.position || 999) - (a.position || 999))
    .slice(0, 5)
    .map((r, idx) => ({
      studentId: r.studentId,
      studentName: r.studentName,
      rollNo: r.rollNo,
      totalObtainedMarks: r.obtainedMarks,
      percentage: r.percentage || 0,
      gpa: r.gpa || 0,
      grade: r.gradeBangla || r.grade || 'মুমতাজ',
      positionInClass: r.position || idx + 1,
    }));

  return {
    classId,
    className,
    examId,
    examName,
    totalStudents,
    appearedStudents,
    passedStudents,
    failedStudents,
    passRate,
    highestMarks,
    lowestMarks,
    averageMarks,
    averageGpa,
    gradeDistribution,
    subjectPerformances,
    topPerformers,
  };
}

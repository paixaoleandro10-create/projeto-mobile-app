export type DashboardTask = {
  id: string;
  title: string;
  subtitle: string;
  progress?: number;
  priority?: "high";
};

export type PerformanceEntry = {
  id: string;
  subject: string;
  detail: string;
  score: string;
  delta: string;
  gradeLabel: string;
  tone: "primary" | "secondary";
};

export type DashboardOverview = {
  weighted_gpa: string;
  progress_percent: number;
  class_rank: string;
};

export type SubjectCard = {
  id: string;
  subject: string;
  teacher: string;
  grade: string;
  average: number;
  accent: "primary" | "tertiary";
  students: number;
};

export type ScheduleEvent = {
  id: string;
  day: number;
  time: string;
  meridiem: "AM" | "PM";
  title: string;
  place: string;
  detail: string;
  priority: "high" | "normal";
};

export type ReportLine = {
  id: string;
  subject: string;
  terms: [string, string, string, string];
  average: string;
  status: "Approved" | "In Progress" | "Exam";
};

export type ReportStudent = {
  name: string;
  class_name: string;
  student_id: string;
};

export type ReportSummary = {
  overall: string;
  status: "Approved" | "In Progress" | "Exam";
};

export type MobileDashboardResponse = {
  overview: DashboardOverview;
  tasks: DashboardTask[];
  performance: PerformanceEntry[];
};

export type MobileSubjectsResponse = {
  subjects: SubjectCard[];
};

export type MobileScheduleResponse = {
  month_label: string;
  default_day: number;
  events: ScheduleEvent[];
};

export type MobileReportResponse = {
  student: ReportStudent;
  summary: ReportSummary;
  lines: ReportLine[];
};

export const dashboardTasks: DashboardTask[] = [
  {
    id: "t1",
    title: "Literature Review",
    subtitle: "Due in 2 days - AP English",
    progress: 66
  },
  {
    id: "t2",
    title: "Chemistry Lab Report",
    subtitle: "Tomorrow - Honors Chemistry",
    progress: 25
  },
  {
    id: "t3",
    title: "Calculus Midterm",
    subtitle: "Friday - AP Calculus BC",
    priority: "high"
  }
];

export const recentPerformance: PerformanceEntry[] = [
  {
    id: "p1",
    subject: "History of Civilizations",
    detail: "Unit 3 Quiz - Oct 12",
    score: "96/100",
    delta: "+2.4% vs avg",
    gradeLabel: "A",
    tone: "primary"
  },
  {
    id: "p2",
    subject: "Computer Science",
    detail: "Logic Flow Project - Oct 10",
    score: "89/100",
    delta: "-0.5% vs avg",
    gradeLabel: "B+",
    tone: "secondary"
  },
  {
    id: "p3",
    subject: "French Literature",
    detail: "Oral Presentation - Oct 08",
    score: "91/100",
    delta: "+1.2% vs avg",
    gradeLabel: "A-",
    tone: "primary"
  }
];

export const subjectsData: SubjectCard[] = [
  {
    id: "s1",
    subject: "Mathematics",
    teacher: "Prof. Alan Turing",
    grade: "A+",
    average: 94,
    accent: "primary",
    students: 12
  },
  {
    id: "s2",
    subject: "Physics",
    teacher: "Dr. Marie Curie",
    grade: "B",
    average: 82,
    accent: "tertiary",
    students: 8
  },
  {
    id: "s3",
    subject: "History",
    teacher: "Prof. Howard Zinn",
    grade: "A",
    average: 89,
    accent: "primary",
    students: 24
  },
  {
    id: "s4",
    subject: "Literature",
    teacher: "Dr. Maya Angelou",
    grade: "B-",
    average: 76,
    accent: "tertiary",
    students: 5
  }
];

export const scheduleEvents: ScheduleEvent[] = [
  {
    id: "e1",
    day: 10,
    time: "09:00",
    meridiem: "AM",
    title: "Chemistry Mid-term Test",
    place: "Room 402",
    detail: "90 mins",
    priority: "high"
  },
  {
    id: "e2",
    day: 10,
    time: "11:30",
    meridiem: "AM",
    title: "Literature Essay Due",
    place: "Online Portal",
    detail: "2,500 words",
    priority: "normal"
  },
  {
    id: "e3",
    day: 14,
    time: "02:00",
    meridiem: "PM",
    title: "Math Study Group",
    place: "Library B",
    detail: "Optional",
    priority: "normal"
  }
];

export const reportLines: ReportLine[] = [
  {
    id: "r1",
    subject: "Mathematics",
    terms: ["8.5", "7.0", "9.0", "8.0"],
    average: "8.1",
    status: "Approved"
  },
  {
    id: "r2",
    subject: "Physics",
    terms: ["6.5", "8.0", "7.5", "6.0"],
    average: "7.0",
    status: "Approved"
  },
  {
    id: "r3",
    subject: "Biology",
    terms: ["9.5", "9.0", "10.0", "-"],
    average: "9.5",
    status: "In Progress"
  },
  {
    id: "r4",
    subject: "Literature",
    terms: ["8.0", "8.5", "9.0", "8.5"],
    average: "8.5",
    status: "Approved"
  },
  {
    id: "r5",
    subject: "Chemistry",
    terms: ["5.5", "6.0", "7.0", "4.5"],
    average: "5.7",
    status: "Exam"
  },
  {
    id: "r6",
    subject: "History",
    terms: ["9.0", "9.0", "8.5", "9.5"],
    average: "9.0",
    status: "Approved"
  }
];

export const dashboardOverview: DashboardOverview = {
  weighted_gpa: "3.84",
  progress_percent: 92,
  class_rank: "Top 5% of Class of 2024"
};

export const reportStudent: ReportStudent = {
  name: "Gabriel Silva",
  class_name: "Senior year",
  student_id: "402839-2"
};

export const reportSummary: ReportSummary = {
  overall: "8.4",
  status: "Approved"
};

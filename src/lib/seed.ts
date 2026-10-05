import type {
  AdminUser,
  Application,
  EventRecord,
  GalleryImage,
  Member,
  Notice,
  SettingsMap,
} from "./types";

/**
 * Seed content for Kanti Science Club.
 *
 * Used in two places:
 *  1. `scripts/seed.mjs` inserts this into a real Supabase database for dev.
 *  2. The data layer falls back to it when no Supabase project is configured,
 *     so the whole site is inspectable before credentials are added.
 *
 * Nothing here is imported by a page component directly — pages always read
 * through `lib/data.ts`, which prefers live database rows.
 */

const IMG = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const seedSettings: SettingsMap = {
  club_name: "Kanti Science Club",
  tagline_en: "A shared effort to bring everyone closer to science.",
  tagline_ne: "विज्ञानमा सबैलाई जोड्ने एक प्रयास!",
  home_highlights:
    "Exhibitions, quizzes & research days\nCoding, AI & hands-on workshops\nOpen to every student, all grades",
  hero_heading: "Where curiosity becomes a habit.",
  hero_text:
    "Kanti Science Club is the science and technology community at Kanti Secondary School, Butwal — a place to ask questions, build things and share what we learn.",
  mission_title: "Science, made by students, for everyone",
  mission_body:
    "KSC brings students together around science and technology through exhibitions, quizzes, seminars, speech and research presentations, inspire sessions, coding events and hackathons.",
  about_intro:
    "Kanti Science Club (KSC) is the science and technology community of Kanti Secondary School, Butwal. We exist so that any student — whatever their class or background — has a real place to explore science.",
  vision:
    "A school where every student feels confident enough to ask a scientific question, test it, and explain what they found to an audience.",
  what_we_do:
    "Through the year we run a science exhibition, general quizzes, speech and research days, inspire sessions with guests, coding and AI programs, art competitions and workshops. Members also help run the club's STEM laboratory and represent the school at national science days.",
  history:
    "The club grew out of informal after-school science gatherings at Kanti Secondary School. What began as a handful of students sharing experiments has become a year-round program of exhibitions, quizzes and research events held in our classrooms and the IT Hall.",
  contact_email: "kantiscienceclub@gmail.com",
  facebook_url: "",
  meeting_location: "Kanti Secondary School, Butwal — Science Lab and IT Hall",
  logo_url: "",
  favicon_url: "",
  seo_title: "Kanti Science Club — Kanti Secondary School, Butwal",
  seo_description:
    "The official science and technology club of Kanti Secondary School, Butwal. Events, exhibitions, quizzes, research and a student community built around curiosity.",
  og_image_url: IMG("photo-1532094349884-543bc11b234d", 1200),
};

export const seedMembers: Member[] = [
  {
    id: "m-001",
    name: "Aayush Sharma",
    role: "President",
    type: "student",
    session: "2082/2083",
    class: "Grade 11 — Science",
    photo_url: IMG("photo-1633332755192-727a05c4013d", 600),
    sort_order: 1,
    active: true,
    created_at: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "m-002",
    name: "Sneha Gurung",
    role: "Vice President",
    type: "student",
    session: "2082/2083",
    class: "Grade 11 — Science",
    photo_url: IMG("photo-1494790108377-be9c29b29330", 600),
    sort_order: 2,
    active: true,
    created_at: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "m-003",
    name: "Prabin Thapa",
    role: "Secretary",
    type: "student",
    session: "2082/2083",
    class: "Grade 10",
    photo_url: IMG("photo-1500648767791-00dcc994a43e", 600),
    sort_order: 3,
    active: true,
    created_at: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "m-004",
    name: "Bipana K.C.",
    role: "Treasurer",
    type: "student",
    session: "2082/2083",
    class: "Grade 10",
    photo_url: IMG("photo-1531123897727-8f129e1688ce", 600),
    sort_order: 4,
    active: true,
    created_at: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "m-005",
    name: "Rohan Adhikari",
    role: "Programme Coordinator",
    type: "student",
    session: "2082/2083",
    class: "Grade 11 — Science",
    photo_url: IMG("photo-1507003211169-0a1dd7228f2d", 600),
    sort_order: 5,
    active: true,
    created_at: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "m-006",
    name: "Anjali Pandey",
    role: "Media & Documentation",
    type: "student",
    session: "2082/2083",
    class: "Grade 12 — Science",
    photo_url: IMG("photo-1438761681033-6461ffad8d80", 600),
    sort_order: 6,
    active: true,
    created_at: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "m-101",
    name: "Ram Prasad Acharya",
    role: "Club Advisor — Science",
    type: "teacher",
    session: null,
    class: null,
    photo_url: IMG("photo-1560250097-0b93528c311a", 600),
    sort_order: 1,
    active: true,
    created_at: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "m-102",
    name: "Sunita Bhattarai",
    role: "Faculty Coordinator — Computer Science",
    type: "teacher",
    session: null,
    class: null,
    photo_url: IMG("photo-1573496359142-b8d87734a5a2", 600),
    sort_order: 2,
    active: true,
    created_at: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "m-103",
    name: "Krishna Bahadur Rana",
    role: "School Head — Programme Patron",
    type: "teacher",
    session: null,
    class: null,
    photo_url: IMG("photo-1519085360753-af0119f7cbe7", 600),
    sort_order: 3,
    active: true,
    created_at: "2025-01-01T00:00:00.000Z",
  },
];

export const seedEvents: EventRecord[] = [
  {
    id: "e-001",
    title: "KSC Science Exhibition 2083",
    category: "Exhibition",
    description:
      "Our annual open exhibition. Student teams present working models, experiments and research posters across physics, chemistry, biology and computing. Open to all classes and to parents on the final day.",
    date_bs: "2084-01-15",
    date_ad: "2027-04-28",
    venue: "Kanti Secondary School — Science Lab & Courtyard",
    status: "upcoming",
    cover_url: IMG("photo-1532094349884-543bc11b234d"),
    registration_url: null,
    result: null,
    created_at: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "e-002",
    title: "AI / Vibe-Coding Competition",
    category: "Code",
    description:
      "A hands-on build sprint where students pair up to build small working web apps with AI assistance. No prior coding experience required — mentors guide each team through the day.",
    date_bs: "2084-02-02",
    date_ad: "2027-05-16",
    venue: "IT Hall, Kanti Secondary School",
    status: "upcoming",
    cover_url: IMG("photo-1531482615713-2afd69097998"),
    registration_url: null,
    result: null,
    created_at: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "e-003",
    title: "General Science Quiz 2082",
    category: "Quiz",
    description:
      "An inter-house general science quiz across four rounds, covering physics, chemistry, biology, space and current science. Twelve teams from grades 9 to 12 took part.",
    date_bs: "2082-09-05",
    date_ad: "2025-12-20",
    venue: "IT Hall, Kanti Secondary School",
    status: "completed",
    cover_url: IMG("photo-1523240795612-9a054b0db644"),
    registration_url: null,
    result:
      "Team 'Chandra' (Grade 11) won with 86 points. 48 students took part across 12 teams; the quiz is now planned as a termly event.",
    created_at: "2025-11-10T00:00:00.000Z",
  },
  {
    id: "e-004",
    title: "Speech & Research Day",
    category: "Talk",
    description:
      "Students presented short research talks on topics they chose themselves — from local river water quality to the mathematics of music — followed by open questions from the audience.",
    date_bs: "2082-07-18",
    date_ad: "2025-11-03",
    venue: "Kanti Secondary School — Assembly Hall",
    status: "completed",
    cover_url: IMG("photo-1522202176988-66273c2fd55f"),
    registration_url: null,
    result:
      "14 talks delivered. Three were selected for the school's anniversary programme.",
    created_at: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "e-005",
    title: "Inspire Session: Life as a Researcher",
    category: "Inspire",
    description:
      "An informal session with a guest researcher on what scientific work actually looks like day to day, how to read a paper, and how students can start their own small investigations.",
    date_bs: "2082-05-09",
    date_ad: "2025-08-25",
    venue: "Science Lab, Kanti Secondary School",
    status: "completed",
    cover_url: IMG("photo-1552664730-d307ca884978"),
    registration_url: null,
    result: "Around 60 students attended; the Q&A ran well past the scheduled hour.",
    created_at: "2025-08-01T00:00:00.000Z",
  },
  {
    id: "e-006",
    title: "Space Art Competition",
    category: "Art",
    description:
      "A science-art competition inviting students to imagine space missions, exoplanets and the future of space travel. Entries were exhibited alongside the science exhibition.",
    date_bs: "2082-03-21",
    date_ad: "2025-07-06",
    venue: "Art Room, Kanti Secondary School",
    status: "completed",
    cover_url: IMG("photo-1419242902214-272b3f66ee7a"),
    registration_url: null,
    result: "62 entries received; 9 selected for the school calendar.",
    created_at: "2025-06-01T00:00:00.000Z",
  },
  {
    id: "e-007",
    title: "National Science Day Programme",
    category: "Exhibition",
    description:
      "A school-wide programme marking National Science Day with demonstrations, a poster walk and an open laboratory session for junior classes.",
    date_bs: "2081-11-11",
    date_ad: "2025-02-23",
    venue: "Kanti Secondary School — Main Campus",
    status: "completed",
    cover_url: IMG("photo-1507413245164-6160d8298b31"),
    registration_url: null,
    result:
      "Over 300 students visited the poster walk; the club ran nine demonstration stations.",
    created_at: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "e-008",
    title: "STEM Laboratory Open Workshop",
    category: "Inspire",
    description:
      "A postponed hands-on workshop introducing students to the club's STEM laboratory equipment and safe experimentation practices.",
    date_bs: "2083-01-28",
    date_ad: "2026-05-12",
    venue: "STEM Laboratory, Kanti Secondary School",
    status: "postponed",
    cover_url: IMG("photo-1554475901-4538ddfbccc2"),
    registration_url: null,
    result: null,
    created_at: "2026-02-10T00:00:00.000Z",
  },
];

export const seedNotices: Notice[] = [
  {
    id: "n-001",
    title: "Registration open for KSC Science Exhibition 2083",
    body: "Registration for the annual Science Exhibition is now open. Teams of two to four students may register from grades 7 to 12. Each team should submit a short project idea when registering. Project setup day is 2083-01-14 and the exhibition is open to visitors on 2083-01-15. Please speak to your class teacher or any committee member if you need help forming a team.",
    attachment_url: null,
    image_url: IMG("photo-1532094349884-543bc11b234d", 900),
    pinned: true,
    published_at: "2026-03-05T09:00:00.000Z",
  },
  {
    id: "n-002",
    title: "General Science Quiz results published",
    body: "Congratulations to all twelve teams who took part in the General Science Quiz 2082. Team 'Chandra' from Grade 11 took first place with 86 points. Full scores and the round-by-round breakdown are available from the club noticeboard and from the committee. Thank you to every student who helped run the event.",
    attachment_url: null,
    image_url: null,
    pinned: false,
    published_at: "2025-12-22T09:00:00.000Z",
  },
  {
    id: "n-003",
    title: "Club meeting — every Friday, Science Lab",
    body: "Regular club meetings are held every Friday after school in the Science Lab. New members are welcome at any meeting. We plan upcoming programmes, form project teams and share what members have been working on. If you are joining for the first time, look for the KSC noticeboard outside the lab.",
    attachment_url: null,
    image_url: IMG("photo-1552664730-d307ca884978", 900),
    pinned: false,
    published_at: "2025-11-30T09:00:00.000Z",
  },
  {
    id: "n-004",
    title: "AI / Vibe-Coding Competition — mentor sign-up",
    body: "We are looking for senior students and teachers to mentor teams at the upcoming AI / Vibe-Coding Competition. Mentors do not need to be expert programmers — enthusiasm and patience matter more. Sign up with the programme coordinator.",
    attachment_url: null,
    image_url: null,
    pinned: false,
    published_at: "2026-04-02T09:00:00.000Z",
  },
];

export const seedGallery: GalleryImage[] = [
  {
    id: "g-001",
    image_url: IMG("photo-1532094349884-543bc11b234d"),
    caption: "Students setting up their models on exhibition day.",
    alt_text: "Students arranging science exhibition models on tables in a school hall.",
    category: "Exhibition",
    event_id: "e-001",
    uploaded_at: "2026-03-08T00:00:00.000Z",
  },
  {
    id: "g-002",
    image_url: IMG("photo-1567168544646-208fa5d408fb"),
    caption: "A chemistry demonstration during the exhibition.",
    alt_text: "A student pouring liquid into a glass beaker during a chemistry demonstration.",
    category: "Science Day",
    event_id: "e-007",
    uploaded_at: "2026-02-24T00:00:00.000Z",
  },
  {
    id: "g-003",
    image_url: IMG("photo-1523240795612-9a054b0db644"),
    caption: "The General Science Quiz final round.",
    alt_text: "Quiz teams seated at tables with buzzers during a school science quiz.",
    category: "Quiz",
    event_id: "e-003",
    uploaded_at: "2025-12-21T00:00:00.000Z",
  },
  {
    id: "g-004",
    image_url: IMG("photo-1522202176988-66273c2fd55f"),
    caption: "A research talk during Speech & Research Day.",
    alt_text: "A student presenting to classmates in a school hall.",
    category: "Group",
    event_id: "e-004",
    uploaded_at: "2025-11-04T00:00:00.000Z",
  },
  {
    id: "g-005",
    image_url: IMG("photo-1552664730-d307ca884978"),
    caption: "Question and answer at the Inspire Session.",
    alt_text: "Students raising hands to ask questions during an informal talk.",
    category: "Inspire",
    event_id: "e-005",
    uploaded_at: "2025-08-26T00:00:00.000Z",
  },
  {
    id: "g-006",
    image_url: IMG("photo-1419242902214-272b3f66ee7a"),
    caption: "Space-inspired artwork from the art competition.",
    alt_text: "An artwork depicting a star field and planets.",
    category: "Other",
    event_id: "e-006",
    uploaded_at: "2025-07-07T00:00:00.000Z",
  },
  {
    id: "g-007",
    image_url: IMG("photo-1531482615713-2afd69097998"),
    caption: "Teams building together during a coding session.",
    alt_text: "Students working on laptops together at a long table.",
    category: "AI / Vibe-Coding",
    event_id: "e-002",
    uploaded_at: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "g-008",
    image_url: IMG("photo-1503676260728-1c00da094a0b"),
    caption: "Junior students exploring the open laboratory.",
    alt_text: "Younger students looking at laboratory equipment on a bench.",
    category: "Science Day",
    event_id: "e-007",
    uploaded_at: "2026-02-24T00:00:00.000Z",
  },
];

export const seedApplications: Application[] = [
  {
    id: "a-001",
    name: "Nischal Karki",
    class: "Grade 9",
    contact: "9800000001",
    message:
      "I want to join because I have been doing small electronics experiments at home and I would like to work on them with other students.",
    status: "new",
    created_at: "2026-03-11T10:20:00.000Z",
  },
  {
    id: "a-002",
    name: "Srijana Chaudhary",
    class: "Grade 10",
    contact: "srijana@example.com",
    message:
      "I am interested in biology and would like to help organise the next exhibition.",
    status: "reviewed",
    created_at: "2026-03-09T08:05:00.000Z",
  },
];

export const seedAdminUsers: AdminUser[] = [
  { id: "u-001", email: "advisor@kantiscienceclub.example", role: "super_admin" },
  { id: "u-002", email: "committee@kantiscienceclub.example", role: "editor" },
];

export const GALLERY_CATEGORIES = [
  "Exhibition",
  "AI / Vibe-Coding",
  "Group",
  "Inspire",
  "Quiz",
  "Science Day",
  "Other",
] as const;

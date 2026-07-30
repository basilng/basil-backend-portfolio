export const siteConfig = {
  name: "Basil N G",
  role: "Staff Engineer | Senior Java Backend Engineer",
  location: "India",
  email: "basilng.bng@gmail.com",
  description:
    "Staff Engineer and Java backend specialist with 8+ years of experience building secure, resilient and scalable backend systems for payment, financial and enterprise platforms.",
  shortDescription:
    "Designing secure, resilient and observable backend systems with Java and Spring Boot.",
  siteUrl: "https://www.basilng.dev",
  links: {
    github: "https://github.com/basilng",
    linkedin: "https://www.linkedin.com/in/basil-n-g",
    email: "mailto:basilng.bng@gmail.com",
    resume: "/resume/basil-ng-resume.pdf"
  },
  navigation: [
    { label: "About", href: "/#about" },
    { label: "Skills", href: "/#skills" },
    { label: "Experience", href: "/#experience" },
    { label: "Projects", href: "/projects/" },
    { label: "Resume", href: "/resume/" },
    { label: "Contact", href: "/#contact" }
  ]
} as const;

export type NavigationItem = (typeof siteConfig.navigation)[number];

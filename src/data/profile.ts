export interface SkillGroup {
  readonly title: string;
  readonly summary: string;
  readonly skills: readonly string[];
}

export interface Experience {
  readonly role: string;
  readonly company: string;
  readonly location: string;
  readonly start: string;
  readonly end: string;
  readonly highlights: readonly string[];
  readonly technologies: readonly string[];
}

export interface Education {
  readonly qualification: string;
  readonly field: string;
  readonly institution: string;
  readonly location: string;
  readonly start: string;
  readonly end: string;
}

export const skillGroups: readonly SkillGroup[] = [
  {
    title: "Backend engineering",
    summary: "Production Java services, API contracts and maintainable application architecture.",
    skills: [
      "Java 17/21/25",
      "Spring Boot",
      "Spring MVC",
      "Spring Data JPA",
      "Hibernate",
      "REST APIs",
      "OpenAPI"
    ]
  },
  {
    title: "Distributed systems",
    summary: "Service boundaries, failure handling, consistency and asynchronous workflows.",
    skills: [
      "Microservices",
      "Event-driven architecture",
      "Kafka",
      "RabbitMQ",
      "Resilience4j",
      "Transactional outbox",
      "Idempotency"
    ]
  },
  {
    title: "Data and performance",
    summary: "Transactional modelling, query optimisation, caching and performance validation.",
    skills: ["PostgreSQL", "MongoDB", "Redis", "SQL tuning", "JVM tuning", "JMeter", "Flyway"]
  },
  {
    title: "Security and platform",
    summary: "Secure delivery, cloud-native operation and production observability.",
    skills: [
      "Spring Security",
      "OAuth2/OIDC",
      "JWT/JWKS",
      "AWS",
      "Podman/Docker",
      "Kubernetes",
      "GitHub Actions",
      "Prometheus/Grafana"
    ]
  }
] as const;

export const experiences: readonly Experience[] = [
  {
    role: "Staff Engineer",
    company: "Altimetrik",
    location: "India",
    start: "Jul 2024",
    end: "Present",
    highlights: [
      "Own backend delivery for Java and Spring Boot payment services covering REST integrations, reconciliation, AWS messaging and storage.",
      "Integrated a payment gateway that reduced payment failures by 25% and improved transaction reliability.",
      "Validated workloads above 50,000 concurrent users, identified bottlenecks and improved throughput by 30%.",
      "Automated reconciliation through AWS Batch and Lambda, restoring 99.9% master-data consistency and reducing processing time by 70%.",
      "Modernised AWS SDK integrations and enforced IMDSv2 to improve throughput and remove metadata-service exposure."
    ],
    technologies: ["Java", "Spring Boot", "REST", "AWS Lambda", "AWS Batch", "SQS/SNS", "JMeter"]
  },
  {
    role: "Senior Developer",
    company: "SubscribeIT",
    location: "India",
    start: "Aug 2021",
    end: "May 2024",
    highlights: [
      "Re-engineered a legacy payment-processing platform as Spring Boot microservices and REST APIs, reducing processing time by 30%.",
      "Led an eight-engineer team delivering an algorithmic financial platform that exceeded previous benchmarks by 15%.",
      "Migrated critical banking services to AWS-oriented deployment patterns, lowering infrastructure cost by 25% and shortening release cycles by 40%.",
      "Established GitHub Actions pipelines that increased deployment frequency by 300%.",
      "Optimised JVM garbage collection, SQL access paths and latency-sensitive code, reducing peak response time by 20%."
    ],
    technologies: ["Java", "Spring Boot", "Microservices", "AWS", "SQL", "GitHub Actions"]
  },
  {
    role: "Business Technology Analyst",
    company: "Deloitte",
    location: "India",
    start: "Feb 2021",
    end: "Aug 2021",
    highlights: [
      "Delivered Java microservice and REST enhancements while preserving API validation and error-handling standards.",
      "Created unit and service tests that reached 95% coverage and improved regression protection.",
      "Used chaos testing and Splunk diagnostics to validate recovery paths and resolve production defects.",
      "Mentored junior engineers on setup, debugging and testing practices."
    ],
    technologies: ["Java", "Microservices", "REST", "JUnit", "Splunk", "Chaos testing"]
  },
  {
    role: "Software Engineer",
    company: "Zerone Consulting",
    location: "India",
    start: "Sep 2018",
    end: "Jan 2021",
    highlights: [
      "Built enterprise Java backend services, REST/SOAP integrations and data-processing applications.",
      "Developed Hadoop and AWS EMR processing workflows to improve throughput and reduce storage cost.",
      "Automated Linux deployment tasks with shell scripting and improved maintainability using modern Java practices."
    ],
    technologies: ["Java", "REST", "SOAP", "Hadoop", "AWS EMR", "Linux"]
  }
] as const;

export const education: readonly Education[] = [
  {
    qualification: "Master of Computer Application",
    field: "Computer Science",
    institution: "Sree Narayana Gurukulam College of Engineering",
    location: "Ernakulam, Kerala, India",
    start: "Sep 2015",
    end: "Dec 2018"
  },
  {
    qualification: "Bachelor of Computer Application",
    field: "Computer Science",
    institution: "Indira Gandhi College of Arts and Science",
    location: "Kothamangalam, Kerala, India",
    start: "Jun 2012",
    end: "Mar 2015"
  }
] as const;

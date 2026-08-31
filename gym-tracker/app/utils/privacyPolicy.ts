/** Privacy policy content shown in Settings → Help → Privacy Policy */

export const PRIVACY_POLICY_LAST_UPDATED = "August 31, 2026";
export const PRIVACY_CONTACT_EMAIL = "cjreichert9@gmail.com";

import { medicalDisclaimerSections } from "./medicalDisclaimer";

export type PolicySection = { heading?: string; body: string };

export const privacyPolicySections: PolicySection[] = [
  {
    heading: "Introduction",
    body:
      'Summit ("we," "us," or "our") provides a personal workout-tracking mobile and web application (the "App"). This Privacy Policy explains how we collect, use, disclose, and protect information when you use the App. By using the App, you acknowledge this Policy. If you do not agree, please do not use the App.',
  },
  {
    heading: "Account Registration & Consent",
    body:
      "When you create an account, you must affirmatively accept this Privacy Policy (which includes our Health & Medical Disclaimer below) via an in-app checkbox before registration can be completed. By checking that box and creating an account, you acknowledge that you have read, understand, and agree to this Policy and disclaimer.",
  },
  ...medicalDisclaimerSections,
  {
    heading: "Friends & Social Features",
    body:
      "If you use friend invites, you may share a personal invite link with others. When someone accepts your invite and creates an account (or signs in), a mutual friend connection is created so you can view each other's workout progress summaries. You may block any friend at any time; blocking removes the friendship and revokes the blocked user's ability to view your progress. Blocked users cannot re-add you through an old invite unless you choose to unblock them by removing the block (not currently exposed in-app — contact us if needed). Friend features are optional — you are not required to invite anyone or share progress.",
  },
  {
    heading: "Important Notice",
    body:
      "Except where an account email and password are required to create an account, all profile and health-related fields in the App are optional. You may use Summit without providing height, body weight, gender, bio, progress photos, or using friend/social features.",
  },
  {
    heading: "Information We Collect",
    body:
      "We may collect the following categories of information:\n\n• Account data: email address, username, and authentication credentials (passwords are handled by our authentication provider and are not stored in plain text by us).\n\n• Optional profile data: bio, profile photo, height, body weight, and gender—only if you choose to provide them.\n\n• Workout data: routines, exercises, sets, reps, weights, cardio metrics, session notes, timestamps, and optional progress photos.\n\n• Friend connections: if you use invite links, we store friendship relationships and block lists to enable social features.\n\n• Device and usage data: device type, operating system, app version, and diagnostic logs needed to operate and secure the App.\n\n• Preferences: theme, units (lbs/kg), rest-timer settings, and notification preferences stored on your device or account.",
  },
  {
    heading: "How We Use Information",
    body:
      "We use information to:\n\n• Provide, maintain, and improve the App and your workout history.\n\n• Authenticate you and sync data across your devices when you are signed in.\n\n• Send optional notifications (e.g., rest-timer alerts) if you enable them.\n\n• Detect errors, prevent abuse, and protect the security of our services.\n\n• Comply with applicable law and respond to lawful requests.",
  },
  {
    heading: "Artificial Intelligence (AI)",
    body:
      "We do not sell your personal information. However, data you submit may be processed by automated systems, including artificial intelligence or machine-learning tools, to provide App features such as search, recommendations, analytics, or future in-app assistance. Any such processing is limited to what is necessary to deliver or improve the service. You are not required to enable AI-related features where they are offered separately, and optional profile fields remain optional. We do not use optional health-related profile data for automated decisions that produce legal or similarly significant effects without human review where required by law.",
  },
  {
    heading: "Legal Bases (EEA, UK, and Switzerland)",
    body:
      "If you are in the European Economic Area, the United Kingdom, or Switzerland, we process personal data on these legal bases:\n\n• Contract: to provide the App you request.\n\n• Legitimate interests: to secure, improve, and analyze the App in ways that do not override your rights.\n\n• Consent: for optional profile fields, progress photos, notifications, and any optional AI features where consent is required.\n\n• Legal obligation: where we must retain or disclose data to comply with law.",
  },
  {
    heading: "How We Share Information",
    body:
      "We do not sell your personal information. We may share data with:\n\n• Service providers that host databases, authentication, file storage, and infrastructure (e.g., Supabase and cloud hosting providers) under contracts that require them to protect your data and use it only to provide services to us.\n\n• Professional advisers or authorities when required by law, court order, or to protect rights, safety, and security.\n\n• Successors in the event of a merger, acquisition, or asset sale, subject to this Policy.\n\nWe do not share optional profile or workout data with third parties for their independent marketing purposes.",
  },
  {
    heading: "International Data Transfers",
    body:
      "Your information may be processed in the United States and other countries where our service providers operate. When we transfer personal data from the EEA, UK, or Switzerland, we rely on appropriate safeguards such as Standard Contractual Clauses approved by the European Commission or UK authorities, or other mechanisms recognized under applicable law.",
  },
  {
    heading: "Data Retention",
    body:
      "We retain account and workout data for as long as your account is active or as needed to provide the App. If you delete your account, we will delete or anonymize personal data within a reasonable period, except where retention is required for legal, security, or backup purposes.",
  },
  {
    heading: "Security",
    body:
      "We use technical and organizational measures designed to protect personal data, including encryption in transit (HTTPS/TLS), access controls, and row-level security on cloud databases. No method of transmission or storage is 100% secure; we cannot guarantee absolute security.",
  },
  {
    heading: "Your Rights — All Users",
    body:
      "Depending on your location, you may have the right to access, correct, delete, or export your personal data, and to withdraw consent where processing is consent-based. You can update optional profile fields in Settings → Edit Profile and delete your account in Settings → Delete Account. To exercise other rights, contact us at the email below.",
  },
  {
    heading: "European Economic Area & UK (GDPR / UK GDPR)",
    body:
      'If you are in the EEA or UK, you have the right to: access your data; rectify inaccurate data; erase data ("right to be forgotten"); restrict processing; data portability; object to processing based on legitimate interests; and lodge a complaint with your local supervisory authority. Where we rely on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.',
  },
  {
    heading: "California Residents (CCPA / CPRA)",
    body:
      'California residents have the right to know what personal information we collect, use, and disclose; to request deletion; to correct inaccurate information; and to opt out of the "sale" or "sharing" of personal information. We do not sell personal information as defined under California law. We do not use sensitive personal information for purposes other than providing the App. You may designate an authorized agent to submit requests on your behalf. We will not discriminate against you for exercising your privacy rights.',
  },
  {
    heading: "Other U.S. State Privacy Laws",
    body:
      "Residents of Virginia, Colorado, Connecticut, Utah, and other states with comprehensive privacy laws may have similar rights to access, delete, correct, and obtain a copy of personal data. Contact us to exercise applicable rights.",
  },
  {
    heading: "Children's Privacy",
    body:
      "The App is not directed to children under 13 (or under 16 in certain jurisdictions). We do not knowingly collect personal information from children. If you believe a child has provided us data, contact us and we will delete it.",
  },
  {
    heading: "Changes to This Policy",
    body:
      "We may update this Privacy Policy from time to time. We will post the revised version in the App and update the \"Last updated\" date. Material changes may be communicated through the App or by email where required by law.",
  },
  {
    heading: "Contact Us",
    body:
      `For privacy questions or to exercise your rights, contact:\n\nSummit Privacy\nEmail: ${PRIVACY_CONTACT_EMAIL}\n\nWe will respond within the timeframes required by applicable law (typically 30 days for GDPR requests and 45 days for CCPA requests, with permitted extensions where allowed).`,
  },
];

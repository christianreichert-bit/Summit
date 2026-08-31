/** Privacy policy content shown in Settings → Help → Privacy Policy */

export const PRIVACY_POLICY_LAST_UPDATED = "August 31, 2026";
export const PRIVACY_CONTACT_EMAIL = "cjreichert9@gmail.com";

import { medicalDisclaimerSections } from "./medicalDisclaimer";

export type PolicySection = { heading?: string; body: string };

export const privacyPolicySections: PolicySection[] = [
  {
    heading: "Introduction",
    body:
      'Summit ("we," "us," or "our") provides a personal workout-tracking application available on the web (including deployments hosted on services such as Vercel) and through development previews (such as Expo Snack). This Privacy Policy explains how we collect, use, disclose, and protect information when you use the App. By using the App, you acknowledge this Policy. If you do not agree, please do not use the App.',
  },
  {
    heading: "Account Registration & Consent",
    body:
      "When you create an account, you must affirmatively confirm that you meet the minimum age requirement and accept this Privacy Policy (which includes our Health & Medical Disclaimer below) via in-app checkboxes before registration can be completed. By checking those boxes and creating an account, you acknowledge that you have read, understand, and agree to this Policy and disclaimer.",
  },
  ...medicalDisclaimerSections,
  {
    heading: "Friends & Social Features",
    body:
      "If you use friend invites, you may share a personal invite link with others. When someone accepts your invite and creates an account (or signs in), a mutual friend connection is created so you can view each other's profiles and workout progress as described below. You may block any friend at any time; blocking removes the friendship and immediately revokes their access to your profile. Friend features are optional — you are not required to invite anyone or share progress.",
  },
  {
    heading: "Friend Features — What's Shared",
    body:
      "When you accept a friend invitation, the following information becomes visible to that friend: your profile name, avatar, and bio; workout session summaries (date, duration, exercise names performed, and session volume totals); best-lift personal records (squat, deadlift, bench); streak and weekly activity statistics; cardio summaries; and any notes or progress photos you attached to completed workouts. Your email address, password, height, body weight, gender, individual set-by-set data (per-set reps and weights), and any injury or health information you may store outside the shared profile are NOT shared with friends. You may block any friend at any time to immediately revoke their access.",
  },
  {
    heading: "Important Notice",
    body:
      "Except where an account email and password are required to create an account, all profile and health-related fields in the App are optional. You may use Summit without providing height, body weight, gender, bio, progress photos, or using friend/social features.",
  },
  {
    heading: "Information We Collect",
    body:
      "We may collect the following categories of information:\n\n• Account data: email address, username, and authentication credentials (passwords are handled by our authentication provider and are not stored in plain text by us).\n\n• Optional profile data: bio, profile photo, height, body weight, and gender—only if you choose to provide them.\n\n• Workout data: routines, exercises, sets, reps, weights, cardio metrics, session notes, timestamps, and optional progress photos.\n\n• Friend connections: if you use invite links, we store friendship relationships and block lists to enable social features.\n\n• Device and usage data: device type, operating system, app version, and diagnostic logs needed to operate and secure the App.\n\n• Web hosting logs: when you access the web version, our hosting provider (e.g., Vercel) may automatically log technical data such as IP address, browser type, and request timestamps in server logs.\n\n• Preferences: theme, units (lbs/kg), rest-timer settings, profile stat display preferences, and notification preferences stored on your device or account.",
  },
  {
    heading: "How We Use Information",
    body:
      "We use information to:\n\n• Provide, maintain, and improve the App and your workout history.\n\n• Authenticate you and sync data across your devices when you are signed in.\n\n• Enable optional friend and social features when you choose to use them.\n\n• Send optional notifications (e.g., rest-timer alerts) if you enable them.\n\n• Detect errors, prevent abuse, and protect the security of our services.\n\n• Comply with applicable law and respond to lawful requests.",
  },
  {
    heading: "Artificial Intelligence (AI)",
    body:
      "Some App features may use automated processing, including artificial intelligence or machine-learning tools, to provide search, recommendations, analytics, or in-app assistance such as personalized workout plan generation. Any such processing is limited to what is necessary to deliver or improve the service. You are not required to use AI-related features where they are offered separately, and optional profile fields remain optional. We do not use optional health-related profile data for automated decisions that produce legal or similarly significant effects without human review where required by law.",
  },
  {
    heading: "Third-Party AI Processing",
    body:
      "When using AI-assisted features, your workout data, goals, and any optional injury or preference information you submit may be sent to Google's Gemini API for processing. This processing occurs solely to generate personalized workout recommendations or similar AI outputs. Google's Gemini API processes data under Google's privacy policy and terms of service; Google may use data submitted to its API to improve its services. We do not control the AI provider's data practices. No data is sent to the AI provider unless you actively use an AI feature, and you will be asked for separate in-app consent before your first AI request where required. You may opt out of AI features by not using them.",
  },
  {
    heading: "Legal Bases (EEA, UK, and Switzerland)",
    body:
      "If you are in the European Economic Area, the United Kingdom, or Switzerland, we process personal data on these legal bases:\n\n• Contract: to provide the App you request.\n\n• Legitimate interests: to secure, improve, and analyze the App in ways that do not override your rights.\n\n• Consent: for optional profile fields, progress photos, notifications, friend features, and any optional AI features where consent is required.\n\n• Legal obligation: where we must retain or disclose data to comply with law.",
  },
  {
    heading: "How We Share Information",
    body:
      "We do not sell your personal information. We may share data with:\n\n• Service providers that host databases, authentication, file storage, AI APIs (including Google's Gemini API when you use AI features), and infrastructure (e.g., Supabase, Vercel, and cloud hosting providers) under contracts or terms that require them to protect your data and use it only to provide services to us or as disclosed in their policies.\n\n• Friends you connect with through invite links, limited to the information described in \"Friend Features — What's Shared\" above.\n\n• Professional advisers or authorities when required by law, court order, or to protect rights, safety, and security.\n\n• Successors in the event of a merger, acquisition, or asset sale, subject to this Policy.\n\nWe do not share optional profile or workout data with third parties for their independent marketing purposes.",
  },
  {
    heading: "International Data Transfers",
    body:
      "Your information may be processed in the United States and other countries where our service providers operate. When we transfer personal data from the EEA, UK, or Switzerland, we rely on appropriate safeguards such as Standard Contractual Clauses approved by the European Commission or UK authorities, or other mechanisms recognized under applicable law.",
  },
  {
    heading: "Data Retention",
    body:
      "We retain account and workout data for as long as your account is active or as needed to provide the App. If you delete your account, we will delete or anonymize personal data according to the timeframe in \"Data Deletion Timeframe\" below, except where retention is required for legal, security, or backup purposes.",
  },
  {
    heading: "Data Deletion Timeframe",
    body:
      "When you delete your account, all personal data (excluding anonymous, aggregated analytics) will be permanently removed from our active systems within 30 days. Backup copies may persist for up to 90 days in secure storage before being fully deleted.",
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
      'California residents have the right to know what personal information we collect, use, and disclose; to request deletion; to correct inaccurate information; and to opt out of the "sale" or "sharing" of personal information. We do not sell personal information as defined under California law.\n\nWe collect the following categories of sensitive personal information: health and fitness data (workout logs, exercise history, personal records), and optional health-related information (height, weight, gender, and any injury or health notes you choose to provide). This sensitive data is collected and used solely to provide the requested workout tracking, social, and recommendation services you use. We do not use sensitive personal information for purposes beyond those explicitly authorized by you or required to provide the App.\n\nYou may designate an authorized agent to submit requests on your behalf. We will not discriminate against you for exercising your privacy rights.',
  },
  {
    heading: "Other U.S. State Privacy Laws",
    body:
      "Residents of Virginia, Colorado, Connecticut, Utah, and other states with comprehensive privacy laws may have similar rights to access, delete, correct, and obtain a copy of personal data. Contact us to exercise applicable rights.",
  },
  {
    heading: "Children's Privacy",
    body:
      "The App is not directed to children under 13 (or under 16 in certain jurisdictions). During registration, we ask users to confirm they are at least 13 years old (or the applicable age in their jurisdiction). We do not collect age or birthdate information beyond this self-certification. We do not knowingly collect personal information from children. If we become aware that a user under 13 has created an account, we will delete the account and associated data. If you believe a child has provided us data, contact us and we will delete it.",
  },
  {
    heading: "Changes to This Policy",
    body:
      'We may update this Privacy Policy from time to time. We will post the revised version in the App and update the "Last updated" date. Material changes may be communicated through the App or by email where required by law.',
  },
  {
    heading: "Contact Us",
    body:
      `For privacy questions or to exercise your rights, contact:\n\nSummit Privacy\nEmail: ${PRIVACY_CONTACT_EMAIL}\n\nWe will respond within the timeframes required by applicable law (typically 30 days for GDPR requests and 45 days for CCPA requests, with permitted extensions where allowed).`,
  },
];

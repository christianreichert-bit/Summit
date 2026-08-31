/** Health & medical disclaimer — also referenced in Privacy Policy */

export type DisclaimerSection = { heading?: string; body: string };

export const medicalDisclaimerSections: DisclaimerSection[] = [
  {
    heading: "Not Medical Advice",
    body:
      "Summit is a personal fitness and workout logging application only. It is not a medical device, healthcare service, telehealth platform, or substitute for professional medical advice, diagnosis, or treatment. Nothing in the App constitutes medical, nutritional, physical therapy, or other professional health advice.",
  },
  {
    heading: "No Professional Relationship",
    body:
      "Use of Summit does not create a doctor-patient, therapist-client, trainer-client, or any other professional relationship between you and Summit, its developers, owners, affiliates, or contributors. We are not licensed physicians, registered dietitians, certified athletic trainers, or physical therapists.",
  },
  {
    heading: "Consult a Qualified Professional",
    body:
      "Always seek the advice of a qualified physician or other licensed health provider before starting any exercise program, changing your diet, or if you have questions about a medical condition, injury, pregnancy, or post-surgical recovery. Never disregard professional medical advice or delay seeking it because of something you read or track in the App.",
  },
  {
    heading: "Assumption of Risk",
    body:
      "Physical exercise involves inherent risks, including serious injury or death. You voluntarily assume all risks associated with your workouts and use of the App. You are solely responsible for determining whether any exercise, weight, rep scheme, or routine is appropriate for your fitness level and health status.",
  },
  {
    heading: "No Warranties",
    body:
      'The App, workout suggestions, exercise library, progression data, personal records, rest timers, AI-assisted features (if any), and friend-shared progress are provided "as is" and "as available" without warranties of any kind, express or implied, including fitness for a particular purpose or accuracy of logged or displayed data.',
  },
  {
    heading: "Limitation of Liability",
    body:
      "To the fullest extent permitted by applicable law, Summit and its developers, officers, employees, affiliates, and licensors shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of—or inability to use—the App, including but not limited to personal injury, property damage, lost data, or reliance on App content. Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the maximum extent permitted by law.",
  },
  {
    heading: "Emergency Situations",
    body:
      "Summit is not an emergency service. If you think you may have a medical emergency, call your local emergency number immediately (e.g., 911 in the United States) or go to the nearest emergency room.",
  },
  {
    heading: "Accuracy of User-Entered Data",
    body:
      "Workout logs, weights, reps, and progress metrics are entered by users and may contain errors. Summit does not verify the accuracy of user data. Friend-shared progress and statistics are similarly user-generated and should not be relied upon for medical or training decisions.",
  },
];

import emailjs from '@emailjs/browser';

const SERVICE_ID = (import.meta as any).env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY;

export async function sendAssignmentEmail(volunteerEmail: string, volunteerName: string, reportDetails: any) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("EmailJS configuration missing. Skipping email notification.");
    return;
  }

  try {
    const templateParams = {
      to_email: volunteerEmail,
      to_name: volunteerName,
      problem_type: reportDetails.problemType,
      location: reportDetails.location,
      description: reportDetails.description,
      urgency: reportDetails.aiScore
    };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log("Assignment email sent successfully to", volunteerEmail);
  } catch (error) {
    console.error("Error sending assignment email:", error);
  }
}

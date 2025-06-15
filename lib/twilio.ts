import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // This should be your Twilio WhatsApp-enabled number

if (!accountSid || !authToken || !fromPhoneNumber) {
  console.error('Twilio environment variables are not fully configured.');
  // Optionally throw an error to prevent the app from starting/using Twilio if critical
  // throw new Error('Twilio environment variables must be set.');
}

const client = twilio(accountSid, authToken);

interface SendWhatsAppMessageResponse {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendWhatsAppMessage(to: string, body: string): Promise<SendWhatsAppMessageResponse> {
  if (!accountSid || !authToken || !fromPhoneNumber) {
    return { success: false, error: 'Twilio service is not configured.' };
  }

  try {
    // Twilio requires phone numbers in E.164 format (e.g., +14155238886)
    // The 'whatsapp:' prefix is used for WhatsApp messages.
    const message = await client.messages.create({
      from: `whatsapp:${fromPhoneNumber}`,
      to: `whatsapp:${to}`, // Ensure 'to' is in E.164 format
      body: body,
    });
    console.log('WhatsApp message sent successfully. SID:', message.sid);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    // Extracting a more specific error message if available
    const errorMessage = error.message || 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

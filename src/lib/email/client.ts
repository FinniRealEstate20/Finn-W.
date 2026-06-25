import { Resend } from 'resend';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

let cachedClient: Resend | null = null;
function client(): Resend | null {
  if (cachedClient) return cachedClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cachedClient = new Resend(key);
  return cachedClient;
}

function defaultFrom(): string {
  return process.env.EMAIL_FROM ?? 'PropAfterCare <noreply@propaftercare.de>';
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const c = client();
  if (!c) {
    return { ok: false, error: 'RESEND_API_KEY nicht konfiguriert.' };
  }
  try {
    const { data, error } = await c.emails.send({
      from: defaultFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Versand fehlgeschlagen.' };
  }
}

export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

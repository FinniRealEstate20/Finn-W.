interface InvitationEmailInput {
  recipientName?: string | null;
  brokerName: string;
  companyName?: string | null;
  signupUrl: string;
  code: string;
  brandColor?: string | null;
}

const SAFE_COLOR = /^#[0-9a-fA-F]{6}$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface RenderedInvitationEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderInvitationEmail(input: InvitationEmailInput): RenderedInvitationEmail {
  const greetingName = (input.recipientName ?? '').trim();
  const broker = escapeHtml(input.brokerName);
  const company = input.companyName ? escapeHtml(input.companyName) : null;
  const fromLine = company ? `${broker} · ${company}` : broker;
  const color = input.brandColor && SAFE_COLOR.test(input.brandColor)
    ? input.brandColor
    : '#0F766E';
  const link = escapeHtml(input.signupUrl);
  const code = escapeHtml(input.code);
  const hello = greetingName ? `Hallo ${escapeHtml(greetingName)},` : 'Hallo,';

  const subject = company
    ? `Willkommen bei ${company} – Ihr persönlicher Zugang`
    : `Ihr persönlicher Zugang von ${broker}`;

  const html = `<!doctype html>
<html lang="de">
  <body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F172A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;">
          <tr><td style="background:${color};padding:24px 28px;color:#FFFFFF;">
            <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">PropAfterCare</div>
            <div style="font-size:20px;font-weight:600;margin-top:4px;">${fromLine}</div>
          </td></tr>
          <tr><td style="padding:28px;">
            <p style="margin:0 0 16px;font-size:16px;">${hello}</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
              herzlichen Glückwunsch zu Ihrer Immobilie. Damit Sie die ersten Wochen nach dem Notartermin entspannt meistern,
              stelle ich Ihnen kostenfrei Ihren persönlichen Betreuungsbereich zur Verfügung – mit allen Behördenformularen,
              Fristen und einem KI-Assistenten, der Ihre Fragen beantwortet.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr><td>
                <a href="${link}" style="display:inline-block;background:${color};color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:10px;">
                  Jetzt aktivieren
                </a>
              </td></tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#475569;">Ihr Einladungscode (falls Sie den Link manuell öffnen):</p>
            <div style="font-family:'SF Mono',Consolas,monospace;font-size:18px;font-weight:600;letter-spacing:0.08em;padding:12px 16px;background:#F1F5F9;border-radius:8px;display:inline-block;color:#0F172A;">${code}</div>
            <p style="margin:24px 0 0;font-size:13px;line-height:1.55;color:#475569;">
              Der Code ist nur für Sie und einmalig nutzbar. Wenn Sie keine Einladung erwartet haben, können Sie diese Mail einfach ignorieren.
            </p>
          </td></tr>
          <tr><td style="padding:16px 28px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:12px;color:#64748B;">
            Mit besten Grüßen, ${fromLine}
          </td></tr>
        </table>
        <div style="font-size:11px;color:#94A3B8;margin-top:16px;">
          PropAfterCare – Post-Transaction Betreuung für Käufer · Hosted in EU/Frankfurt
        </div>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    hello.replace(/&#39;/g, "'"),
    '',
    'herzlichen Glückwunsch zu Ihrer Immobilie. Damit Sie die ersten Wochen nach',
    'dem Notartermin entspannt meistern, stelle ich Ihnen kostenfrei Ihren',
    'persönlichen Betreuungsbereich zur Verfügung – mit Behördenformularen,',
    'Fristen und einem KI-Assistenten für Ihre Fragen.',
    '',
    `Jetzt aktivieren: ${input.signupUrl}`,
    '',
    `Ihr Einladungscode: ${input.code}`,
    '',
    'Der Code ist nur für Sie und einmalig nutzbar.',
    '',
    `Mit besten Grüßen, ${input.brokerName}${input.companyName ? ` · ${input.companyName}` : ''}`,
    '',
    '— PropAfterCare · Hosted in EU/Frankfurt',
  ].join('\n');

  return { subject, html, text };
}

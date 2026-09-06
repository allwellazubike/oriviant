/**
 * Transactional email via Brevo's REST API.
 */

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendArgs): Promise<boolean> => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn(`[email] BREVO_API_KEY not set — skipping "${subject}" to ${to}`);
    return false;
  }

  // FIX: Read this dynamically inside the function so it catches .env changes!
  const senderEmail = process.env.MAIL_FROM_EMAIL || 'no-reply@oriviant.com';
  const senderName = process.env.MAIL_FROM_NAME || 'Oriviant Trades';

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          email: senderEmail,
          name: senderName,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`[email] ❌ Brevo rejected "${subject}" to ${to}: ${response.status} ${detail}`);
      return false;
    }

    // FIX: Log success so we know Brevo actually received it!
    const data = await response.json();
    console.log(`[email] ✅ Brevo accepted "${subject}" for ${to}. Message ID: ${data.messageId}`);
    return true;
  } catch (error) {
    console.error(`[email] ❌ Could not send "${subject}" to ${to}:`, (error as Error).message);
    return false;
  }
};

/** Shared chrome so every Oriviant email looks like it came from the same place. */
const layout = (heading: string, body: string) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0d1117;padding:32px;">
    <div style="max-width:520px;margin:0 auto;background:#161b22;border:1px solid #262d36;border-radius:16px;padding:32px;color:#e6edf3;">
      <div style="font-size:20px;font-weight:800;letter-spacing:-0.4px;margin-bottom:24px;">Oriviant Trades</div>
      <h1 style="font-size:18px;font-weight:700;margin:0 0 16px;">${heading}</h1>
      ${body}
      <hr style="border:none;border-top:1px solid #262d36;margin:28px 0 16px;" />
      <p style="font-size:11px;color:#7d8590;margin:0;line-height:1.6;">
        This is an automated message from Oriviant Trades. If you were not expecting it,
        you can safely ignore this email — no action will be taken on your account.
      </p>
    </div>
  </div>
`;

export const sendVerificationCode = (to: string, code: string, minutes: number) =>
  sendEmail({
    to,
    subject: 'Verify your Oriviant account',
    html: layout(
      'Verify your email address',
      `<p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0 0 20px;">
         Enter the code below to complete your registration. It expires in ${minutes} minutes.
       </p>
       <div style="font-size:32px;font-weight:800;letter-spacing:10px;text-align:center;
                    background:#0d1117;border:1px solid #262d36;border-radius:12px;
                    padding:20px;color:#3fb950;margin-bottom:20px;">${code}</div>
       <p style="font-size:13px;line-height:1.7;color:#7d8590;margin:0;">
         If you did not sign up for Oriviant, please ignore this email.
       </p>`
    ),
  });

export const sendPasswordResetCode = (to: string, code: string, minutes: number) =>
  sendEmail({
    to,
    subject: 'Your Oriviant password reset code',
    html: layout(
      'Reset your password',
      `<p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0 0 20px;">
         Use the code below to set a new password. It expires in ${minutes} minutes.
       </p>
       <div style="font-size:32px;font-weight:800;letter-spacing:10px;text-align:center;
                    background:#0d1117;border:1px solid #262d36;border-radius:12px;
                    padding:20px;color:#3fb950;margin-bottom:20px;">${code}</div>
       <p style="font-size:13px;line-height:1.7;color:#7d8590;margin:0;">
         If you did not request a password reset, ignore this email and your password stays as it is.
       </p>`
    ),
  });

export const sendDepositPendingEmail = (to: string, amount: number | string, asset: string) =>
  sendEmail({
    to,
    subject: `Deposit submitted — ${amount} ${asset}`,
    html: layout(
      'Deposit request received',
      `<p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0 0 12px;">
         We have received your request to deposit <strong style="color:#3fb950;">${amount} ${asset}</strong>. 
       </p>
       <p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0;">
         Our team is checking the blockchain network, and your balance will update shortly.
       </p>`
    ),
  });

export const sendDepositApproved = (to: string, amount: number | string, asset: string) =>
  sendEmail({
    to,
    subject: `Deposit confirmed — ${amount} ${asset}`,
    html: layout(
      'Your deposit has been credited',
      `<p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0 0 12px;">
         We confirmed your transfer on-chain and credited
         <strong style="color:#3fb950;">${amount} ${asset}</strong> to your Oriviant wallet.
       </p>
       <p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0;">
         The balance is available to trade right away.
       </p>`
    ),
  });

export const sendDepositDenied = (to: string, asset: string) =>
  sendEmail({
    to,
    subject: `We could not confirm your ${asset} deposit`,
    html: layout(
      'Deposit could not be confirmed',
      `<p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0 0 12px;">
         We reviewed your ${asset} deposit request but could not match it to a transfer
         on-chain, so nothing has been credited.
       </p>
       <p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0;">
         If you did send the funds, reply to this email with the transaction hash and we
         will take another look.
       </p>`
    ),
  });

export const sendWithdrawalPendingEmail = (to: string, amount: number | string, asset: string) =>
  sendEmail({
    to,
    subject: `Withdrawal request — ${amount} ${asset}`,
    html: layout(
      'Withdrawal request submitted',
      `<p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0 0 12px;">
         We have received your withdrawal request for <strong style="color:#3fb950;">${amount} ${asset}</strong>.
       </p>
       <p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0;">
         Security verification is in progress. Funds will be sent to your target address once processed.
       </p>`
    ),
  });

export const sendWithdrawalCompletedEmail = (to: string, amount: number | string, asset: string) =>
  sendEmail({
    to,
    subject: `Withdrawal successful — ${amount} ${asset}`,
    html: layout(
      'Withdrawal processed',
      `<p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0 0 12px;">
         Your withdrawal of <strong style="color:#3fb950;">${amount} ${asset}</strong> has been successfully processed and sent on-chain.
       </p>`
    ),
  });

export const sendWithdrawalRejectedEmail = (to: string, amount: number | string, asset: string) =>
  sendEmail({
    to,
    subject: `Withdrawal cancelled — ${amount} ${asset}`,
    html: layout(
      'Withdrawal request cancelled',
      `<p style="font-size:14px;line-height:1.7;color:#c9d1d9;margin:0 0 12px;">
         Your withdrawal request for ${amount} ${asset} was rejected or cancelled. Any deducted funds have been returned to your live wallet.
       </p>`
    ),
  });
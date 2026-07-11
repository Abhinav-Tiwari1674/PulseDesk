import dotenv from 'dotenv';

// Load environment variables immediately to support ES module import sequence
dotenv.config();

// Brevo API Email Sender (HTTP-based, not blocked by Render)
const sendEmailViaBrevo = async ({ to, subject, html }) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER || 'pulsedesk.auth@gmail.com';

    if (!apiKey) {
        console.warn('⚠️ BREVO_API_KEY is missing! Emails will not be sent.');
        return null;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: 'PulseDesk',
                    email: senderEmail
                },
                to: [
                    {
                        email: to
                    }
                ],
                subject,
                htmlContent: html
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || JSON.stringify(data));
        }
        console.log(`📩 Email sent successfully to ${to} via Brevo`);
        return data;
    } catch (error) {
        console.error(`❌ Failed to send email to ${to} via Brevo:`, error.message);
        throw error;
    }
};

/**
 * Send a password reset email via Gmail SMTP.
 * Design uses a professional dark-blue theme.
 */
const sendResetEmail = async ({ to, name, resetUrl }) => {
    const mailOptions = {
        from: `"PulseDesk" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Reset your PulseDesk Password',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#0d1117;border:1px solid #21262d;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:36px 40px 24px;background-color:#0d1117;">
              <div style="width:48px;height:48px;background-color:#1f6feb;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="font-size:24px;font-weight:900;color:#ffffff;line-height:48px;display:block;text-align:center;">P</span>
              </div>
              <h1 style="margin:16px 0 0;font-size:24px;font-weight:700;color:#ffffff;">PulseDesk</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#8b949e;">Employee Task Tracking System</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 40px 36px;background-color:#0d1117;">
              <h2 style="font-size:18px;font-weight:600;color:#ffffff;margin:0 0 16px;">Hello ${name || 'there'},</h2>
              <p style="font-size:14px;color:#c9d1d9;line-height:1.6;margin:0 0 24px;">
                We received a request to reset your PulseDesk password. Click the button below to set a new password. This reset link is valid for <strong style="color:#58a6ff;">10 minutes</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display:inline-block;background-color:#1f6feb;color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;padding:12px 30px;border-radius:10px;transition:background-color 0.2s;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:13px;color:#8b949e;line-height:1.6;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <hr style="border:none;border-top:1px solid #21262d;margin:24px 0;" />
              <p style="font-size:11px;color:#8b949e;margin:0;line-height:1.5;">
                Having trouble clicking the button? Copy and paste the link below into your web browser:<br />
                <a href="${resetUrl}" style="color:#58a6ff;word-break:break-all;text-decoration:none;">${resetUrl}</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:11px;color:#8b949e;text-align:center;">© ${new Date().getFullYear()} PulseDesk. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
        `
    };

    await sendEmailViaBrevo(mailOptions);
};

/**
 * Send an email alert to an employee when a new task is assigned.
 */
export const sendTaskAssignmentEmail = async ({ to, employeeName, taskTitle, adminName }) => {
    const mailOptions = {
        from: `"PulseDesk" <${process.env.GMAIL_USER}>`,
        to,
        subject: `New Task Assigned: ${taskTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#0d1117;border:1px solid #21262d;border-radius:16px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:36px 40px 24px;background-color:#0d1117;">
              <div style="width:48px;height:48px;background-color:#f97316;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="font-size:24px;font-weight:900;color:#000000;line-height:48px;display:block;text-align:center;">P</span>
              </div>
              <h1 style="margin:16px 0 0;font-size:24px;font-weight:700;color:#ffffff;">New Task Assigned</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#8b949e;">PulseDesk Task Alert</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 36px;background-color:#0d1117;">
              <h2 style="font-size:18px;font-weight:600;color:#ffffff;margin:0 0 16px;">Hello ${employeeName},</h2>
              <p style="font-size:14px;color:#c9d1d9;line-height:1.6;margin:0 0 24px;">
                Your administrator <strong style="color:#ffffff;">${adminName}</strong> has assigned a new task to you:
              </p>
              <div style="background-color:#161b22;border:1px solid #30363d;border-radius:10px;padding:16px;margin-bottom:24px;text-align:left;">
                <p style="margin:0;font-size:15px;font-weight:700;color:#f97316;">${taskTitle}</p>
              </div>
              <p style="font-size:14px;color:#c9d1d9;line-height:1.6;margin:0 0 24px;">
                Please log in to your PulseDesk dashboard to check the task details, update the progress, and submit work update messages.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:11px;color:#8b949e;text-align:center;">© ${new Date().getFullYear()} PulseDesk. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
        `
    };
    await sendEmailViaBrevo(mailOptions);
};

/**
 * Send an email alert to the admin when an employee completes their task.
 */
export const sendTaskCompletionEmail = async ({ to, adminName, employeeName, taskTitle }) => {
    const mailOptions = {
        from: `"PulseDesk" <${process.env.GMAIL_USER}>`,
        to,
        subject: `Task Completed: ${taskTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#0d1117;border:1px solid #21262d;border-radius:16px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:36px 40px 24px;background-color:#0d1117;">
              <div style="width:48px;height:48px;background-color:#10b981;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="font-size:24px;font-weight:900;color:#ffffff;line-height:48px;display:block;text-align:center;">P</span>
              </div>
              <h1 style="margin:16px 0 0;font-size:24px;font-weight:700;color:#ffffff;">Task Completed</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#8b949e;">PulseDesk Notification</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 36px;background-color:#0d1117;">
              <h2 style="font-size:18px;font-weight:600;color:#ffffff;margin:0 0 16px;">Hello ${adminName},</h2>
              <p style="font-size:14px;color:#c9d1d9;line-height:1.6;margin:0 0 24px;">
                Your employee <strong style="color:#ffffff;">${employeeName}</strong> has marked the assigned task as **Completed**:
              </p>
              <div style="background-color:#161b22;border:1px solid #30363d;border-radius:10px;padding:16px;margin-bottom:24px;text-align:left;">
                <p style="margin:0;font-size:15px;font-weight:700;color:#10b981;">${taskTitle}</p>
              </div>
              <p style="font-size:14px;color:#c9d1d9;line-height:1.6;margin:0 0 24px;">
                You can review their work updates and final message directly from your PulseDesk Admin Dashboard.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:11px;color:#8b949e;text-align:center;">© ${new Date().getFullYear()} PulseDesk. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
        `
    };
    await sendEmailViaBrevo(mailOptions);
};

/**
 * Send a 6-digit OTP verification code email.
 */
export const sendOtpEmail = async ({ to, name, code }) => {
    const mailOptions = {
        from: `"PulseDesk" <${process.env.GMAIL_USER}>`,
        to,
        subject: `PulseDesk Verification Code: ${code}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#0d1117;border:1px solid #21262d;border-radius:16px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:36px 40px 24px;background-color:#0d1117;">
              <div style="width:48px;height:48px;background-color:#f97316;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="font-size:24px;font-weight:900;color:#000000;line-height:48px;display:block;text-align:center;">P</span>
              </div>
              <h1 style="margin:16px 0 0;font-size:24px;font-weight:700;color:#ffffff;">Verify Your Account</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#8b949e;">PulseDesk Security Alert</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 36px;background-color:#0d1117;text-align:center;">
              <h2 style="font-size:18px;font-weight:600;color:#ffffff;margin:0 0 16px;text-align:left;">Hello ${name || 'there'},</h2>
              <p style="font-size:14px;color:#c9d1d9;line-height:1.6;margin:0 0 24px;text-align:left;">
                Thank you for choosing PulseDesk! Please use the following 6-digit verification code to complete your registration. This code is valid for <strong style="color:#58a6ff;">15 minutes</strong>.
              </p>
              <div style="background-color:#161b22;border:1px solid #30363d;border-radius:10px;padding:20px 24px;margin-bottom:24px;display:inline-block;letter-spacing:6px;font-size:28px;font-weight:900;color:#f97316;">
                ${code}
              </div>
              <p style="font-size:12px;color:#8b949e;line-height:1.6;margin:0;text-align:left;">
                If you did not request this verification, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:11px;color:#8b949e;text-align:center;">© ${new Date().getFullYear()} PulseDesk. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
        `
    };
    await sendEmailViaBrevo(mailOptions);
};

export default sendResetEmail;

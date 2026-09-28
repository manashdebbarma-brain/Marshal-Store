import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// ✅ CRITICAL: Tell Next.js NOT to pre-render this route at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function welcomeHtml(name: string) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:40px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <tr><td style="background:linear-gradient(135deg,#06b6d4,#6366f1);padding:40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">Marshal Store</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Instant Game Top-Ups</p>
          </td></tr>
          <tr><td style="padding:40px;">
            <h2 style="margin:0;font-size:22px;color:#0f172a;">Welcome aboard, ${name}! 🎮</h2>
            <p style="margin:16px 0 0;color:#475569;font-size:15px;line-height:1.6;">
              Thanks for signing in to Marshal Store. You're now ready to explore instant game top-ups, gift cards, and digital subscriptions.
            </p>
            <ul style="color:#475569;font-size:15px;line-height:1.8;">
              <li>⚡ Top up BGMI, Free Fire, Mobile Legends & more</li>
              <li>💳 Pay securely with UPI, cards, or wallet</li>
              <li>📦 Track your orders in real time</li>
              <li>🎁 Unlock exclusive offers for members</li>
            </ul>
            <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
              <tr><td style="background:#06b6d4;border-radius:12px;">
                <a href="https://marshalstore.com" style="display:inline-block;padding:14px 28px;color:#000;font-weight:700;text-decoration:none;">Start Shopping →</a>
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:24px 40px;border-top:1px solid #e2e8f0;background:#f8fafc;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} Marshal Store. All rights reserved.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
}

function loginSuccessHtml(name: string, email: string, loginTime: string) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
          <tr><td style="background:linear-gradient(135deg,#06b6d4,#6366f1);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;">Marshal Store</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">Account Security</p>
          </td></tr>
          <tr><td style="padding:36px 40px 8px;text-align:center;">
            <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:#dcfce7;line-height:64px;font-size:32px;">✅</div>
          </td></tr>
          <tr><td style="padding:8px 40px 0;text-align:center;">
            <h2 style="margin:0;font-size:22px;color:#0f172a;">Login Successful</h2>
            <p style="margin:12px 0 0;color:#475569;font-size:15px;line-height:1.6;">
              Hi <strong>${name}</strong>,<br/>
              We noticed a new sign-in to your Marshal Store account.
            </p>
          </td></tr>
          <tr><td style="padding:28px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
              <tr><td style="padding:20px 24px;">
                <table width="100%">
                  <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:600;">${email}</td></tr>
                  <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Time</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:600;">${loginTime}</td></tr>
                </table>
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:24px 40px 0;">
            <table width="100%" style="background:#fef3c7;border-radius:12px;border:1px solid #fde68a;">
              <tr><td style="padding:18px 22px;color:#78350f;font-size:13px;line-height:1.6;">
                <strong>⚠️ Wasn't you?</strong><br/>
                If you didn't sign in, please secure your account immediately.
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:32px 40px 36px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">This is an automated security notification.</p>
            <p style="margin:16px 0 0;color:#cbd5e1;font-size:11px;">© ${new Date().getFullYear()} Marshal Store.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
}

export async function POST(req: Request) {
  try {
    // ✅ Only check for the key at request time, not at module load
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY is not set');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // ✅ Initialize Resend INSIDE the handler (not at module top-level)
    const resend = new Resend(apiKey);

    const { email, name, type = 'welcome' } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing email or name' },
        { status: 400 }
      );
    }

    let subject: string;
    let html: string;
    let templateName: string;

    if (type === 'login-success') {
      const loginTime = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      subject = 'Login Successful — Marshal Store';
      html = loginSuccessHtml(name, email, loginTime);
      templateName = 'login-success';
    } else {
      subject = `Welcome to Marshal Store, ${name}! 🎮`;
      html = welcomeHtml(name);
      templateName = 'welcome';
    }

    const { data, error } = await resend.emails.send({
      from: 'Marshal Store <onboarding@resend.dev>',
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log(`✅ ${templateName} email sent to ${email}`, data?.id);
    return NextResponse.json({
      success: true,
      id: data?.id,
      type: templateName,
    });
  } catch (err: any) {
    console.error('❌ Full error:', err);
    return NextResponse.json(
      { error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
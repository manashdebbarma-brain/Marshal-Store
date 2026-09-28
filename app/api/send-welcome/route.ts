import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing email or name' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Marshal Store <onboarding@resend.dev>', // change to your domain later
      to: [email],
      subject: `Welcome to Marshal Store, ${name}! 🎮`,
      react: WelcomeEmail({ name, email }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('Send welcome error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
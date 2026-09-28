import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
  email: string;
}

export function WelcomeEmail({ name, email }: WelcomeEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#f5f7fb',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        }}
      >
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: '#f5f7fb', padding: '40px 0' }}
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                {/* Header */}
                <tr>
                  <td
                    style={{
                      background:
                        'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                      padding: '40px 30px',
                      textAlign: 'center',
                    }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: 900,
                        color: '#ffffff',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Marshal Store
                    </h1>
                    <p
                      style={{
                        margin: '8px 0 0',
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      Instant Game Top-Ups
                    </p>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: '40px 40px 30px' }}>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#0f172a',
                      }}
                    >
                      Welcome aboard, {name}! 🎮
                    </h2>

                    <p
                      style={{
                        margin: '16px 0 0',
                        fontSize: '15px',
                        lineHeight: 1.6,
                        color: '#475569',
                      }}
                    >
                      Thanks for signing in to Marshal Store. You're now ready
                      to explore instant game top-ups, gift cards, and digital
                      subscriptions — all delivered in seconds.
                    </p>

                    <p
                      style={{
                        margin: '16px 0 0',
                        fontSize: '15px',
                        lineHeight: 1.6,
                        color: '#475569',
                      }}
                    >
                      Here's what you can do next:
                    </p>

                    <ul
                      style={{
                        margin: '12px 0 0',
                        padding: '0 0 0 20px',
                        fontSize: '15px',
                        lineHeight: 1.8,
                        color: '#475569',
                      }}
                    >
                      <li>⚡ Top up BGMI, Free Fire, Mobile Legends & more</li>
                      <li>💳 Pay securely with UPI, cards, or wallet</li>
                      <li>📦 Track your orders in real time</li>
                      <li>🎁 Unlock exclusive offers for members</li>
                    </ul>

                    {/* CTA Button */}
                    <table
                      cellPadding="0"
                      cellSpacing="0"
                      style={{ margin: '32px 0 0' }}
                    >
                      <tr>
                        <td
                          style={{
                            backgroundColor: '#06b6d4',
                            borderRadius: '12px',
                          }}
                        >
                          <a
                            href="https://marshalstore.com"
                            style={{
                              display: 'inline-block',
                              padding: '14px 28px',
                              fontSize: '15px',
                              fontWeight: 700,
                              color: '#000000',
                              textDecoration: 'none',
                            }}
                          >
                            Start Shopping →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    style={{
                      padding: '24px 40px 32px',
                      borderTop: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        lineHeight: 1.6,
                        color: '#94a3b8',
                        textAlign: 'center',
                      }}
                    >
                      You're receiving this email because you signed up at
                      Marshal Store.
                      <br />
                      If this wasn't you, please ignore this email.
                    </p>
                    <p
                      style={{
                        margin: '12px 0 0',
                        fontSize: '12px',
                        color: '#94a3b8',
                        textAlign: 'center',
                      }}
                    >
                      © {new Date().getFullYear()} Marshal Store. All rights
                      reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
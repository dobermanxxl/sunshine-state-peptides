export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { first, last, email, lab, orderLines, total } = req.body;

  if (!first || !last || !email || !orderLines) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const orderHTML = orderLines.map(line => `<tr>
    <td style="padding:8px 12px;font-family:monospace;border-bottom:1px solid #eee;">${line.split(' = ')[0]}</td>
    <td style="padding:8px 12px;font-family:monospace;border-bottom:1px solid #eee;text-align:right;">${line.split(' = ')[1] || ''}</td>
  </tr>`).join('');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'orders@sunshinestatepeptides.com',
        to: 'sunshinestatep@protonmail.com',
        reply_to: email,
        subject: `New Order — ${first} ${last}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0a1628;padding:24px 32px;">
              <h1 style="color:#00b8a9;font-size:20px;margin:0;">New Research Order</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:4px 0 0;">Sunshine State Peptides</p>
            </div>
            <div style="padding:32px;background:#f5f2eb;">
              <table style="width:100%;margin-bottom:24px;">
                <tr><td style="padding:6px 0;color:#666;font-size:13px;">Customer</td><td style="font-weight:600;">${first} ${last}</td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:13px;">Email</td><td>${email}</td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:13px;">Lab / Org</td><td>${lab || 'N/A'}</td></tr>
              </table>
              <table style="width:100%;border:1px solid #ddd;background:#fff;margin-bottom:24px;">
                <thead>
                  <tr style="background:#0a1628;">
                    <th style="padding:10px 12px;color:#fff;text-align:left;font-size:12px;letter-spacing:0.1em;">ITEM</th>
                    <th style="padding:10px 12px;color:#fff;text-align:right;font-size:12px;letter-spacing:0.1em;">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>${orderHTML}</tbody>
                <tfoot>
                  <tr style="background:#f5f2eb;">
                    <td style="padding:12px;font-weight:700;">Order Total</td>
                    <td style="padding:12px;font-weight:700;text-align:right;color:#00897b;">$${parseFloat(total).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              <p style="font-size:13px;color:#666;">Reply to this email to confirm the order and arrange payment (Cash or Venmo).</p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email failed to send' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

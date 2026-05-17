export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { first, last, email, lab, orderLines, total, signatureData } = req.body;

  if (!first || !last || !email || !orderLines) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const orderHTML = orderLines.map(line => `<tr>
    <td style="padding:8px 12px;font-family:monospace;border-bottom:1px solid #eee;">${line.split(' = ')[0]}</td>
    <td style="padding:8px 12px;font-family:monospace;border-bottom:1px solid #eee;text-align:right;">${line.split(' = ')[1] || ''}</td>
  </tr>`).join('');

  // Build signature block
  let sigBlock = '';
  if (signatureData) {
    let sig = {};
    try { sig = JSON.parse(signatureData); } catch(e) { sig = { typed: signatureData }; }

    const typedHTML = sig.typed
      ? `<div style="margin-bottom:16px;">
           <p style="font-family:monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#999;margin:0 0 6px;">Typed Name</p>
           <p style="font-family:Georgia,serif;font-style:italic;font-size:26px;color:#0a1628;margin:0;padding:8px 0;border-bottom:2px solid #0a1628;">${sig.typed}</p>
         </div>`
      : '';

    const drawnHTML = sig.drawn
      ? `<div>
           <p style="font-family:monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#999;margin:0 0 6px;">Drawn Signature</p>
           <img src="${sig.drawn}" style="max-width:100%;max-height:120px;border:1px solid #eee;border-radius:2px;display:block;" alt="Customer signature">
         </div>`
      : '';

    sigBlock = `
      <div style="margin-top:24px;border:1px solid #ddd;border-radius:4px;overflow:hidden;">
        <div style="background:#0a1628;padding:10px 16px;">
          <p style="font-family:monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#00b8a9;margin:0;">Electronic Signature &amp; Liability Release</p>
        </div>
        <div style="background:#fff;padding:16px;">
          <p style="font-size:12px;color:#666;line-height:1.6;margin:0 0 16px;">Customer confirmed at checkout: 18+, purchasing for in vitro laboratory research only, will NOT use for human/animal consumption, clinical use, resale, or illegal purposes. Full liability released for Sunshine State Peptides, its owners, employees, and affiliates.</p>
          <div style="background:#f9f9f9;border:1px solid #eee;padding:16px;border-radius:2px;">
            ${typedHTML}${drawnHTML}
          </div>
          <p style="font-size:11px;color:#999;margin:8px 0 0;">Signed electronically at time of order submission.</p>
        </div>
      </div>`;
  }

  const ownerEmailHTML = `
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
        <p style="font-size:13px;color:#666;">Reply to this email to confirm the order and follow up with payment options.</p>
        ${sigBlock}
      </div>
    </div>`;

  const buyerEmailHTML = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#0a1628;padding:24px 32px;">
        <h1 style="color:#00b8a9;font-size:20px;margin:0;">Order Received</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:4px 0 0;">Sunshine State Peptides</p>
      </div>
      <div style="padding:32px;background:#f5f2eb;">
        <p style="font-size:15px;color:#333;margin-bottom:24px;">Hi ${first}, thank you for your research order! We have received it and will be in touch within 24 hours to confirm.</p>
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
        <p style="font-size:13px;color:#666;">We will follow up with next steps when we confirm your order.</p>
        <p style="font-size:12px;color:#999;margin-top:24px;border-top:1px solid #ddd;padding-top:16px;">These compounds are for in vitro laboratory research purposes only. Not for human consumption or clinical use.</p>
      </div>
    </div>`;

  try {
    const [ownerRes, buyerRes] = await Promise.all([
      fetch('https://api.resend.com/emails', {
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
          html: ownerEmailHTML
        })
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'orders@sunshinestatepeptides.com',
          to: email,
          reply_to: 'sunshinestatep@protonmail.com',
          subject: `Your Sunshine State Peptides Order Confirmation`,
          html: buyerEmailHTML
        })
      })
    ]);

    if (!ownerRes.ok || !buyerRes.ok) {
      const err = await ownerRes.json().catch(() => ({}));
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email failed to send' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

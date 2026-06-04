const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const sendPassEmail = async ({ name, email, serialNumber, collegeId, branch, qrCode }) => {
  const mailSubject = `Your GateX Entry Pass - ${serialNumber}`;
  const mailHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #000; color: #fff; padding: 40px; border-radius: 20px; max-width: 600px; margin: 0 auto; border: 2px solid #06b6d4; box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #06b6d4; font-size: 36px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">GateX</h1>
        <p style="color: #9ca3af; font-size: 14px; margin: 5px 0 0 0;">Smart QR Based Entry Management System</p>
      </div>
      
      <div style="background-color: #07152d; border-radius: 15px; padding: 25px; border: 1px solid #1e293b; margin-bottom: 30px;">
        <h2 style="color: #06b6d4; font-size: 20px; margin-top: 0; text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">FEST ENTRY PASS</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="color: #9ca3af; padding: 6px 0; font-size: 14px; width: 40%;">Name</td>
            <td style="color: #fff; padding: 6px 0; font-size: 14px; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 6px 0; font-size: 14px;">Email</td>
            <td style="color: #fff; padding: 6px 0; font-size: 14px;">${email}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 6px 0; font-size: 14px;">College ID</td>
            <td style="color: #fff; padding: 6px 0; font-size: 14px;">${collegeId}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 6px 0; font-size: 14px;">Branch</td>
            <td style="color: #fff; padding: 6px 0; font-size: 14px;">${branch}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 6px 0; font-size: 14px;">Serial Number</td>
            <td style="color: #06b6d4; padding: 6px 0; font-size: 14px; font-weight: bold;">${serialNumber}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 6px 0; font-size: 14px;">Event Name</td>
            <td style="color: #fff; padding: 6px 0; font-size: 14px; font-weight: bold;">GateX Fest 2026</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 6px 0; font-size: 14px;">Event Date</td>
            <td style="color: #fff; padding: 6px 0; font-size: 14px;">October 15, 2026</td>
          </tr>
        </table>
        
        <div style="text-align: center; margin-top: 25px; background: white; padding: 15px; border-radius: 10px; display: inline-block; width: 180px; margin-left: auto; margin-right: auto; display: block;">
          <img src="${qrCode}" alt="Pass QR Code" style="width: 180px; height: 180px;" />
        </div>
        
        <p style="text-align: center; color: #10b981; font-weight: bold; font-size: 18px; margin-top: 20px; margin-bottom: 0; letter-spacing: 1px;">
          VALID FOR ENTRY ✅
        </p>
      </div>
      
      <div style="text-align: center; color: #6b7280; font-size: 12px; line-height: 1.5;">
        <p>Please present the QR code on your mobile device at the entry gates for instant verification.</p>
        <p>&copy; 2026 GateX. All rights reserved.</p>
      </div>
    </div>
  `;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"GateX Support" <${user}>`,
        to: email,
        subject: mailSubject,
        html: mailHtml,
      });

      console.log(`Email successfully sent to ${email}`);
      return { success: true, method: "smtp" };
    } catch (error) {
      console.error("Error sending email via SMTP, falling back to mock file:", error);
    }
  }

  // Fallback / Mock delivery sandbox
  try {
    const mockDir = path.join(__dirname, "../mock_emails");
    if (!fs.existsSync(mockDir)) {
      fs.mkdirSync(mockDir, { recursive: true });
    }

    const filename = `${serialNumber}_pass.html`;
    const filepath = path.join(mockDir, filename);

    // Save HTML content to file
    fs.writeFileSync(filepath, mailHtml, "utf8");

    console.log(`[MOCK EMAIL SENT] Pass saved to: file:///${filepath.replace(/\\/g, "/")}`);
    return { success: true, method: "mock", filepath };
  } catch (err) {
    console.error("Error writing mock email file:", err);
    return { success: false, error: err.message };
  }
};

module.exports = { sendPassEmail };

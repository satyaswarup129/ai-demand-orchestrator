const nodemailer = require('nodemailer');

// Using Gmail — add these to your .env:
// EMAIL_USER=youremail@gmail.com
// EMAIL_PASS=your_app_password  (Gmail App Password, not your login password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

async function sendAssignmentEmail({ to, demandTitle, route, team, manager, sla_days }) {
  const teamList = team.map(m => `  • ${m.name} — ${m.role} (${m.fit_score}% fit)`).join('\n');
  const mailOptions = {
    from: `"AI-Orchestrator" <${process.env.EMAIL_USER}>`,
    to,  // comma-separated string of team emails
    subject: `[AI-Orchestrator] You've been assigned: ${demandTitle}`,
    text: `
Hi team,

You have been assigned to the following AI demand:

Demand   : ${demandTitle}
Route    : ${route}
Manager  : ${manager}
SLA      : ${sla_days} days

Team Composition:
${teamList}

This assignment was made automatically by AI-Orchestrator.
Please log in to review the full demand details and begin execution.

— AI-Orchestrator | TCS AI Club
    `.trim()
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendAssignmentEmail };
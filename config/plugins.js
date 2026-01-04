module.exports = ({ env }) => ({
    email: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',  // Gmail's SMTP host
        port: 587,               // Use port 587 for STARTTLS
        secure: false,           // Use TLS instead of SSL
        auth: {
          user: env('SMTP_EMAIL', 'info@atsasmun.com'),  // Your Gmail address
          pass: env('SMTP_PASS', 'ucnculvwigndwkix'),    // App Password
        },
      },
      settings: {
        defaultFrom: env('SMTP_EMAIL', 'info@atsasmun.com'),  // Sender email
        defaultReplyTo: env('SMTP_REPLY_TO', 'nomi4698dg@gmail.com'),  // Reply-to email
      },
    },
  });
  
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

module.exports = {
  // CRON: Runs every minute
  // ok
  '*/1 * * * *': async ({ strapi }) => {
    try {
      const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);

      console.log(`[Cron] Checking for notifications older than: ${eightHoursAgo.toISOString()}`);

      const notifications = await strapi.db.query('api::notification.notification').findMany({
        where: {
          emailSent: false,
          createdAt: { $lt: eightHoursAgo }
        },
      });

      if (!notifications || notifications.length === 0) {
        console.log(`[Cron] No pending notifications found older than 8 hours.`);
        return;
      }

      console.log(`[Cron] Found ${notifications.length} notifications. Emails: ${notifications.map(n => n.Email).join(', ')}`);

      const emailGroups = notifications.reduce((acc, notification) => {
        const email = notification.Email;
        if (email) {
          acc[email] = acc[email] || [];
          acc[email].push(notification);
        }
        return acc;
      }, {});

      // Email transporter setup
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'info@worlddiplomats.org',
          pass: 'eqqxvxhdtgfbxuiu',
        },
      });

      const pdfBuffers = {};

      for (const [email, notifs] of Object.entries(emailGroups)) {
        const notif = notifs[0] || {};
        const firstName = notif.FirstName || '';
        const username = notif.Username || '';
        const delegationFlag = notif.isDelegation || false;
        const userId = notif.Idname || '';
        const rawDestination = notif.Destinations || '';
        const startdate = notif.startdate || '';
        const enddate = notif.enddate || '';
        const month = notif.month || '';
        const year = notif.year || '';

        const isDelegation = delegationFlag || false;
        const userName = firstName || username || "Delegation";
        const phoneNumber = "+447490344639";
        const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}`;

        // Trim destination to avoid whitespace mismatches
        const destination = rawDestination ? rawDestination.trim() : '';
        console.log(`Processing email for destination: "${destination}"`);

        // Initialize variables with defaults
        var desname = destination;
        var country = destination.includes(',') ? destination.split(',')[1].trim() : destination;
        var CityTour = '';

        var venue = "TBA";
        if (destination == "Dubai, UAE") {
          desname = "Dubai, UAE";
          country = "Dubai, UAE";
          CityTour = "Dubai City Tour";
          venue = "Meydan Hotel, Dubai";
        } else if (destination == "Kuala Lumpur, Malaysia") {
          desname = "Kuala Lumpur, Malaysia";
          country = "Kuala Lumpur, Malaysia";
          CityTour = "Baku City Tour";
          venue = "Sunway Putra Hotel, Kuala Lumpur";
        } else if (destination == "New York, USA") {
          desname = "New York, USA";
          country = "New York, USA";
          CityTour = "New York City Tour";
          venue = "East Brunswick Hotel, New York";
        } else if (destination == "Riyadh, Saudi Arabia") {
          desname = "Riyadh, Saudi Arabia";
          country = "Riyadh, Saudi Arabia";
          CityTour = "Riyadh City Tour";
          venue = "Hilton Riyadh Hotel, Riyadh";
        } else if (destination == "London, UK") {
          desname = "London, UK";
          country = "London, UK";
          CityTour = "London City Tour";
          venue = "140 Bath Rd, Heathrow, London";
        } else if (destination == "Istanbul, Türkiye" || destination == "Istanbul, Turkey") {
          desname = destination;
          country = destination;
          CityTour = "Istanbul City Tour";
          venue = "G Rotana Hotel, Istanbul";
        }

        const isLikelyRangeOrOrdinal = (val) => val && /^\d+([a-z]{2})?((\s*-\s*)\d+([a-z]{2})?)?$/i.test(val.toString().trim());
        const isNumeric = (val) => val && /^\d+$/.test(val.toString().trim());

        const isDateText = (startdate && !isLikelyRangeOrOrdinal(startdate)) || (enddate && !isLikelyRangeOrOrdinal(enddate));
        const dateTextValue = isDateText ? (startdate && !isNumeric(startdate) ? startdate : enddate) : null;

        const conferenceDates = dateTextValue
          ? `${dateTextValue} ${month} ${year}`.trim()
          : (startdate.includes('-') || startdate.toLowerCase().includes('to'))
            ? `${startdate} ${month} ${year}`
            : `${startdate} to ${enddate} ${month} ${year}`;

        const checkInDate = `${startdate} ${month} ${year}`;
        const checkOutDate = `${enddate} ${month} ${year}`;
        // Add other destination-specific conditions here...
        // Build Zagatiya package HTML dynamically per destination
        var zagatiyaLines = [
          '✓ Everything in Delegate SHEPANDUM Experience'
        ];
        if (CityTour) zagatiyaLines.push('✓ ' + CityTour);

        var _extras = [];
        if (destination == "Istanbul, Türkiye") {
          _extras = ['Bosphorus Rooftop Lunch Tour', 'Cruise Trip & Dinner at Bosphorus'];
        } else if (destination == "Dubai, UAE") {
          _extras = ['Desert Safari'];
        } else if (destination == "Kuala Lumpur, Malaysia") {
          _extras = ['Batu Caves', 'Petronas Twin Towers', 'Merdeka Square'];
        } else if (destination == "London, UK") {
          _extras = [];
        } else if (destination == "Riyadh, Saudi Arabia") {
          _extras = [];
        }

        _extras.forEach(function (x) { zagatiyaLines.push('✓ ' + x); });
        var zagatiyaHTML = zagatiyaLines.join('<br><br>');

        // Map destination names to payment route prefixes and build plan links

        const paymentRouteMap = {
          'Dubai, UAE': 'Dubaipayment',
          'Kuala Lumpur, Malaysia': 'Malaysiapayment',
          'New York, USA': 'USApayment',
          'Riyadh, Saudi Arabia': 'Saudipayment',
          'London, UK': 'Londonpayment',
          'Istanbul, Türkiye': 'Istanbulpayment',
        };

        const routePrefix = paymentRouteMap[destination] || 'Payment';

        const basicPlanId = 1;
        const shepandumPlanId = 2;
        const zagatiyaPlanId = 3;

        const basicUrl = `https://www.worlddiplomats.org/${routePrefix}/${basicPlanId}?userid=${userId}`;
        const shepandumUrl = `https://www.worlddiplomats.org/${routePrefix}/${shepandumPlanId}?userid=${userId}`;
        const zagatiyaUrl = `https://www.worlddiplomats.org/${routePrefix}/${zagatiyaPlanId}?userid=${userId}`;

        // Create the HTML content (kept for possible future usage)
        const htmlContent = `

        `;

        try {
          // Create a unique key for the PDF cache to handle potential date variations per destination
          const pdfKey = `${destination}_${startdate}_${enddate}_${month}_${year}`;

          if (destination && !pdfBuffers[pdfKey]) {
            console.log(`Generating PDF for destination: ${destination}, Key: ${pdfKey}`);
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            const pdfTemplate = `<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>Letter of Affirmation</title>
</head>

<body style="margin:0; padding:0; background-color:#eaeaea;">

  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#eaeaea">
    <tr>
      <td align="center">

        <!-- MAIN EMAIL CONTAINER -->
        <table width="850" cellpadding="0" cellspacing="0"
          background="https://6a903f8cfa.imgdist.com/public/users/BeeFree/beefree-4862b855-5df1-4b89-a5ec-bb23e0132b7c/laterhead%20bg%20image.jpeg" style="
          background-image:url('https://6a903f8cfa.imgdist.com/public/users/BeeFree/beefree-4862b855-5df1-4b89-a5ec-bb23e0132b7c/laterhead%20bg%20image.jpeg');
          background-repeat:no-repeat;
          background-position:center top;
          background-size:cover;
          height: 1200px;
          font-family:Arial, Helvetica, sans-serif;
        ">
          <tr>
            <td style="padding:180px 60px 60px 60px;">

              <!-- TITLE -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <h2 style="margin:10px 0 20px 0; color:#0b3c6d; font-size:22px;">
                      Letter of Affirmation
                    </h2>
                  </td>
                </tr>
              </table>

              <!-- BODY TEXT -->
              <p style="margin:0 0 15px 0; font-size:15px; color:#333333; line-height:24px;">
                Dear ${userName},
              </p>

              <p style="margin:0 0 15px 0; font-size:15px; color:#333333; line-height:24px;">
                <strong>Congratulations!</strong><br />
                We are pleased to formally confirm your acceptance to participate in the
                <strong>World Diplomats International Conference ${year}</strong>, organized by
                <strong>Globenix Youth Forum</strong>, ${dateTextValue ? 'which is' : 'scheduled to be held from'}
                <strong>${conferenceDates}</strong> in
                <strong>${destination}</strong>.
              </p>

              <p style="margin:0 0 15px 0; font-size:15px; color:#333333; line-height:24px;">
                World Diplomats is an international diplomatic and leadership platform dedicated
                to empowering emerging leaders, policymakers, and change makers by fostering dialogue,
                collaboration, and innovative solutions to global challenges.
              </p>

              <p style="margin:0 0 15px 0; font-size:15px; color:#333333; line-height:24px;">
                We are honored to extend this letter as an official
                <strong>Letter of Affirmation</strong> confirming your participation
                in the above-mentioned conference.
              </p>

              <!-- EVENT DETAILS -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
                <tr>
                  <td style="font-size:15px; color:#333333; line-height:24px;">
                    <strong>Conference Venue:</strong> ${venue}<br />
                    <strong>Destination:</strong> ${destination}<br />
                    <strong>Conference Dates:</strong> ${conferenceDates}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 15px 0; font-size:15px; color:#333333; line-height:24px;">
                ${isDelegation
                ? "You are requested to contact us via WhatsApp to finalize your delegation's registration and payment:"
                : `You are requested to pay your delegate fee in order to become a confirmed delegate of World Diplomats ${destination} via the following link:`
              }
              </p>

              <p style="margin:0 0 15px 0;">
                <a href="${isDelegation ? whatsappUrl : (basicUrl || '#')}" style="color:#0b3c6d; font-weight:bold; text-decoration:underline;">
                  ${isDelegation ? 'Chat with us' : 'Conference Fee Link'}
                </a>
              </p>

              <p style="margin:0 0 15px 0; font-size:15px; color:#333333; line-height:24px;">
                Each participant will be responsible for his/her visa fee and flight tickets.
                ${dateTextValue
                ? `Hotel check-in and check-out dates are <strong>${dateTextValue} ${month} ${year}</strong>.`
                : `Hotel check-in will be on <strong>${checkInDate}</strong> and check-out on <strong>${checkOutDate}</strong>.`
              }
              </p>

              <p style="margin:0 0 15px 0; font-size:15px; color:#333333; line-height:24px;">
                The committee will provide accommodation, meals, local transportation,
                and merch kits to participants with Accommodation and Full Experience packages.
              </p>

              <p style="margin:0 0 30px 0; font-size:15px; color:#333333; line-height:24px;">
                Further logistical and participation-related details will be communicated
                to confirmed paid delegates closer to the event date.
              </p>

              <!-- SIGN OFF -->
              <p style="margin:0 0 30px 0; font-size:15px; color:#333333; line-height:24px;">
                Warm regards,<br />
                <strong>Secretariat</strong><br />
                World Diplomats International MUN ${year}<br />
                ${destination}
              </p>

              <!-- FOOTER SOCIAL LINKS (CENTERED) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px; border-top:1px solid #ddd;">
                <tr>
                  <td align="center" style="padding-top:15px;">

                    <table cellpadding="0" cellspacing="0">
                      <tr>

                        <!-- Instagram -->
                        <td style="padding:0 7px; font-size:13px;">
                          <a href="https://instagram.com/worlddiplomats_" target="_blank"
                            style="color:#0b3c6d; text-decoration:none;"
                            onmouseover="this.style.textDecoration='underline';"
                            onmouseout="this.style.textDecoration='none';">
                            <img src="https://img.icons8.com/ios-filled/18/0b3c6d/instagram-new.png"
                              style="vertical-align:middle; border:0;">
                            worlddiplomats_
                          </a>
                        </td>

                        <!-- Facebook -->
                        <td style="padding:0 7px; font-size:13px;">
                          <a href="https://facebook.com/worlddiplomats" target="_blank"
                            style="color:#0b3c6d; text-decoration:none;"
                            onmouseover="this.style.textDecoration='underline';"
                            onmouseout="this.style.textDecoration='none';">
                            <img src="https://img.icons8.com/ios-filled/18/0b3c6d/facebook-new.png"
                              style="vertical-align:middle; border:0;">
                            worlddiplomats
                          </a>
                        </td>

                        <!-- TikTok -->
                        <td style="padding:0 7px; font-size:13px;">
                          <a href="https://www.tiktok.com/@worlddiplomats" target="_blank"
                            style="color:#0b3c6d; text-decoration:none;"
                            onmouseover="this.style.textDecoration='underline';"
                            onmouseout="this.style.textDecoration='none';">
                            <img src="https://img.icons8.com/ios-filled/18/0b3c6d/tiktok.png"
                              style="vertical-align:middle; border:0;">
                            worlddiplomats
                          </a>
                        </td>

                        <!-- Phone -->
                        <td style="padding:0 7px; font-size:13px;">
                          <a href="tel:+447490344639" style="color:#0b3c6d; text-decoration:none;"
                            onmouseover="this.style.textDecoration='underline';"
                            onmouseout="this.style.textDecoration='none';">
                            <img src="https://img.icons8.com/ios-filled/18/0b3c6d/phone.png"
                              style="vertical-align:middle; border:0;">
                            +44 7490344639
                          </a>
                        </td>

                        <!-- Email -->
                        <td style="padding:0 7px; font-size:13px;">
                          <a href="mailto:info@worlddiplomats.org" style="color:#0b3c6d; text-decoration:none;"
                            onmouseover="this.style.textDecoration='underline';"
                            onmouseout="this.style.textDecoration='none';">
                            <img src="https://img.icons8.com/ios-filled/18/0b3c6d/new-post.png"
                              style="vertical-align:middle; border:0;">
                            info@worlddiplomats.org
                          </a>
                        </td>

                        <!-- Website -->
                        <td style="padding:0 7px; font-size:13px;">
                          <a href="https://worlddiplomats.org" target="_blank"
                            style="color:#0b3c6d; text-decoration:none;"
                            onmouseover="this.style.textDecoration='underline';"
                            onmouseout="this.style.textDecoration='none';">
                            <img src="https://img.icons8.com/ios-filled/18/0b3c6d/globe.png"
                              style="vertical-align:middle; border:0;">
                            worlddiplomats.org
                          </a>
                        </td>

                      </tr>
                    </table>

                  </td>
                </tr>
              </table>


            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!-- END EMAIL -->

  </td>
  </tr>
  </table>

</body>

</html>`;
            await page.setContent(pdfTemplate, { waitUntil: 'networkidle0' });
            pdfBuffers[pdfKey] = await page.pdf({
              format: 'A4',
              printBackground: true,
              margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
            });
            await browser.close();
          }

          // 📧 Send email directly
          const emailAttachments = [];
          if (destination && pdfBuffers[pdfKey]) {
            console.log(`Attaching PDF for ${email} (${destination}) using key ${pdfKey}`);
            emailAttachments.push({
              filename: 'Letter of Affirmation.pdf',
              content: pdfBuffers[pdfKey],
              contentType: 'application/pdf'
            });
          } else {
            console.warn(`⚠️ No PDF buffer found for ${email} (${destination})`);
          }

          await transporter.sendMail({
            from: 'World Diplomats <info@worlddiplomats.org>',
            to: email,
            subject: 'YOUR LETTER OF ACCEPTANCE',
            attachments: emailAttachments,
            html: `<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>World Diplomats</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f4f7; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f2f4f7">
    <tr>
      <td align="center">

        <!-- MAIN CONTAINER -->
        <table width="700" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:700px;">

          <!-- CONTENT WITH RIGHT COLOR STRIP -->
          <tr>
            <td style=" margin:0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- MAIN CONTENT -->
                  <td style="padding:0 25px ; width:685px;">

                    <!-- LOGO -->
            <!-- LOGO -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                                            <tr>
                                                <td align="center" style="padding:5px;">
                                                    <img src="https://res.cloudinary.com/dhqbmpldd/image/upload/v1768562201/WORLD_DIPLOMATS_International_Model_United_Nations__1_-removebg-preview_pn1vig.png"
                                                        width="380" style="display:block;">
                                                </td>
                                            </tr>
                                        </table>

                    <!-- IMAGE -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td>
                          <img
                            src="https://6a903f8cfa.imgdist.com/public/users/BeeFree/beefree-4862b855-5df1-4b89-a5ec-bb23e0132b7c/WhatsApp%20Image%202025-12-30%20at%2012.57.53%20AM.jpeg"
                            alt="World Diplomats Delegates" width="100%" style="display:block; border:0; height:auto; ">
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table width="100%" style="padding-top: 2px;" cellpadding="0" cellspacing="0">
                            <tr>
                              <td height="4" bgcolor="#e53935"></td>
                              <td height="4" bgcolor="#fbc02d"></td>
                              <td height="4" bgcolor="#43a047"></td>
                              <td height="4" bgcolor="#1e88e5"></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>



                    <!-- CONGRATULATIONS -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td align="center" style="padding:20px 15px;">
                          <div
                            style="font-size:30px; font-weight:bold; color:#0b4f88; margin-bottom:15px; letter-spacing:1px;">
                            CONGRATULATIONS
                          </div>
                          <div
                            style="max-width:570px; font-size:14px; color:#0b4f88; line-height:20px; margin-bottom:25px;">
                          Dear ${userName} your registration is now complete. You are now an official delegate
                            of WORLD DIPLOMATS. Your application has been thoroughly reviewed and we are delighted to
                            inform that you have been selected amongst a vast pool of applicants. Please find the
                            attached simplified guide to familiarize yourself with the proceedings before the conference
                            (Pathway to the MUN) and ${isDelegation ? `<a href="${whatsappUrl}" style="color:#0b4f88; font-weight:bold; text-decoration:underline;">Chat with us</a>` : "go to your Personal Portal"} to book your place timely. We extend our
                            heartiest welcome to you and await to see you at ${desname} International MUN.
                          </div>

                          <!-- EARLY BIRD BOX -->
                          <table cellpadding="0" cellspacing="0" width="100%"
                            style="max-width:570px; margin-bottom:20px;">
                            <tr>
                              <td align="center" style="background:#e6e6e6; padding:15px; border-radius:20px;">
                                <div style="font-size:26px; font-weight:bold; color:#0b4f88; letter-spacing:1px;">
                                  AVAIL THE EARLY BIRD<br>DISCOUNT BEFORE ITS ENDS
                                </div>
                              </td>
                            </tr>
                          </table>

                          <div
                            style="max-width:570px; font-size:14px; color:#0b4f88; line-height:20px; margin-bottom:20px;">
                            In order to provide convenience to our esteemed members, different payment categories are
                            devised.<br>
                            Click the link below for an overview of the packages
                          </div>
                        </td>
                      </tr>
                    </table>

                  <!-- PACKAGES -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
  <tr>
    <td>

      <!-- TITLES -->
      <table width="100%" cellpadding="4">
        <tr>
          <td width="33%">
            <div style="background:linear-gradient(90deg,#8c1537,#0b67c2);color:#fff;
            padding:18px;border-radius:16px;text-align:center;font-weight:600;">
              Basic
            </div>
          </td>
          <td width="33%">
            <div style="background:linear-gradient(90deg,#0b67c2,#8c1537);color:#fff;
            padding:18px;border-radius:16px;text-align:center;font-weight:600;">
              Shepandum
            </div>
          </td>
          <td width="33%">
            <div style="background:linear-gradient(90deg,#8c1537,#0b67c2);color:#fff;
            padding:18px;border-radius:16px;text-align:center;font-weight:600;">
              Zagatiya
            </div>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <tr>
    <td>

      <!-- CARDS -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>

          <!-- BASIC -->
          <td width="33%" valign="top" style="padding:4px;">
            <table width="100%" height="420" cellpadding="12" cellspacing="0"
              style="background:#f1f1f1;border-radius:20px;">
              <tr>
                <td valign="top" style="font-size:11px;line-height:1.3;color:#333;">
                  ✓ UN Simulation committee sessions<br>
                  ✓ Background Study Guides<br>
                  ✓ Official UNHCR endorsed Certificate<br>
                  ✓ 1 committee lunch<br>
                  ✓ Opening ceremony<br>
                  ✓ Diplomatic dinner<br>
                  ✓ Closing ceremony<br>
                  ✓ Grand Dinner<br>
                  ✓ Cultural Performance<br>
                  ✓ Musical Night<br>
                  ✓ Scavenger Hunt<br>
                  ✓ World Diplomats merch and Kit
                </td>
              </tr>

              <!-- BUTTON -->
                  <tr>
                <td align="center" valign="bottom">
                  <a href="${isDelegation ? whatsappUrl : basicUrl}" style="background:linear-gradient(90deg,#8c1537,#0b67c2); color:#fff; padding:12px 24px; border-radius:14px; font-weight:600; text-decoration:none; display:inline-block;">
                    ${isDelegation ? 'CHAT WITH US' : 'CHOOSE PLAN'}
                  </a>
                </td>
              </tr>
            </table>
          </td>

          <!-- SHEPANDUM -->
          <td width="33%" valign="top" style="padding:4px;">
            <table width="100%" height="420" cellpadding="12" cellspacing="0"
              style="background:#f1f1f1;border-radius:20px;">
              <tr>
                <td valign="top" style="font-size:11px;line-height:1.4;color:#333;">
                  ✓ Everything in Basic package<br><br>
                  ✓ 5-star premium hotel accommodation (Twin Shared)<br><br>
                  ✓ Gourmet Morning Breakfast everyday
                </td>
              </tr>

              <!-- SPACER (extra space for balance) -->
              <tr><td height="60">&nbsp;</td></tr>

              <!-- BUTTON -->
              <tr>
                <td align="center" valign="bottom">
                  <a href="${isDelegation ? whatsappUrl : shepandumUrl}" style="background:linear-gradient(90deg,#8c1537,#0b67c2); color:#fff; padding:12px 24px; border-radius:14px; font-weight:600; text-decoration:none; display:inline-block;">
                    ${isDelegation ? 'CHAT WITH US' : 'CHOOSE PLAN'}
                  </a>
                </td>
              </tr>
            </table>
          </td>

          <!-- ZAGATIYA -->
          <td width="33%" valign="top" style="padding:4px;">
            <table width="100%" height="420" cellpadding="12" cellspacing="0"
              style="background:#f1f1f1;border-radius:20px;">
              <tr>
                  <td valign="top" style="font-size:11px;line-height:1.4;color:#333;">
                  ${zagatiyaHTML}
                </td>
              </tr>

              <!-- SPACER -->
              <tr><td height="60">&nbsp;</td></tr>

              <!-- BUTTON -->
              <tr>
                <td align="center" valign="bottom">
                  <a href="${isDelegation ? whatsappUrl : zagatiyaUrl}" style="background:linear-gradient(90deg,#8c1537,#0b67c2); color:#fff; padding:12px 24px; border-radius:14px; font-weight:600; text-decoration:none; display:inline-block;">
                    ${isDelegation ? 'CHAT WITH US' : 'CHOOSE PLAN'}
                  </a>
                </td>
              </tr>
            </table>
          </td>

        </tr>
      </table>

    </td>
  </tr>
</table>

                   <table width="100%" cellpadding="0" cellspacing="0"
  style="margin-bottom:10px; border-radius:12px; overflow:hidden;">
  <tr>
    <td align="center" style="padding:0;">

      <img
        src="https://6a903f8cfa.imgdist.com/public/users/BeeFree/beefree-4862b855-5df1-4b89-a5ec-bb23e0132b7c/Capture3.PNG"
        alt="Conference Banner"
        width="100%"
        style="
          display:block;
          width:100%;
          max-width:700px;
          height:auto;
          border-radius:12px;
        "
      />

    </td>
  </tr>
</table>


                    <table cellpadding="0" align="center" cellspacing="0" width="100%"
                      style="max-width:570px; margin-bottom:10px;">
                      <tr>
                        <td align="center" style="background:#BABCBE; padding:19px; border-radius:10px;">
                          <div style="font-size:20px; font-weight:bold; color:#FAFAFA; letter-spacing:1px;">
                            please reviewe the terms and conditions below
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table cellpadding="0" align="center" cellspacing="0" width="100%"
                      style="max-width:350px; margin-bottom:10px;">
                      <tr>
                       <td align="center" style="background:linear-gradient(90deg,#8c1537,#0b67c2); padding:19px; border-radius:10px;">
  <a href="${isDelegation ? whatsappUrl : 'https://www.worlddiplomats.org/Terms&Conditions'}" target="_blank" style="text-decoration:none; display:block;">
    <div style="font-size:20px; font-weight:bold; color:#fff; letter-spacing:1px;">
      ${isDelegation ? 'CHAT WITH US' : 'CLICK HERE FOR THE T&C'}
    </div>
  </a>
</td>

                      </tr>
                    </table>

                    <!-- footer//////////////// -->

                    <table width="100%" cellpadding="0" cellspacing="0" style="text-align:center; padding: 20px 0;">

                      <!-- HEADING -->
                      <tr>
                        <td style="color:#0a3b6d;font-size:19px;font-weight:700;padding-bottom:8px;">
                          WE THANK YOU FOR REGISTERING
                        </td>
                      </tr>

                      <!-- SUB TEXT -->
                      <tr>
                        <td style="color:#0a3b6d;font-size:14px;font-weight:400;padding-bottom:18px;">
                          at World Diplomats MUN and await, in <br /> anticipation, to host you at ${country}.
                        </td>
                      </tr>

             <!-- LINKS ROW -->
                    <tr>
                        <td align="center">

                            <table cellpadding="6" cellspacing="0" align="center">

                                <!-- ROW 1 : 3 ITEMS -->
                                <tr>

                                    <!-- INSTAGRAM -->
                                    <td align="center" style="font-size:10px;">
                                        <a href="https://www.instagram.com/worlddiplomats_?igsh=M3ppbG5hcmp5bnJr" target="_blank"
                                            style="color:#0a3b6d;text-decoration:none;">
                                            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                                                width="12" style="vertical-align:middle;">
                                            &nbsp;<span style="text-decoration:underline;">@worlddiplomats_</span>
                                        </a>
                                    </td>

                                    <!-- TIKTOK -->
                                    <td align="center" style="font-size:10px;">
                                        <a href="https://www.tiktok.com/@worlddiplomats" target="_blank"
                                            style="color:#0a3b6d;text-decoration:none;">
                                            <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png"
                                                width="12" style="vertical-align:middle;">
                                            &nbsp;<span style="text-decoration:underline;">@worlddiplomats</span>
                                        </a>
                                    </td>

                                    <!-- FACEBOOK -->
                                    <td align="center" style="font-size:10px;">
                                        <a href="https://www.facebook.com/profile.php?id=61585300508391" target="_blank"
                                            style="color:#0a3b6d;text-decoration:none;">
                                            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111392.png"
                                                width="12" style="vertical-align:middle;">
                                            &nbsp;<span style="text-decoration:underline;">@worlddiplomats</span>
                                        </a>
                                    </td>

                                    <!-- PHONE -->
                                    <td align="center" style="font-size:10px;">
                                        <a href="tel:+447490344639" style="color:#0a3b6d;text-decoration:none;">
                                            <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" width="12"
                                                style="vertical-align:middle;">
                                            &nbsp;<span style="text-decoration:underline;">+44 7490344639</span>
                                        </a>
                                    </td>

                                </tr>

                                <!-- ROW 2 : 2 ITEMS (CENTERED) -->
                               

                            </table>

                        </td>
                    </tr>


                     <tr>
                        <td align="center">

                            <table cellpadding="6" cellspacing="0" align="center">

                                
 <tr>

                                    <!-- EMAIL -->
                                    <td align="center" colspan="1" style="font-size:10px;">
                                        <a href="mailto:info@worlddiplomats.org"
                                            style="color:#0a3b6d;text-decoration:none;">
                                            <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" width="12"
                                                style="vertical-align:middle;">
                                            &nbsp;<span
                                                style="text-decoration:underline;">info@worlddiplomats.org</span>
                                        </a>
                                    </td>

                                    <!-- WEBSITE -->
                                    <td align="center" colspan="1" style="font-size:10px;">
                                        <a href="https://worlddiplomats.org" target="_blank"
                                            style="color:#0a3b6d;text-decoration:none;">
                                            <img src="https://cdn-icons-png.flaticon.com/512/44/44386.png" width="12"
                                                style="vertical-align:middle;">
                                            &nbsp;<span style="text-decoration:underline;">worlddiplomats.org</span>
                                        </a>
                                    </td>

                                </tr>



                                <!-- ROW 2 : 2 ITEMS (CENTERED) -->
                               

                            </table>

                        </td>
                        
                    </tr>


                    </table>



                  </td>

                  <!-- RIGHT COLOR STRIP -->
                  <td width="10" valign="top" style="background: linear-gradient(to bottom,
          #EB1C2E 0 7.6923%,
#D4A02A 7.6923% 15.3846%,
#279B48 15.3846% 23.0769%,
#F44D24 23.0769% 30.7692%,
#00B0DA 30.7692% 38.4615%,
#FDBD18 38.4615% 46.1538%,
#E3155A 46.1538% 53.8461%,
#3A7E36 53.8461% 61.5384%,
#007FC7 61.5384% 69.2307%,
#E3155A 69.2307% 76.923%,
#50AF44 76.923% 84.6153%,
#003C70 84.6153% 92.3076%,
#E3155A 92.3076% 100%);
              background-repeat:no-repeat;background-size:28px 100%;min-height:1200px;">
                    &nbsp;
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- END MAIN CONTAINER -->

      </td>
    </tr>
  </table>

</body>

</html>`,
          });

          console.log(`✅ Email sent to ${email}`);

          // 🔄 Update all sent notifications
          const ids = notifs.map(n => n.id);
          await strapi.db.query('api::notification.notification').updateMany({
            where: { id: { $in: ids } },
            data: { emailSent: true },
          });
        } catch (err) {
          console.error(`❌ Failed to process email for ${email}:`, err.message);
        }
      }
    } catch (err) {
      console.error('❌ Cron Job Error:', err.message);
    }
  },
};

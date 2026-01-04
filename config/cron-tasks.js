const nodemailer = require('nodemailer');

module.exports = {
  // CRON: Runs every minute
  // ok
  '*/1 * * * *': async ({ strapi }) => {
    try {
      const oneHourAgo = new Date(Date.now() - 8 * 60 * 60 * 1000)


      const notifications = await strapi.db.query('api::notification.notification').findMany({
        where: {
          emailSent: false,
          createdAt: { $lt: oneHourAgo }
        },
      });

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

      for (const [email, notifs] of Object.entries(emailGroups)) {
        const {
          FirstName: userName = 'User',
          Idname: userId = '',
          Destinations: destination = '',
          startdate: startdate = '',
          enddate: enddate = '',
          month: month = '',
          year: year = '',
 


  } = notifs[0] || {};
  

        if (destination == "Dubai, UAE") {
          var desname = "Dubai, UAE";
          var country = "UAE";
          // var date = "13<sup>th</sup> - 16<sup>th</sup> February 2026 ,"
          // var cheackoutdate = "13 February 2026 and check-out on 16 February 2026,"
          // var payment = "UAEpayment"
          // var basicprice = "459"
          // var fullprice = "679"
          // var serves1 = "Visa invitation letter"
          // var serves2 = "Airport Assistance (Arrival)"
          // var Hotel = "Meydan Hotel, Meydan"
          // var para = "  You have been recognized as an Early Bird Applicant and are eligible for free airport Assistance in the host country on your arrival for AtsasMUN UAE."
          var CityTour = "Dubai City Tour"


        } else if (destination == "Kuala Lumpur, Malaysia")  {
          var desname = "Kuala Lumpur, Malaysia";
          var country = "Azerbaijan";
          // var date = "6<sup>th</sup> - 9<sup>th</sup> November 2025,"
          // var cheackoutdate = "6th November 2025 and check-out on 9th November 2025,"
          // var payment = "Azerbaijanpayment"
          // var basicprice = "349"
          // var fullprice = "499"
          // var Hotel = "Hilton Baku"
          // var para = "  You have been recognized as an Early Bird Applicant and are eligible for free airport Assistance in the host country on your arrival for AtsasMUN Azerbaijan."
          var CityTour = "Baku City Tour"


        } else if (destination == "New York, USA") {
          var desname = "New York, USA";
          var country = "USA";
          // var date = "12<sup>th</sup> - 15<sup>th</sup> February 2026,"
          // var cheackoutdate = "12th February 2026 and check-out on 15th February 2026,"
          // var payment = "USApayment"
          // var basicprice = "979"
          // var fullprice = "1599"
          // var serves1 = "Visa invitation letter"
          // var serves2 = "Airport Assistance (Arrival)"
          // var Hotel = "East Brunswick Hotel"
          // var para = "  You have been recognized as an Early Bird Applicant and are eligible for free airport Assistance in the host country on your arrival for AtsasMUN USA."
          var CityTour = "New York City Tour"




        } else if (destination == "Riyadh, Saudi Arabia") {
          var desname = "Riyadh, Saudi Arabia";
          var country = "Saudi Arabia";
          // var date = "1<sup>st</sup> - 4<sup>th</sup> october 2026,"
          // var cheackoutdate = "1st October 2026 and check-out on 4th October 2026,"
          // var payment = "Saudipayment"
          // var basicprice = "649"
          // var fullprice = "799"
          // var Hotel = "Hilton Riyadh Hotel"
          // var para = "  You have been recognized as an Early Bird Applicant and are eligible for free airport Assistance in the host country on your arrival for AtsasMUN Saudi Arabia."
          var CityTour = "Riyadh City Tour"




        } else if (destination == "London, UK") {
          var desname = "London, UK";
          var country = "UK";
          // var date = "22<sup>nd</sup> - 25<sup>th</sup> January 2026,"
          // var cheackoutdate = "22nd January 2026 and check-out on 25th January 2026,"
          // var payment = "UKpayment"
          // var basicprice = "959"
          // var fullprice = "1659"
          // var Hotel = "Sunway Putra Hotel"
          // var para = "  You have been recognized as an Early Bird Applicant and are eligible for free airport Assistance in the host country on your arrival for AtsasMUN UK."
          var CityTour = "London City Tour"





        } else if (destination == "Istanbul, Turkey") {
          var desname = "Istanbul, Turkey";
          var country = "Turkey";
          // var date = "11<sup>th</sup> - 14<sup>th</sup> September 2025,"
          // var cheackoutdate = "11th September 2025 and check-out on 14th September 2026,"
          // var payment = "Istanbulpayment"
          // var basicprice = "389"
          // var fullprice = "639"
          // var serves1 = "Visa invitation letter"
          // var serves2 = "Airport Assistance (Arrival)"
          // var Hotel = "G Rotana Hotel"
          var CityTour = "Istanbul City Tour"


        }
        // Add other destination-specific conditions here...
        // Build Zagatiya package HTML dynamically per destination
        var zagatiyaLines = [
          '✓ Everything in Delegate Accommodation Experience'
        ];
        if (CityTour) zagatiyaLines.push('✓ ' + CityTour);

        var _extras = [];
        if (destination == "Istanbul, Turkey") {
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

        _extras.forEach(function(x){ zagatiyaLines.push('✓ ' + x); });
        var zagatiyaHTML = zagatiyaLines.join('<br><br>');
        
        // Map destination names to payment route prefixes and build plan links
        const paymentRouteMap = {
          'Dubai, UAE': 'Dubaipayment',
          'Kuala Lumpur, Malaysia': 'Malaysiapayment',
          'New York, USA': 'USApayment',
          'Riyadh, Saudi Arabia': 'Saudipayment',
          'London, UK': 'Londonpayment',
          'Istanbul, Turkey': 'Istanbulpayment',
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
          // 📧 Send email directly
          transporter.sendMail({
            from: 'World Diplomats <info@worlddiplomats.org>',
            to: email,
            subject: 'YOUR LETTER OF ACCEPTANCE',
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
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td align="center" style="padding:5px;">
                          <table style="margin:0 auto;">
                            <tr>
                              <td style="padding-right:12px; vertical-align:middle;">
                                <img
                                  src="https://6a903f8cfa.imgdist.com/public/users/BeeFree/beefree-4862b855-5df1-4b89-a5ec-bb23e0132b7c/Untitled_design-removebg-preview.png"
                                  width="80" style="display:block;">
                              </td>
                              <td
                                style="font-size:25px; font-weight:800; color:#0a3b6d; vertical-align:middle; text-align:left;">
                                WORLD<br><span style="color:#9aa3ab; font-weight:700;">DIPLOMATS</span>
                              </td>
                            </tr>
                          </table>
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
                            (Pathway to the MUN) and go to your Personal Portal to book your place timely. We extend our
                            heartiest welcome to you and await to see you at Istanbul International MUN.
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
                  <a href="${basicUrl}" style="background:linear-gradient(90deg,#8c1537,#0b67c2); color:#fff; padding:12px 24px; border-radius:14px; font-weight:600; text-decoration:none; display:inline-block;">
                    CHOOSE PLAN
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
                  <a href="${shepandumUrl}" style="background:linear-gradient(90deg,#8c1537,#0b67c2); color:#fff; padding:12px 24px; border-radius:14px; font-weight:600; text-decoration:none; display:inline-block;">
                    CHOOSE PLAN
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
                  <a href="${zagatiyaUrl}" style="background:linear-gradient(90deg,#8c1537,#0b67c2); color:#fff; padding:12px 24px; border-radius:14px; font-weight:600; text-decoration:none; display:inline-block;">
                    CHOOSE PLAN
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
  <a href="https://www.worlddiplomats.org/Terms&Conditions" target="_blank" style="text-decoration:none; display:block;">
    <div style="font-size:20px; font-weight:bold; color:#fff; letter-spacing:1px;">
      CLICK HERE FOR THE T&C
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
                                        <a href="https://www.instagram.com/worlddiplomatsmun/" target="_blank"
                                            style="color:#0a3b6d;text-decoration:none;">
                                            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                                                width="12" style="vertical-align:middle;">
                                            &nbsp;<span style="text-decoration:underline;">@worlddiplomatsmun</span>
                                        </a>
                                    </td>

                                    <!-- FACEBOOK -->
                                    <td align="center" style="font-size:10px;">
                                        <a href="https://www.facebook.com/worlddiplomats" target="_blank"
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
            }, async (err, info) => {
              if (err) {
                console.error(`❌ Failed to send email for ${email}:`, err.message);
              } else {
                console.log(`✅ Email sent to ${email}`);

                // 🔄 Update all sent notifications
                const ids = notifs.map(n => n.id);
                await strapi.db.query('api::notification.notification').updateMany({
                  where: { id: { $in: ids } },
                  data: { emailSent: true },
                });
              }
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

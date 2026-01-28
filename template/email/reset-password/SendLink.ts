export function sendLink(link: string): string {
  return `
  <!DOCTYPE html>
  <html dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>استعادة كلمة السر</title>
    </head>
    <body style="margin:0;padding:0;background-color:#000000;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center" style="padding:30px 0;">
                  <img 
                    src="https://res.cloudinary.com/djovbiyia/image/upload/v1769532345/756335bc-879f-4e28-811f-41ccf97effa1_f1mmiq.png"
                    alt="Fsoceity Logo"
                    width="200"
                    style="display:block;border-radius: 15px;"
                  />
                </td>
              </tr>
              <tr>
                <td align="center" style="color:#ffffff;font-size:28px;font-weight:bold;">
                  منصة علمني
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:40px 0;">
                  <a
                    href="${link}"
                    style="
                      display:inline-block;
                      padding:14px 28px;
                      background-color:#ffffff20;
                      color:#ffffff;
                      text-decoration:none;
                      font-weight:bold;
                      border-radius:6px;
                      font-size:16px;
                    ">
                   اعادة تعيين كلمة السر
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
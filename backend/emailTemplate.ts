export const htmlContentProvider = (url:string)=>(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        background-color: #fff;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #ddd;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        color: #333;
      }
      .content {
        padding: 20px;
        text-align: center;
      }
      .content p {
        font-size: 16px;
        line-height: 1.5;
        color: #666;
      }
      .button {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 16px;
        color: #ffffff;
        background-color: #007bff;
        text-decoration: none;
        border-radius: 5px;
        transition: background-color 0.3s ease;
      }
      .button:hover {
        background-color: #0056b3;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        text-align: center;
        font-size: 12px;
        color: #aaa;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Email Verification</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Thank you for registering with us. Please click the button below to verify your email address.</p>
        <a href="${url}" class="button">Verify Email</a>
      </div>
      <div class="footer">
        <p>If you did not sign up for this account, please ignore this email.</p>
      </div>
    </div>
  </body>
  </html>`)

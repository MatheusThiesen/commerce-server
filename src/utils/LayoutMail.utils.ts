interface ForgotProps {
  link: string;
}

export class LayoutMail {
  async forgot({ link }: ForgotProps) {
    const messageEmail = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:v="urn:schemas-microsoft-com:vml"
    >
    <head>
      <!--[if gte mso 9
        ]><xml
          ><o:OfficeDocumentSettings
            ><o:AllowPNG /><o:PixelsPerInch
              >96</o:PixelsPerInch
            ></o:OfficeDocumentSettings
          ></xml
        ><!
      [endif]-->
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
      <meta content="width=device-width" name="viewport" />
      <!--[if !mso]><!-->
      <meta content="IE=edge" http-equiv="X-UA-Compatible" />
      <!--<![endif]-->
      <title></title>
      <!--[if !mso]><!-->
      <link
        href="https://fonts.googleapis.com/css?family=Cabin"
        rel="stylesheet"
        type="text/css"
      />
      <link
        href="https://fonts.googleapis.com/css?family=Montserrat"
        rel="stylesheet"
        type="text/css"
      />
      <!--<![endif]-->
      <style type="text/css">
        body {
          margin: 0;
          padding: 0;
        }

        table,
        td,
        tr {
          vertical-align: top;
          border-collapse: collapse;
        }

        * {
          line-height: inherit;
        }

        a[x-apple-data-detectors="true"] {
          color: inherit !important;
          text-decoration: none !important;
        }
      </style>
      <style id="media-query" type="text/css">
        @media (max-width: 670px) {
          .block-grid,
          .col {
            min-width: 320px !important;
            max-width: 100% !important;
            display: block !important;
          }

          .block-grid {
            width: 100% !important;
          }

          .col {
            width: 100% !important;
          }

          .col_cont {
            margin: 0 auto;
          }

          img.fullwidth,
          img.fullwidthOnMobile {
            max-width: 100% !important;
          }

          .no-stack .col {
            min-width: 0 !important;
            display: table-cell !important;
          }

          .no-stack.two-up .col {
            width: 50% !important;
          }

          .no-stack .col.num2 {
            width: 16.6% !important;
          }

          .no-stack .col.num3 {
            width: 25% !important;
          }

          .no-stack .col.num4 {
            width: 33% !important;
          }

          .no-stack .col.num5 {
            width: 41.6% !important;
          }

          .no-stack .col.num6 {
            width: 50% !important;
          }

          .no-stack .col.num7 {
            width: 58.3% !important;
          }

          .no-stack .col.num8 {
            width: 66.6% !important;
          }

          .no-stack .col.num9 {
            width: 75% !important;
          }

          .no-stack .col.num10 {
            width: 83.3% !important;
          }

          .video-block {
            max-width: none !important;
          }

          .mobile_hide {
            min-height: 0px;
            max-height: 0px;
            max-width: 0px;
            display: none;
            overflow: hidden;
            font-size: 0px;
          }

          .desktop_hide {
            display: block !important;
            max-height: none !important;
          }
        }
      </style>
      <style id="icon-media-query" type="text/css">
        @media (max-width: 670px) {
          .icons-inner {
            text-align: center;
          }

          .icons-inner td {
            margin: 0 auto;
          }
        }
      </style>
    </head>
    <body
      class="clean-body"
      style="
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        background-color: #fff;
      "
    >
      <!--[if IE]><div class="ie-browser"><![endif]-->
      <table
        bgcolor="#fff"
        cellpadding="0"
        cellspacing="0"
        class="nl-container"
        role="presentation"
        style="
          table-layout: fixed;
          vertical-align: top;
          min-width: 320px;
          border-spacing: 0;
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          background-color: #000000;
          width: 100%;
        "
        valign="top"
        width="100%"
      >
        <tbody>
          <tr style="vertical-align: top" valign="top">
            <td style="word-break: break-word; vertical-align: top" valign="top">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#000000"><![endif]-->
              <div style="background-color: #fff">
                <div
                  class="block-grid"
                  style="
                    min-width: 320px;
                    max-width: 650px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    word-break: break-word;
                    margin: 0 auto;
                    background-color: transparent;
                  "
                >
                  <div
                    style="
                      border-collapse: collapse;
                      display: table;
                      width: 100%;
                      background-color: transparent;
                    "
                  >
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                    <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:transparent;width:650px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                    <div
                      class="col num12"
                      style="
                        min-width: 320px;
                        max-width: 650px;
                        display: table-cell;
                        vertical-align: top;
                        width: 650px;
                      "
                    >
                      <div class="col_cont" style="width: 100% !important">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                          style="
                            border-top: 0px solid transparent;
                            border-left: 0px solid transparent;
                            border-bottom: 0px solid transparent;
                            border-right: 0px solid transparent;
                            padding-top: 5px;
                            padding-bottom: 5px;
                            padding-right: 0px;
                            padding-left: 0px;
                          "
                        >
                          <!--<![endif]-->
                          <div
                            align="center"
                            class="img-container center fixedwidth"
                            style="padding-right: 15px; padding-left: 15px"
                          >
                            <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px"><td style="padding-right: 15px;padding-left: 15px;" align="center"><![endif]-->
                            <div style="font-size: 1px; line-height: 15px"> </div>
                            <img
                              align="center"
                              alt="your logo"
                              border="0"
                              class="center fixedwidth"
                              src="https://alpar.sfo3.digitaloceanspaces.com/Alpar/logo-red.png"
                              style="
                                text-decoration: none;
                                -ms-interpolation-mode: bicubic;
                                height: auto;
                                border: 0;
                                width: 100%;
                                max-width: 130px;
                                display: block;
                              "
                              title="your logo"
                              width="130"
                            />
                            <div style="font-size: 1px; line-height: 15px"> </div>
                            <!--[if mso]></td></tr></table><![endif]-->
                          </div>
                          <!--[if (!mso)&(!IE)]><!-->
                        </div>
                        <!--<![endif]-->
                      </div>
                    </div>
                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                  </div>
                </div>
              </div>
              <div style="background-color: #fff">
                <div
                  class="block-grid"
                  style="
                    min-width: 320px;
                    max-width: 650px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    word-break: break-word;
                    margin: 0 auto;
                    background-color: #fff;
                  "
                >
                  <div
                    style="
                      border-collapse: collapse;
                      display: table;
                      width: 100%;
                      background-color: #fff;
                    "
                  >
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:#fff"><![endif]-->
                    <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:#fff;width:650px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:0px;"><![endif]-->
                    <div
                      class="col num12"
                      style="
                        min-width: 320px;
                        max-width: 650px;
                        display: table-cell;
                        vertical-align: top;
                        width: 650px;
                      "
                    >
                      <div class="col_cont" style="width: 100% !important">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                          style="
                            border-top: 0px solid transparent;
                            border-left: 0px solid transparent;
                            border-bottom: 0px solid transparent;
                            border-right: 0px solid transparent;
                            padding-top: 0px;
                            padding-bottom: 0px;
                            padding-right: 0px;
                            padding-left: 0px;
                          "
                        >
                          <!--<![endif]-->
                          <div
                            align="center"
                            class="img-container center fixedwidth"
                            style="padding-right: 0px; padding-left: 5px"
                          >
                            <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px"><td style="padding-right: 0px;padding-left: 5px;" align="center"><!
                            [endif]--><img
                              align="center"
                              alt="Esqueceu sua senha?"
                              border="0"
                              class="center fixedwidth"
                              src="https://alpar.sfo3.digitaloceanspaces.com/Alpar/password.png"
                              style="
                                text-decoration: none;
                                -ms-interpolation-mode: bicubic;
                                height: auto;
                                border: 0;
                                width: 100%;
                                max-width: 130px;
                                display: block;
                              "
                              title="Esqueceu sua senha?"
                              width="130"
                            />
                            <!--[if mso]></td></tr></table><![endif]-->
                          </div>
                          <table
                            cellpadding="0"
                            cellspacing="0"
                            role="presentation"
                            style="
                              table-layout: fixed;
                              vertical-align: top;
                              border-spacing: 0;
                              border-collapse: collapse;
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                            "
                            valign="top"
                            width="100%"
                          >
                            <tr style="vertical-align: top" valign="top">
                              <td
                                align="center"
                                style="
                                  word-break: break-word;
                                  vertical-align: top;
                                  padding-bottom: 0px;
                                  padding-left: 0px;
                                  padding-right: 0px;
                                  padding-top: 35px;
                                  text-align: center;
                                  width: 100%;
                                "
                                valign="top"
                                width="100%"
                              >
                                <h1
                                  style="
                                    color: #d21e26;
                                    direction: ltr;
                                    font-family: 'Cabin', Arial, 'Helvetica Neue',
                                      Helvetica, sans-serif;
                                    font-size: 28px;
                                    font-weight: normal;
                                    letter-spacing: normal;
                                    line-height: 120%;
                                    text-align: center;
                                    margin-top: 0;
                                    margin-bottom: 0;
                                  "
                                >
                                  <strong>Esqueceu sua senha?</strong>
                                </h1>
                              </td>
                            </tr>
                          </table>
                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 45px; padding-left: 45px; padding-top: 10px; padding-bottom: 0px; font-family: Arial, sans-serif"><![endif]-->
                          <div
                            style="
                              color: #393d47;
                              font-family: 'Cabin', Arial, 'Helvetica Neue',
                                Helvetica, sans-serif;
                              line-height: 1.5;
                              padding-top: 10px;
                              padding-right: 45px;
                              padding-bottom: 0px;
                              padding-left: 45px;
                            "
                          >
                            <div
                              class="txtTinyMce-wrapper"
                              style="
                                line-height: 1.5;
                                font-size: 12px;
                                font-family: 'Cabin', Arial, 'Helvetica Neue',
                                  Helvetica, sans-serif;
                                color: #393d47;
                                mso-line-height-alt: 18px;
                              "
                            >
                              <p
                                style="
                                  margin: 0;
                                  text-align: center;
                                  line-height: 1.5;
                                  word-break: break-word;
                                  font-size: 18px;
                                  mso-line-height-alt: 27px;
                                  margin-top: 0;
                                  margin-bottom: 0;
                                "
                              >
                                <span style="font-size: 18px; color: #888"
                                  >Recebemos uma solicitação para redefinir sua
                                  senha.</span
                                >
                              </p>
                              <p
                                style="
                                  margin: 0;
                                  text-align: center;
                                  line-height: 1.5;
                                  word-break: break-word;
                                  font-size: 18px;
                                  mso-line-height-alt: 27px;
                                  margin-top: 0;
                                  margin-bottom: 0;
                                "
                              >
                                <span style="font-size: 18px; color: #888"
                                  >Se você não fez solicitação, simplesmente
                                  ignore este e-mail.</span
                                >
                              </p>
                            </div>
                          </div>
                          <!--[if mso]></td></tr></table><![endif]-->
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            class="divider"
                            role="presentation"
                            style="
                              table-layout: fixed;
                              vertical-align: top;
                              border-spacing: 0;
                              border-collapse: collapse;
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              min-width: 100%;
                              -ms-text-size-adjust: 100%;
                              -webkit-text-size-adjust: 100%;
                            "
                            valign="top"
                            width="100%"
                          >
                            <tbody>
                              <tr style="vertical-align: top" valign="top">
                                <td
                                  class="divider_inner"
                                  style="
                                    word-break: break-word;
                                    vertical-align: top;
                                    min-width: 100%;
                                    -ms-text-size-adjust: 100%;
                                    -webkit-text-size-adjust: 100%;
                                    padding-top: 20px;
                                    padding-right: 20px;
                                    padding-bottom: 20px;
                                    padding-left: 20px;
                                  "
                                  valign="top"
                                >
                                  <table
                                    align="center"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    class="divider_content"
                                    role="presentation"
                                    style="
                                      table-layout: fixed;
                                      vertical-align: top;
                                      border-spacing: 0;
                                      border-collapse: collapse;
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      border-top: 1px solid #888;
                                      width: 80%;
                                    "
                                    valign="top"
                                    width="80%"
                                  >
                                    <tbody>
                                      <tr
                                        style="vertical-align: top"
                                        valign="top"
                                      >
                                        <td
                                          style="
                                            word-break: break-word;
                                            vertical-align: top;
                                            -ms-text-size-adjust: 100%;
                                            -webkit-text-size-adjust: 100%;
                                          "
                                          valign="top"
                                        >
                                          <span></span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 45px; padding-left: 45px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]-->
                          <div
                            style="
                              color: #393d47;
                              font-family: 'Cabin', Arial, 'Helvetica Neue',
                                Helvetica, sans-serif;
                              line-height: 1.5;
                              padding-top: 10px;
                              padding-right: 45px;
                              padding-bottom: 10px;
                              padding-left: 45px;
                            "
                          >
                            <div
                              class="txtTinyMce-wrapper"
                              style="
                                line-height: 1.5;
                                font-size: 12px;
                                font-family: 'Cabin', Arial, 'Helvetica Neue',
                                  Helvetica, sans-serif;
                                text-align: center;
                                color: #393d47;
                                mso-line-height-alt: 18px;
                              "
                            >
                              <p
                                style="
                                  margin: 0;
                                  line-height: 1.5;
                                  word-break: break-word;
                                  mso-line-height-alt: 18px;
                                  margin-top: 0;
                                  margin-bottom: 0;
                                "
                              >
                                Se você fez essa solicitação, basta clicar no
                                botão abaixo:
                              </p>
                            </div>
                          </div>
                          <!--[if mso]></td></tr></table><![endif]-->
                          <div
                            align="center"
                            class="button-container"
                            style="
                              padding-top: 10px;
                              padding-right: 10px;
                              padding-bottom: 10px;
                              padding-left: 10px;
                            "
                          >
                            <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;"><tr><td style="padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${link}" style="height:40.5pt;width:249.75pt;v-text-anchor:middle;" arcsize="15%" strokeweight="0.75pt" strokecolor="#d21e26" fillcolor="#d21e26"><w:anchorlock/><v:textbox inset="0,0,0,0"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><!
                            [endif]--><a
                              href="${link}"
                              style="
                                -webkit-text-size-adjust: none;
                                text-decoration: none;
                                display: inline-block;
                                color: #ffffff;
                                background-color: #d21e26;
                                border-radius: 8px;
                                -webkit-border-radius: 8px;
                                -moz-border-radius: 8px;
                                width: auto;
                                width: auto;
                                border-top: 1px solid #d21e26;
                                border-right: 1px solid #d21e26;
                                border-bottom: 1px solid #d21e26;
                                border-left: 1px solid #d21e26;
                                padding-top: 10px;
                                padding-bottom: 10px;
                                font-family: 'Cabin', Arial, 'Helvetica Neue',
                                  Helvetica, sans-serif;
                                text-align: center;
                                mso-border-alt: none;
                                word-break: keep-all;
                              "
                              target="_blank"
                              ><span
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-size: 16px;
                                  display: inline-block;
                                  letter-spacing: undefined;
                                "
                                ><span
                                  style="
                                    font-size: 16px;
                                    line-height: 2;
                                    word-break: break-word;
                                    mso-line-height-alt: 32px;
                                  "
                                  >RESETAR MINHA SENHA</span
                                ></span
                              ></a
                            >
                            <!--[if mso]></center></v:textbox></v:roundrect></td></tr></table><![endif]-->
                          </div>
                          <!--[if (!mso)&(!IE)]><!-->
                        </div>
                        <!--<![endif]-->
                      </div>
                    </div>
                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                  </div>
                </div>
              </div>

              <div style="background-color: #fff">
                <div
                  class="block-grid"
                  style="
                    min-width: 320px;
                    max-width: 650px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    word-break: break-word;
                    margin: 0 auto;
                    background-color: transparent;
                  "
                >
                  <div
                    style="
                      border-collapse: collapse;
                      display: table;
                      width: 100%;
                      background-color: transparent;
                    "
                  >
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                    <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:transparent;width:650px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:10px;"><![endif]-->
                    <div
                      class="col num12"
                      style="
                        min-width: 320px;
                        max-width: 650px;
                        display: table-cell;
                        vertical-align: top;
                        width: 650px;
                      "
                    >
                      <div class="col_cont" style="width: 100% !important">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                          style="
                            border-top: 0px solid transparent;
                            border-left: 0px solid transparent;
                            border-bottom: 0px solid transparent;
                            border-right: 0px solid transparent;
                            padding-top: 0px;
                            padding-bottom: 10px;
                            padding-right: 0px;
                            padding-left: 0px;
                          "
                        >
                          <!--<![endif]-->
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            class="divider"
                            role="presentation"
                            style="
                              table-layout: fixed;
                              vertical-align: top;
                              border-spacing: 0;
                              border-collapse: collapse;
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              min-width: 100%;
                              -ms-text-size-adjust: 100%;
                              -webkit-text-size-adjust: 100%;
                            "
                            valign="top"
                            width="100%"
                          >
                            <tbody>
                              <tr style="vertical-align: top" valign="top">
                                <td
                                  class="divider_inner"
                                  style="
                                    word-break: break-word;
                                    vertical-align: top;
                                    min-width: 100%;
                                    -ms-text-size-adjust: 100%;
                                    -webkit-text-size-adjust: 100%;
                                    padding-top: 5px;
                                    padding-right: 5px;
                                    padding-bottom: 5px;
                                    padding-left: 5px;
                                  "
                                  valign="top"
                                >
                                  <table
                                    align="center"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    class="divider_content"
                                    role="presentation"
                                    style="
                                      table-layout: fixed;
                                      vertical-align: top;
                                      border-spacing: 0;
                                      border-collapse: collapse;
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                      border-top: 0px solid #bbbbbb;
                                      width: 100%;
                                    "
                                    valign="top"
                                    width="100%"
                                  >
                                    <tbody>
                                      <tr
                                        style="vertical-align: top"
                                        valign="top"
                                      >
                                        <td
                                          style="
                                            word-break: break-word;
                                            vertical-align: top;
                                            -ms-text-size-adjust: 100%;
                                            -webkit-text-size-adjust: 100%;
                                          "
                                          valign="top"
                                        >
                                          <span></span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table
                            cellpadding="0"
                            cellspacing="0"
                            class="social_icons"
                            role="presentation"
                            style="
                              table-layout: fixed;
                              vertical-align: top;
                              border-spacing: 0;
                              border-collapse: collapse;
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                            "
                            valign="top"
                            width="100%"
                          >
                            <tbody>
                              <tr style="vertical-align: top" valign="top">
                                <td
                                  style="
                                    word-break: break-word;
                                    vertical-align: top;
                                    padding-top: 10px;
                                    padding-right: 10px;
                                    padding-bottom: 10px;
                                    padding-left: 10px;
                                  "
                                  valign="top"
                                >
                                  <table
                                    align="center"
                                    cellpadding="0"
                                    cellspacing="0"
                                    class="social_table"
                                    role="presentation"
                                    style="
                                      table-layout: fixed;
                                      vertical-align: top;
                                      border-spacing: 0;
                                      border-collapse: collapse;
                                      mso-table-tspace: 0;
                                      mso-table-rspace: 0;
                                      mso-table-bspace: 0;
                                      mso-table-lspace: 0;
                                    "
                                    valign="top"
                                  >
                                    <tbody>
                                      <tr
                                        align="center"
                                        style="
                                          vertical-align: top;
                                          display: inline-block;
                                          text-align: center;
                                        "
                                        valign="top"
                                      >
                                        <td
                                          style="
                                            word-break: break-word;
                                            vertical-align: top;
                                            padding-bottom: 0;
                                            padding-right: 2.5px;
                                            padding-left: 2.5px;
                                            opacity: 0.5;
                                          "
                                          valign="top"
                                        >
                                          <a
                                            href="https://www.linkedin.com/company/alpardobrasil"
                                            target="_blank"
                                            ><img
                                              RESETAR
                                              MINHA
                                              alt="LinkedIn"
                                              height="20"
                                              src="https://alpar.sfo3.digitaloceanspaces.com/Alpar/linkedin.png"
                                              style="
                                                text-decoration: none;
                                                -ms-interpolation-mode: bicubic;
                                                height: auto;
                                                border: 0;
                                                display: block;
                                              "
                                              title="LinkedIn"
                                              width="20"
                                          /></a>
                                        </td>

                                        <td
                                          style="
                                            word-break: break-word;
                                            vertical-align: top;
                                            padding-bottom: 0;
                                            padding-right: 2.5px;
                                            padding-left: 2.5px;
                                            opacity: 0.5;
                                          "
                                          valign="top"
                                        >
                                          <a
                                            href="https://www.instagram.com/alpardobrasil"
                                            target="_blank"
                                            ><img
                                              alt="Instagram"
                                              height="20"
                                              src="https://alpar.sfo3.digitaloceanspaces.com/Alpar/instagram.png"
                                              style="
                                                text-decoration: none;
                                                -ms-interpolation-mode: bicubic;
                                                height: auto;
                                                border: 0;
                                                display: block;
                                              "
                                              title="Instagram"
                                              width="20"
                                          /></a>
                                        </td>

                                        <td
                                          style="
                                            word-break: break-word;
                                            vertical-align: top;
                                            padding-bottom: 0;
                                            padding-right: 2.5px;
                                            padding-left: 2.5px;
                                            opacity: 0.5;
                                          "
                                          valign="top"
                                        >
                                          <a
                                            href="https://api.whatsapp.com/send?phone=555134411000"
                                            target="_blank"
                                            ><img
                                              alt="Whatsapp"
                                              height="20"
                                              src="https://alpar.sfo3.digitaloceanspaces.com/Alpar/whatsapp.png"
                                              style="
                                                text-decoration: none;
                                                -ms-interpolation-mode: bicubic;
                                                height: auto;
                                                border: 0;
                                                display: block;
                                              "
                                              title="WhatsApp"
                                              width="20"
                                          /></a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <!--[if (!mso)&(!IE)]><!-->
                        </div>
                        <!--<![endif]-->
                      </div>
                    </div>
                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                  </div>
                </div>
              </div>

              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
      <!--[if (IE)]></div><![endif]-->
    </body>
  </html>
`;

    return messageEmail;
  }
}

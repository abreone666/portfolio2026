<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>

  <xsl:template match="/">
    <html lang="it">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta name="robots" content="noindex, follow"/>
        <title>Sitemap – antonioilacqua.it</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #060e0d;
            color: #e2e8e7;
            min-height: 100vh;
            padding: 2rem 1rem 4rem;
          }

          .container {
            max-width: 860px;
            margin: 0 auto;
          }

          header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba(29,158,117,.2);
          }

          .logo-mark {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: #1d9e75;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 1.1rem;
            color: #fff;
            flex-shrink: 0;
          }

          header h1 {
            font-size: 1.1rem;
            font-weight: 700;
            color: #fff;
          }

          header p {
            font-size: 0.8rem;
            color: #6b8f85;
            margin-top: .15rem;
          }

          .stats {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }

          .stat {
            background: rgba(29,158,117,.08);
            border: 1px solid rgba(29,158,117,.15);
            border-radius: 10px;
            padding: .6rem 1rem;
            font-size: .8rem;
            color: #6b8f85;
          }

          .stat strong {
            display: block;
            font-size: 1.3rem;
            font-weight: 800;
            color: #1d9e75;
            line-height: 1.2;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          thead th {
            text-align: left;
            font-size: .7rem;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: #4a7069;
            padding: .6rem .8rem;
            border-bottom: 1px solid rgba(255,255,255,.06);
          }

          tbody tr {
            border-bottom: 1px solid rgba(255,255,255,.04);
            transition: background .15s;
          }

          tbody tr:hover { background: rgba(29,158,117,.05); }

          tbody td {
            padding: .75rem .8rem;
            font-size: .85rem;
            vertical-align: middle;
          }

          .url-cell a {
            color: #5dd4ad;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
          }

          .url-cell a:hover { text-decoration: underline; }

          .url-path {
            font-size: .75rem;
            color: #4a7069;
            margin-top: .15rem;
          }

          .badge {
            display: inline-block;
            padding: .2rem .55rem;
            border-radius: 999px;
            font-size: .7rem;
            font-weight: 600;
          }

          .badge-high   { background: rgba(29,158,117,.15); color: #5dd4ad; }
          .badge-medium { background: rgba(100,160,140,.1);  color: #7fb8a4; }
          .badge-low    { background: rgba(255,255,255,.05); color: #6b8f85; }

          .priority-bar {
            width: 100%;
            height: 4px;
            background: rgba(255,255,255,.06);
            border-radius: 99px;
            margin-top: .3rem;
            overflow: hidden;
          }

          .priority-fill {
            height: 100%;
            border-radius: 99px;
            background: #1d9e75;
          }

          .lastmod { color: #6b8f85; font-size: .8rem; }

          footer {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255,255,255,.05);
            text-align: center;
            font-size: .75rem;
            color: #3a5c55;
          }

          footer a { color: #1d9e75; text-decoration: none; }
          footer a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">

          <header>
            <div class="logo-mark">AI</div>
            <div>
              <h1>antonioilacqua.it — Sitemap</h1>
              <p>Mappa del sito per motori di ricerca</p>
            </div>
          </header>

          <div class="stats">
            <div class="stat">
              <strong><xsl:value-of select="count(sm:urlset/sm:url)"/></strong>
              Pagine indicizzate
            </div>
            <div class="stat">
              <strong><xsl:value-of select="count(sm:urlset/sm:url[sm:priority >= 0.7])"/></strong>
              Alta priorità
            </div>
            <div class="stat">
              <strong><xsl:value-of select="count(sm:urlset/sm:url[contains(sm:loc, '/blog')])"/></strong>
              Articoli blog
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Aggiornamento</th>
                <th>Frequenza</th>
                <th>Priorità</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sm:urlset/sm:url">
                <xsl:sort select="sm:priority" order="descending" data-type="number"/>
                <tr>
                  <td class="url-cell">
                    <a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a>
                  </td>
                  <td class="lastmod"><xsl:value-of select="sm:lastmod"/></td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="sm:changefreq = 'weekly'">
                        <span class="badge badge-high">weekly</span>
                      </xsl:when>
                      <xsl:when test="sm:changefreq = 'monthly'">
                        <span class="badge badge-medium">monthly</span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="badge badge-low"><xsl:value-of select="sm:changefreq"/></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td>
                    <span><xsl:value-of select="sm:priority"/></span>
                    <div class="priority-bar">
                      <div class="priority-fill">
                        <xsl:attribute name="style">
                          width: <xsl:value-of select="number(sm:priority) * 100"/>%
                        </xsl:attribute>
                      </div>
                    </div>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <footer>
            <p>Generato automaticamente · <a href="/">← Torna al sito</a></p>
          </footer>

        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>

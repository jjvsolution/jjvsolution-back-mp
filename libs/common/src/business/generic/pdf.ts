import puppeteer from 'puppeteer';
import * as Promise from 'bluebird';
import hb from 'handlebars';
import * as inlineCss from 'inline-css';

export async function generatePdf(
  file: { content: string; url?: string },
  options: any,
  callback?: any,
) {
  // we are using headless mode
  let args: object = { arg: ['--no-sandbox', '--disable-setuid-sandbox'] };
  if ((options as { args?: object })?.args) {
    args = (options as { args: object }).args;
    delete (options as { args: any }).args;
  }

  args = {
    ...(`${process.env.ENVIRONMENT}` !== 'LOCAL'
      ? {
          executablePath:
            process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
        }
      : {}),
    ...args,
  };
  console.log(JSON.stringify(args));
  const browser = await puppeteer.launch(args);
  const page = await browser.newPage();

  if (file.content) {
    const data = await inlineCss(file.content, { url: '/' });
    console.log('Compiling the template with handlebars');
    // we have compile our code with handlebars
    const template = hb.compile(data, { strict: true });
    const result = template(data);
    const html = result;

    // We set the page content as the generated html by handlebars
    await page.setContent(html, {
      waitUntil: 'networkidle0', // wait for page to load completely
    });
  } else {
    await page.goto(file?.url || '', {
      waitUntil: ['load', 'networkidle0'], // wait for page to load completely
    });
  }

  return Promise.props(page.pdf(options))
    .then(async function (data) {
      await browser.close();

      return Buffer.from(Object.values(data));
    })
    .asCallback(callback);
}

export async function generatePdfs(files, options, callback) {
  // we are using headless mode
  let args = ['--no-sandbox', '--disable-setuid-sandbox'];
  if (options.args) {
    args = options.args;
    delete options.args;
  }
  const browser = await puppeteer.launch({
    args: args,
  });
  let pdfs: object[] = [];
  const page = await browser.newPage();
  for (let file of files) {
    if (file.content) {
      const data = await inlineCss(file.content, { url: '/' });
      console.log('Compiling the template with handlebars');
      // we have compile our code with handlebars
      const template = hb.compile(data, { strict: true });
      const result = template(data);
      const html = result;
      // We set the page content as the generated html by handlebars
      await page.setContent(html, {
        waitUntil: 'networkidle0', // wait for page to load completely
      });
    } else {
      await page.goto(file.url, {
        waitUntil: 'networkidle0', // wait for page to load completely
      });
    }
    let pdfObj: object = JSON.parse(JSON.stringify(file));
    delete pdfObj['content'];
    pdfObj['buffer'] = Buffer.from(Object.values(await page.pdf(options)));
    pdfs.push(pdfObj);
  }

  return Promise.resolve(pdfs)
    .then(async function (data) {
      await browser.close();
      return data;
    })
    .asCallback(callback);
}

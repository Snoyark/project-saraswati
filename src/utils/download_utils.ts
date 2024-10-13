import axios from 'axios';
import * as pdfUtil from 'pdf-ts'
import * as fs from 'fs';
import * as path from 'path';

// Usage
// const pdfUrl = 'http://arxiv.org/pdf/2407.06498v1';
// const outputPath = './download.pdf';

// downloadPdf(pdfUrl, outputPath)
//   .then(() => console.log('PDF downloaded successfully'))
//   .catch((error) => console.error('Failed to download PDF:', error));
export async function downloadPdf(url: string, outputPath: string): Promise<void> {
  try {
    // Make a GET request to the URL
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    }).then((res) => {
      console.log('downloaded successfully')
      return res
    })
    .catch((err) => {
      console.log(`failed to download`)
      throw new Error('failed to download file')
    });

    // Pipe the response data to a file
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

// Usage
// ingest_pdf_to_text('./download.pdf')
export async function ingest_pdf_to_text(path: string): Promise<string> {
  const pdf_file = await fs.readFileSync(path)
  const text = await pdfUtil.pdfToText(pdf_file)
  return text
}

export async function removeFile(path: string) {
  fs.unlinkSync(path)
}
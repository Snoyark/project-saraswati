import axios from 'axios';
import * as fs from 'fs';

export async function downloadPdf(url: string, outputPath: string): Promise<void> {
  try {
    // Make a GET request to the URL
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    // Pipe the response data to a file
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
// const pdfUrl = 'http://arxiv.org/pdf/2407.06498v1';
// const outputPath = './download.pdf';

// downloadPdf(pdfUrl, outputPath)
//   .then(() => console.log('PDF downloaded successfully'))
//   .catch((error) => console.error('Failed to download PDF:', error));
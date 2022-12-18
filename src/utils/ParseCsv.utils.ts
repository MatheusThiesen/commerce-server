import { parse } from 'csv-parse';

export class ParseCsv {
  execute(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const parser = parse(file.buffer, {
        delimiter: ['|'],
      });
      const data = [];

      parser.on('data', async (line) => {
        data.push(line);
      });

      parser.on('end', () => {
        resolve(data);
      });
      parser.on('error', (err) => {
        // reject(err);
        console.log(err);
      });
    });
  }
}

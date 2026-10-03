declare module "pdf-parse/lib/pdf-parse.js" {
  function pdfParse(
    dataBuffer: Buffer,
    options?: Record<string, unknown>
  ): Promise<{
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    text: string;
    version: string;
  }>;

  export default pdfParse;
  export = pdfParse;
}

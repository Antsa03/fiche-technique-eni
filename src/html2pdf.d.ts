// html2pdf.js ne fournit pas de types. Déclaration minimale suffisante pour
// l'usage `html2pdf().set(options).from(element).save()`.
declare module "html2pdf.js" {
  interface Html2PdfWorker {
    set(opt: Record<string, unknown>): Html2PdfWorker;
    from(element: HTMLElement | null): Html2PdfWorker;
    save(): Promise<void>;
  }
  function html2pdf(): Html2PdfWorker;
  export default html2pdf;
}

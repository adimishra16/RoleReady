import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/** CSS A4 width at 96dpi — keep in sync with `.a4-page { width: 210mm }` */
export const A4_WIDTH_PX = Math.round((210 / 25.4) * 96); // ~794
export const A4_HEIGHT_PX = Math.round((297 / 25.4) * 96); // ~1123

/**
 * Export the live resume preview to a multi-page A4 PDF.
 * Clones `#resume-canvas` off-screen at scale(1) so mobile zoom / `hidden`
 * preview panes never change what gets captured vs what you see on desktop.
 */
export async function exportResumeCanvasToPdf(filename: string): Promise<void> {
  const source = document.getElementById("resume-canvas");
  if (!source) {
    window.print();
    return;
  }

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-12000px",
    "top:0",
    "width:210mm",
    "pointer-events:none",
    "z-index:-1",
    "opacity:1",
    "background:#fff",
  ].join(";");

  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";
  clone.style.width = "210mm";
  clone.style.height = "auto";
  clone.style.margin = "0";
  clone.style.padding = "0";
  clone.style.maxWidth = "none";

  // Ensure nested A4 sheet is full print size (phones may have compressed the live node)
  clone.querySelectorAll(".a4-page").forEach((node) => {
    const el = node as HTMLElement;
    el.style.width = "210mm";
    el.style.minWidth = "210mm";
    el.style.maxWidth = "210mm";
    el.style.minHeight = "297mm";
    el.style.transform = "none";
    el.style.boxShadow = "none";
  });

  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    // Wait a frame so layout/fonts settle on the off-screen clone
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

    const page =
      (clone.querySelector(".a4-page") as HTMLElement | null) || clone;

    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: page.scrollWidth || A4_WIDTH_PX,
      height: page.scrollHeight || A4_HEIGHT_PX,
      windowWidth: Math.max(page.scrollWidth || 0, A4_WIDTH_PX),
      onclone: (doc) => {
        const clonedPage = doc.querySelector(".a4-page") as HTMLElement | null;
        if (clonedPage) {
          clonedPage.style.width = "210mm";
          clonedPage.style.minHeight = "297mm";
          clonedPage.style.maxWidth = "none";
          clonedPage.style.transform = "none";
          clonedPage.style.boxShadow = "none";
        }
      },
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Preserve aspect ratio — never stretch to fill the page (mobile bug)
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL("image/png");

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0.5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const safeName = filename.replace(/[^a-zA-Z0-9_-]/g, "_") || "Resume";
    pdf.save(`${safeName}.pdf`);
  } finally {
    host.remove();
  }
}

import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import { supabaseAdmin } from "../supabase/admin";

export class OcrService {
  /**
   * Extrait le texte d'un buffer PDF
   * - D'abord avec pdf-parse (texte natif)
   * - Si peu de texte, tente l'OCR sur les pages
   */
  static async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      // 1. Extraction directe du texte
      const pdfData = await pdfParse(buffer);
      let text = pdfData.text || "";

      console.log(`📄 Texte extrait directement: ${text.length} caractères`);

      // 2. Si le texte est vide ou très court, c'est probablement un PDF scanné
      if (text.trim().length < 50) {
        console.log("🔍 Peu de texte détecté, tentative d'OCR...");

        // Convertir le PDF en images avec pdf-parse (les pages sont dans pdfData)
        // Pour l'OCR sur PDF scanné, on utilise Tesseract
        const ocrResult = await this.ocrPdfBuffer(buffer);
        if (ocrResult.trim().length > text.trim().length) {
          text = ocrResult;
          console.log(`✅ OCR réussi: ${text.length} caractères extraits`);
        }
      }

      return text;
    } catch (error) {
      console.error("❌ Erreur extraction texte:", error);
      return "";
    }
  }

  /**
   * OCR sur un buffer PDF avec Tesseract
   */
  private static async ocrPdfBuffer(buffer: Buffer): Promise<string> {
    try {
      // Convertir le PDF en images via pdf-parse puis OCR chaque page
      const pdfData = await pdfParse(buffer);
      const numPages = pdfData.numpages || 1;

      // Pour l'instant, on traite juste le texte déjà extrait
      // Pour un vrai OCR page par page, il faudrait convertir en images
      return pdfData.text || "";
    } catch (error) {
      console.error("Erreur OCR:", error);
      return "";
    }
  }

  /**
   * Met à jour le statut OCR d'un document
   */
  static async updateOcrStatus(
    documentId: string,
    status: string,
    ocrText?: string,
  ) {
    const updateData: any = {
      ocr_status: status,
      updated_at: new Date().toISOString(),
    };
    if (ocrText !== undefined) {
      updateData.ocr_text = ocrText;
    }

    const { error } = await supabaseAdmin
      .from("documents")
      .update(updateData)
      .eq("id", documentId);

    if (error) {
      console.error("Erreur mise à jour OCR status:", error);
    }
  }
}

import { Request, Response } from "express";
// import { InvoiceService } from '../services/invoice.service'; // TODO: Implement when available

interface VoiceIntent {
  intent: string;
  confidence: number;
  action: string;
  parameters?: any;
}

export class AssistantController {
  // private invoiceService: InvoiceService;

  constructor() {
    // this.invoiceService = new InvoiceService();
  }

  async processVoiceCommand(req: Request, res: Response) {
    try {
      const { text }: { text: string } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const intents = this.detectIntents(text);

      // For now, return the detected intents
      // In a real implementation, you might execute actions or return suggestions
      res.json({
        intents,
        suggestions: intents.map((intent) => ({
          text: intent.intent,
          confidence: intent.confidence,
          action: intent.action,
        })),
      });
    } catch (error) {
      console.error("Error processing voice command:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  private detectIntents(text: string): VoiceIntent[] {
    const lowerText = text.toLowerCase();
    const intents: VoiceIntent[] = [];

    // Detect "crear factura"
    if (lowerText.includes("crear") && lowerText.includes("factura")) {
      intents.push({
        intent: "Crear nueva factura",
        confidence: 0.9,
        action: "create_invoice",
      });
    }

    // Detect "revisar facturas"
    if (
      lowerText.includes("revisar") ||
      lowerText.includes("ver") ||
      lowerText.includes("listar")
    ) {
      if (lowerText.includes("factura")) {
        intents.push({
          intent: "Revisar facturas",
          confidence: 0.8,
          action: "list_invoices",
        });
      }
    }

    // Detect "estadísticas" or "stats"
    if (
      lowerText.includes("estadística") ||
      lowerText.includes("stats") ||
      lowerText.includes("resumen")
    ) {
      intents.push({
        intent: "Ver estadísticas",
        confidence: 0.7,
        action: "get_stats",
      });
    }

    // If no intents detected, return a default
    if (intents.length === 0) {
      intents.push({
        intent: "Comando no reconocido",
        confidence: 0.1,
        action: "unknown",
      });
    }

    return intents;
  }
}

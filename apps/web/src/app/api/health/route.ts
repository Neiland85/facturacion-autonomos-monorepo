import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    database: false,
    authService: false,
    invoiceService: false,
    apiGateway: false,
    overall: false,
  };

  const createTimeoutController = (timeoutMs: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    return { controller, timeoutId };
  };

  try {
    // Verificar API Gateway
    try {
      const { controller, timeoutId } = createTimeoutController(5000);
      const gatewayResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/health`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      checks.apiGateway = gatewayResponse.ok;
    } catch (error) {
      console.warn("API Gateway health check failed:", error);
    }

    // Verificar Auth Service
    try {
      const { controller, timeoutId } = createTimeoutController(5000);
      const authResponse = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3003"}/api/health`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      checks.authService = authResponse.ok;
    } catch (error) {
      console.warn("Auth service health check failed:", error);
    }

    // Verificar Invoice Service
    try {
      const { controller, timeoutId } = createTimeoutController(5000);
      const invoiceResponse = await fetch(
        `${process.env.NEXT_PUBLIC_INVOICE_SERVICE_URL || "http://localhost:3002"}/api/health`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      checks.invoiceService = invoiceResponse.ok;
    } catch (error) {
      console.warn("Invoice service health check failed:", error);
    }

    // Verificar base de datos (simulado)
    checks.database = true;

    checks.overall = checks.database && checks.apiGateway;

    const statusCode = checks.overall ? 200 : 503;

    return NextResponse.json(
      {
        success: checks.overall,
        status: checks.overall ? "healthy" : "degraded",
        message: checks.overall
          ? "Web application is healthy"
          : "Web application is degraded - some services are down",
        service: "web-app",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        checks: {
          database: checks.database ? "up" : "down",
          apiGateway: checks.apiGateway ? "up" : "down",
          authService: checks.authService ? "up" : "down",
          invoiceService: checks.invoiceService ? "up" : "down",
        },
      },
      { status: statusCode }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: "Web application health check failed",
        service: "web-app",
        timestamp: new Date().toISOString(),
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal error",
      },
      { status: 503 }
    );
  }
}

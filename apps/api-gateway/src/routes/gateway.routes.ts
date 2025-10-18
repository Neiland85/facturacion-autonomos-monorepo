import { Request, Response, Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { ClientRequest } from "http";
import { Socket } from "net";

const router = Router();

type ProxyConfig = {
  prefix: string;
  targetEnvVar: "AUTH_SERVICE_URL" | "SUBSCRIPTION_SERVICE_URL" | "INVOICE_SERVICE_URL";
  fallbackUrl: string;
  serviceLabel: string;
  errorMessage: string;
  pathRewrite?: Record<string, string>;
};

const createServiceProxy = ({
  prefix,
  targetEnvVar,
  fallbackUrl,
  serviceLabel,
  errorMessage,
  pathRewrite,
}: ProxyConfig) => {
  const target = process.env[targetEnvVar] || fallbackUrl;

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    preserveHeaderKeyCase: true,
    pathRewrite:
      pathRewrite ?? {
        [`^/${prefix}`]: "",
      },
    on: {
      proxyReq: (_proxyReq: ClientRequest, req: Request) => {
        console.log(`[Gateway] Proxying ${req.method} ${req.path} to ${serviceLabel}`);
      },
      error: (err: Error, req: Request, res: Response | Socket) => {
        console.error(`[Gateway] ${serviceLabel} proxy error:`, err);

        if (res instanceof Socket) {
          res.destroy();
          return;
        }

        if (res.headersSent) {
          return;
        }

        res.status(502).json({
          success: false,
          message: errorMessage,
        });
      },
    },
  });
};

router.use(
  "/auth/*",
  createServiceProxy({
    prefix: "auth",
    targetEnvVar: "AUTH_SERVICE_URL",
    fallbackUrl: "http://localhost:3003",
    serviceLabel: "Auth Service",
    errorMessage: "Auth service unavailable",
  })
);

router.use(
  "/subscriptions/*",
  createServiceProxy({
    prefix: "subscriptions",
    targetEnvVar: "SUBSCRIPTION_SERVICE_URL",
    fallbackUrl: "http://localhost:3006",
    serviceLabel: "Subscription Service",
    errorMessage: "Subscription service unavailable",
  })
);

router.use(
  "/invoices/*",
  createServiceProxy({
    prefix: "invoices",
    targetEnvVar: "INVOICE_SERVICE_URL",
    fallbackUrl: "http://localhost:3002",
    serviceLabel: "Invoice Service",
    errorMessage: "Invoice service unavailable",
    pathRewrite: {
      "^/invoices": "/api/invoices",
    },
  })
);

router.use(
  "/clients/*",
  createServiceProxy({
    prefix: "clients",
    targetEnvVar: "INVOICE_SERVICE_URL",
    fallbackUrl: "http://localhost:3002",
    serviceLabel: "Invoice Service (clients)",
    errorMessage: "Invoice service unavailable",
    pathRewrite: {
      "^/clients": "/api/clients",
    },
  })
);

router.use(
  "/companies/*",
  createServiceProxy({
    prefix: "companies",
    targetEnvVar: "INVOICE_SERVICE_URL",
    fallbackUrl: "http://localhost:3002",
    serviceLabel: "Invoice Service (companies)",
    errorMessage: "Invoice service unavailable",
    pathRewrite: {
      "^/companies": "/api/companies",
    },
  })
);

export default router;

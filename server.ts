import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const SECRET_TOKEN = process.env.API_SECRET_TOKEN || 'MY_SECRET_TOKEN';

export interface ClientData {
  id: string;
  name: string;
  company?: string;
  spentUSD: number;
  spentBDT: number;
  remainingBalanceUSD: number;
  remainingBalanceBDT: number;
  usdToBdtRate: number;
  lastCampaignStatus: 'ACTIVE' | 'PAUSED' | 'LEARNING' | 'COMPLETED' | 'LOW_BUDGET' | 'NO_CAMPAIGN';
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignUpdateData {
  id: string;
  clientId: string;
  clientName: string;
  spentUSD: number;
  spentBDT: number;
  impressions: number;
  clicks: number;
  leads: number;
  campaignStatus: 'ACTIVE' | 'PAUSED' | 'LEARNING' | 'COMPLETED' | 'LOW_BUDGET' | 'NO_CAMPAIGN';
  notes?: string;
  timestamp: string;
}

export interface TopUpData {
  id: string;
  clientId: string;
  clientName: string;
  amountUSD: number;
  amountBDT: number;
  notes?: string;
  timestamp: string;
}

export interface ApiLogData {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  authenticated: boolean;
  requestBody?: any;
  responseBody?: any;
  ip?: string;
  durationMs?: number;
}

// In-Memory Store with JSON file backup fallback
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const DEFAULT_RATE = 122.50; // 1 USD = 122.50 BDT

const seedClients: ClientData[] = [
  {
    id: 'client_1',
    name: 'Bengal E-Commerce Ltd',
    company: 'Bengal Retail Group',
    spentUSD: 1450.00,
    spentBDT: 177625.00,
    remainingBalanceUSD: 550.00,
    remainingBalanceBDT: 67375.00,
    usdToBdtRate: 122.50,
    lastCampaignStatus: 'ACTIVE',
    totalImpressions: 485000,
    totalClicks: 21400,
    totalLeads: 860,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'client_2',
    name: 'Shohoz Logistics',
    company: 'Shohoz Tech Bangladesh',
    spentUSD: 2800.00,
    spentBDT: 343000.00,
    remainingBalanceUSD: 120.00,
    remainingBalanceBDT: 14700.00,
    usdToBdtRate: 122.50,
    lastCampaignStatus: 'LOW_BUDGET',
    totalImpressions: 920000,
    totalClicks: 41200,
    totalLeads: 1450,
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'client_3',
    name: 'Apex Footwear Marketing',
    company: 'Apex Bangladesh',
    spentUSD: 4100.00,
    spentBDT: 502250.00,
    remainingBalanceUSD: 1900.00,
    remainingBalanceBDT: 232750.00,
    usdToBdtRate: 122.50,
    lastCampaignStatus: 'LEARNING',
    totalImpressions: 1450000,
    totalClicks: 68900,
    totalLeads: 2310,
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'client_4',
    name: 'Dhaka Culinary House',
    company: 'DCH Foods',
    spentUSD: 620.00,
    spentBDT: 75950.00,
    remainingBalanceUSD: 380.00,
    remainingBalanceBDT: 46550.00,
    usdToBdtRate: 122.50,
    lastCampaignStatus: 'PAUSED',
    totalImpressions: 180000,
    totalClicks: 8400,
    totalLeads: 290,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let clients: ClientData[] = [];
let campaignUpdates: CampaignUpdateData[] = [];
let topUps: TopUpData[] = [];
let apiLogs: ApiLogData[] = [];

// Load data function
function loadStoredData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      clients = parsed.clients || seedClients;
      campaignUpdates = parsed.campaignUpdates || [];
      topUps = parsed.topUps || [];
      apiLogs = parsed.apiLogs || [];
      console.log('Loaded agency data from store.json');
    } else {
      clients = seedClients;
      saveData();
    }
  } catch (err) {
    console.error('Error loading store.json, using seed data:', err);
    clients = seedClients;
  }
}

// Save data function
function saveData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ clients, campaignUpdates, topUps, apiLogs: apiLogs.slice(0, 100) }, null, 2)
    );
  } catch (err) {
    console.error('Error saving store.json:', err);
  }
}

loadStoredData();

export const app = express();

// Open CORS
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());

async function startServer() {

  // Logging & Auth Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Exclude static assets from API logs
    if (!req.path.startsWith('/api')) {
      return next();
    }

    const startTime = Date.now();
    const authHeader = req.headers.authorization;
    let authenticated = false;

    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token === SECRET_TOKEN) {
        authenticated = true;
      }
    }

    (req as any).authenticated = authenticated;

    // Capture response for logs
    const originalSend = res.send;
    let responseBody: any = null;

    res.send = function (body) {
      try {
        if (typeof body === 'string') {
          responseBody = JSON.parse(body);
        } else {
          responseBody = body;
        }
      } catch {
        responseBody = { summary: 'Non-JSON response' };
      }

      const durationMs = Date.now() - startTime;

      // Do not log the GET /api/logs call itself to avoid infinite scroll loop
      if (req.path !== '/api/logs') {
        const logEntry: ApiLogData = {
          id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          timestamp: new Date().toISOString(),
          method: req.method,
          endpoint: req.originalUrl || req.path,
          status: res.statusCode,
          authenticated,
          requestBody: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
          responseBody: responseBody,
          ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
          durationMs,
        };

        apiLogs.unshift(logEntry);
        if (apiLogs.length > 200) {
          apiLogs = apiLogs.slice(0, 200);
        }
        saveData();
      }

      return originalSend.apply(res, arguments as any);
    };

    next();
  });

  // Auth Guard Helper
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).authenticated) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: `Missing or invalid Bearer API Token. Pass header 'Authorization: Bearer ${SECRET_TOKEN}'`,
      });
    }
    next();
  };

  // --- API ENDPOINTS ---

  // GET /api/health
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      activeToken: SECRET_TOKEN,
      clientCount: clients.length,
    });
  });

  // GET /api/clients - Fetch current client list and metrics
  app.get('/api/clients', (req: Request, res: Response) => {
    const totalSpentUSD = clients.reduce((acc, c) => acc + c.spentUSD, 0);
    const totalSpentBDT = clients.reduce((acc, c) => acc + c.spentBDT, 0);
    const totalRemainingUSD = clients.reduce((acc, c) => acc + c.remainingBalanceUSD, 0);
    const totalRemainingBDT = clients.reduce((acc, c) => acc + c.remainingBalanceBDT, 0);
    const activeCampaignCount = clients.filter((c) => c.lastCampaignStatus === 'ACTIVE' || c.lastCampaignStatus === 'LEARNING').length;

    res.json({
      success: true,
      summary: {
        totalClients: clients.length,
        totalSpentUSD: Math.round(totalSpentUSD * 100) / 100,
        totalSpentBDT: Math.round(totalSpentBDT * 100) / 100,
        totalRemainingBalanceUSD: Math.round(totalRemainingUSD * 100) / 100,
        totalRemainingBalanceBDT: Math.round(totalRemainingBDT * 100) / 100,
        activeCampaigns: activeCampaignCount,
      },
      clients,
    });
  });

  // POST /api/clients - Add a new client
  app.post('/api/clients', requireAuth, (req: Request, res: Response) => {
    const { name, company, initialBalanceUSD, usdToBdtRate } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Client name is required.',
      });
    }

    const rate = Number(usdToBdtRate) > 0 ? Number(usdToBdtRate) : DEFAULT_RATE;
    const initialUSD = Number(initialBalanceUSD) >= 0 ? Number(initialBalanceUSD) : 500.00;
    const initialBDT = Math.round(initialUSD * rate * 100) / 100;

    const newClient: ClientData = {
      id: 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      company: company ? String(company).trim() : undefined,
      spentUSD: 0,
      spentBDT: 0,
      remainingBalanceUSD: initialUSD,
      remainingBalanceBDT: initialBDT,
      usdToBdtRate: rate,
      lastCampaignStatus: 'NO_CAMPAIGN',
      totalImpressions: 0,
      totalClicks: 0,
      totalLeads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clients.unshift(newClient);
    saveData();

    res.status(201).json({
      success: true,
      message: `Client '${newClient.name}' added successfully.`,
      client: newClient,
    });
  });

  // POST /api/updates - Log daily campaign results
  app.post('/api/updates', requireAuth, (req: Request, res: Response) => {
    const { clientId, clientName, spentUSD, impressions, clicks, leads, campaignStatus, notes } = req.body;

    let client = clients.find((c) => c.id === clientId);
    if (!client && clientName) {
      client = clients.find((c) => c.name.toLowerCase() === String(clientName).toLowerCase().trim());
    }

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Client not found for ID '${clientId}' or Name '${clientName}'. Provide a valid client ID or name.`,
      });
    }

    const spent = Number(spentUSD);
    if (isNaN(spent) || spent < 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'spentUSD must be a non-negative number.',
      });
    }

    const addImpressions = Number(impressions) || 0;
    const addClicks = Number(clicks) || 0;
    const addLeads = Number(leads) || 0;
    const rate = client.usdToBdtRate || DEFAULT_RATE;
    const spentBDT = Math.round(spent * rate * 100) / 100;

    let validStatus = client.lastCampaignStatus;
    if (campaignStatus && ['ACTIVE', 'PAUSED', 'LEARNING', 'COMPLETED', 'LOW_BUDGET', 'NO_CAMPAIGN'].includes(String(campaignStatus).toUpperCase())) {
      validStatus = String(campaignStatus).toUpperCase() as any;
    }

    // Deduct balance & add spent
    client.spentUSD = Math.round((client.spentUSD + spent) * 100) / 100;
    client.spentBDT = Math.round((client.spentBDT + spentBDT) * 100) / 100;
    client.remainingBalanceUSD = Math.round((client.remainingBalanceUSD - spent) * 100) / 100;
    client.remainingBalanceBDT = Math.round((client.remainingBalanceBDT - spentBDT) * 100) / 100;
    
    // Auto flag low budget if remaining < $50
    if (client.remainingBalanceUSD < 50 && validStatus === 'ACTIVE') {
      validStatus = 'LOW_BUDGET';
    }

    client.lastCampaignStatus = validStatus;
    client.totalImpressions += addImpressions;
    client.totalClicks += addClicks;
    client.totalLeads += addLeads;
    client.updatedAt = new Date().toISOString();

    const updateRecord: CampaignUpdateData = {
      id: 'upd_' + Date.now(),
      clientId: client.id,
      clientName: client.name,
      spentUSD: spent,
      spentBDT,
      impressions: addImpressions,
      clicks: addClicks,
      leads: addLeads,
      campaignStatus: validStatus,
      notes: notes ? String(notes) : undefined,
      timestamp: new Date().toISOString(),
    };

    campaignUpdates.unshift(updateRecord);
    saveData();

    res.json({
      success: true,
      message: `Campaign update logged for ${client.name}. Spent USD: $${spent}, Spent BDT: ৳${spentBDT}.`,
      client: {
        id: client.id,
        name: client.name,
        spentUSD: client.spentUSD,
        spentBDT: client.spentBDT,
        remainingBalanceUSD: client.remainingBalanceUSD,
        remainingBalanceBDT: client.remainingBalanceBDT,
        lastCampaignStatus: client.lastCampaignStatus,
      },
      updateRecord,
    });
  });

  // POST /api/topups - Add client balance top-up
  app.post('/api/topups', requireAuth, (req: Request, res: Response) => {
    const { clientId, clientName, amountUSD, notes } = req.body;

    let client = clients.find((c) => c.id === clientId);
    if (!client && clientName) {
      client = clients.find((c) => c.name.toLowerCase() === String(clientName).toLowerCase().trim());
    }

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Client not found for ID '${clientId}' or Name '${clientName}'.`,
      });
    }

    const amount = Number(amountUSD);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'amountUSD must be a positive number.',
      });
    }

    const rate = client.usdToBdtRate || DEFAULT_RATE;
    const amountBDT = Math.round(amount * rate * 100) / 100;

    client.remainingBalanceUSD = Math.round((client.remainingBalanceUSD + amount) * 100) / 100;
    client.remainingBalanceBDT = Math.round((client.remainingBalanceBDT + amountBDT) * 100) / 100;

    if (client.lastCampaignStatus === 'LOW_BUDGET' && client.remainingBalanceUSD >= 50) {
      client.lastCampaignStatus = 'ACTIVE';
    }

    client.updatedAt = new Date().toISOString();

    const topupRecord: TopUpData = {
      id: 'top_' + Date.now(),
      clientId: client.id,
      clientName: client.name,
      amountUSD: amount,
      amountBDT,
      notes: notes ? String(notes) : undefined,
      timestamp: new Date().toISOString(),
    };

    topUps.unshift(topupRecord);
    saveData();

    res.json({
      success: true,
      message: `Top-up of $${amount} (৳${amountBDT}) applied to ${client.name}.`,
      client: {
        id: client.id,
        name: client.name,
        remainingBalanceUSD: client.remainingBalanceUSD,
        remainingBalanceBDT: client.remainingBalanceBDT,
        lastCampaignStatus: client.lastCampaignStatus,
      },
      topupRecord,
    });
  });

  // GET /api/logs - Live API Logs
  app.get('/api/logs', (req: Request, res: Response) => {
    res.json({
      success: true,
      totalLogs: apiLogs.length,
      logs: apiLogs,
    });
  });

  // DELETE /api/logs - Clear logs
  app.delete('/api/logs', (req: Request, res: Response) => {
    apiLogs = [];
    saveData();
    res.json({ success: true, message: 'API logs cleared.' });
  });

  // POST /api/reset - Reset to seed data
  app.post('/api/reset', requireAuth, (req: Request, res: Response) => {
    clients = JSON.parse(JSON.stringify(seedClients));
    campaignUpdates = [];
    topUps = [];
    saveData();
    res.json({ success: true, message: 'Agency data reset to initial benchmark state.' });
  });

  // GET /api/openapi.json - OpenAPI 3.0 specification JSON file for ChatGPT Custom GPT Actions
  app.get('/api/openapi.json', (req: Request, res: Response) => {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const serverUrl = process.env.APP_URL || `${protocol}://${host}`;

    const openApiSpec = {
      openapi: '3.1.0',
      info: {
        title: 'Agency AI Management API',
        description: 'REST API for agency client tracking, ad campaign spending logging (USD & BDT), and balance top-ups for ChatGPT Custom GPT Actions and Gemini Agents.',
        version: '1.0.0',
      },
      servers: [
        {
          url: serverUrl,
          description: 'Agency Dashboard Server',
        },
      ],
      paths: {
        '/api/clients': {
          get: {
            summary: 'Get all agency clients',
            description: 'Retrieves current list of agency clients with spent amounts in USD and BDT, remaining balances, and active campaign statuses.',
            operationId: 'getClients',
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Successful retrieval',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        summary: {
                          type: 'object',
                          properties: {
                            totalClients: { type: 'integer' },
                            totalSpentUSD: { type: 'number' },
                            totalSpentBDT: { type: 'number' },
                            totalRemainingBalanceUSD: { type: 'number' },
                            totalRemainingBalanceBDT: { type: 'number' },
                            activeCampaigns: { type: 'integer' },
                          },
                        },
                        clients: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Client' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            summary: 'Add a new client',
            description: 'Creates a new client record with initial balance in USD and USD/BDT exchange rate.',
            operationId: 'addClient',
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: { type: 'string', example: 'Bengal Retail Ltd' },
                      company: { type: 'string', example: 'Bengal Group' },
                      initialBalanceUSD: { type: 'number', example: 500 },
                      usdToBdtRate: { type: 'number', example: 122.5 },
                    },
                  },
                },
              },
            },
            responses: {
              '201': { description: 'Client created successfully' },
              '401': { description: 'Unauthorized - invalid Bearer token' },
            },
          },
        },
        '/api/updates': {
          post: {
            summary: 'Log daily campaign results',
            description: 'Logs daily ad campaign spending in USD (automatically converted to BDT), impressions, clicks, leads, and updates campaign status.',
            operationId: 'logCampaignUpdate',
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['spentUSD'],
                    properties: {
                      clientId: { type: 'string', example: 'client_1' },
                      clientName: { type: 'string', example: 'Bengal E-Commerce Ltd' },
                      spentUSD: { type: 'number', example: 75.50 },
                      impressions: { type: 'integer', example: 25000 },
                      clicks: { type: 'integer', example: 1200 },
                      leads: { type: 'integer', example: 45 },
                      campaignStatus: {
                        type: 'string',
                        enum: ['ACTIVE', 'PAUSED', 'LEARNING', 'COMPLETED', 'LOW_BUDGET', 'NO_CAMPAIGN'],
                        example: 'ACTIVE',
                      },
                      notes: { type: 'string', example: 'Meta Ads Retargeting Campaign' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': { description: 'Update logged successfully' },
              '404': { description: 'Client not found' },
            },
          },
        },
        '/api/topups': {
          post: {
            summary: 'Top-up client balance',
            description: 'Adds USD balance to a client account, updating remaining USD and BDT balances.',
            operationId: 'topupBalance',
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['amountUSD'],
                    properties: {
                      clientId: { type: 'string', example: 'client_1' },
                      clientName: { type: 'string', example: 'Bengal E-Commerce Ltd' },
                      amountUSD: { type: 'number', example: 500 },
                      notes: { type: 'string', example: 'Bank Wire Deposit #4819' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': { description: 'Top-up applied successfully' },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'API_TOKEN',
            description: `Pass secret token '${SECRET_TOKEN}' in Authorization header as 'Bearer ${SECRET_TOKEN}'`,
          },
        },
        schemas: {
          Client: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              company: { type: 'string' },
              spentUSD: { type: 'number' },
              spentBDT: { type: 'number' },
              remainingBalanceUSD: { type: 'number' },
              remainingBalanceBDT: { type: 'number' },
              usdToBdtRate: { type: 'number' },
              lastCampaignStatus: { type: 'string' },
              totalImpressions: { type: 'integer' },
              totalClicks: { type: 'integer' },
              totalLeads: { type: 'integer' },
            },
          },
        },
      },
    };

    res.json(openApiSpec);
  });

  // Vite Middleware for dev mode / static serve for prod mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Agency AI Dashboard server running on http://0.0.0.0:${PORT}`);
    console.log(`Active Bearer API Secret Token: ${SECRET_TOKEN}`);
  });
}

startServer();

export default app;

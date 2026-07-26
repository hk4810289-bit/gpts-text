import app from '../server';

export default function handler(req: any, res: any) {
  try {
    // Standardize URL when Vercel serverless functions rewrite requests
    if (req.headers) {
      const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-original-url'];
      if (forwardedUri) {
        req.url = forwardedUri;
      } else if (req.url === '/api' || req.url === '/api/' || req.url === '/api/index') {
        const matchedPath = req.headers['x-matched-path'];
        if (matchedPath && matchedPath !== '/api') {
          req.url = matchedPath;
        }
      }
    }
  } catch (err) {
    console.error('Error normalizing Vercel req.url:', err);
  }

  return app(req, res);
}


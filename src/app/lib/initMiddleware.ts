// lib/init-middleware.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function initMiddleware(middleware: Function) {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise<void>((resolve, reject) => {
      middleware(req, res, (result: unknown) => {
        if (result instanceof Error) return reject(result);
        return resolve();
      });
    });
}

import cors from 'cors';

const corsOptions = {
  // Mirrors the request origin — safe for local dev
  // TODO: Lock this down in production to specific origins
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

export default cors(corsOptions);
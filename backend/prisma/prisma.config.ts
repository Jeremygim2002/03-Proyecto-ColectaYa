export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db',
      directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db',
    },
  },
};

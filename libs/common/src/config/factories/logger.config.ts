export const useFactoryLogger = async () => ({
  appenders: {
    console: { type: 'stdout' },
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
  },
});

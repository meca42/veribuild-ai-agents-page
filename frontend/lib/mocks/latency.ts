let config = {
  minDelay: 250,
  maxDelay: 600,
  errorRate: 0.02,
};

export const getMockConfig = () => ({ ...config });

export const setMockConfig = (updates: Partial<typeof config>) => {
  config = { ...config, ...updates };
};

export const simulateLatency = async <T>(
  fn: () => T,
  options?: { skipError?: boolean }
): Promise<T> => {
  const delay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (!options?.skipError && Math.random() < config.errorRate) {
    throw new Error('Simulated network error');
  }

  return fn();
};

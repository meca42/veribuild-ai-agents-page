export const schemas = {
  search_drawings: {
    validate: (args: any) => {
      const query = (args?.query ?? '').trim();
      if (!query || query.length === 0) {
        return { valid: false, error: 'query must be a non-empty string' };
      }
      if (query.length > 120) {
        return { valid: false, error: 'query must be at most 120 characters' };
      }
      return { valid: true, data: { query } };
    }
  },
  query_inventory: {
    validate: (args: any) => {
      const item = (args?.item ?? '').trim();
      if (!item || item.length === 0) {
        return { valid: false, error: 'item must be a non-empty string' };
      }
      if (item.length > 120) {
        return { valid: false, error: 'item must be at most 120 characters' };
      }
      return { valid: true, data: { item } };
    }
  },
  create_rfi: {
    validate: (args: any) => {
      const subject = (args?.subject ?? '').trim();
      const question = (args?.question ?? '').trim();
      
      if (!subject || subject.length < 3) {
        return { valid: false, error: 'subject must be at least 3 characters' };
      }
      if (subject.length > 140) {
        return { valid: false, error: 'subject must be at most 140 characters' };
      }
      
      if (!question || question.length < 5) {
        return { valid: false, error: 'question must be at least 5 characters' };
      }
      if (question.length > 4000) {
        return { valid: false, error: 'question must be at most 4000 characters' };
      }

      const drawingId = args?.drawing_id ?? null;
      if (drawingId !== null && drawingId !== undefined) {
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (typeof drawingId !== 'string' || !uuidPattern.test(drawingId)) {
          return { valid: false, error: 'drawing_id must be a valid UUID if provided' };
        }
      }

      return { 
        valid: true, 
        data: { 
          subject, 
          question, 
          drawing_id: drawingId 
        } 
      };
    }
  }
};

export async function retry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      if (i < attempts) {
        await new Promise(r => setTimeout(r, 400 * (i + 1)));
      }
    }
  }
  throw lastError;
}

import { USE_MOCK_API } from '@/lib/env';
import * as mock from './mockClient';
import * as rest from './restClient';

export const api = USE_MOCK_API ? mock : rest;

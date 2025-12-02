import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export interface ChartDataPoint {
  name: string;
  price: number;
}

export const fetchSimulatedSwap = async (from: string, to: string, amount: number) => {
  const { data } = await api.post('/swap/simulate', { fromToken: from, toToken: to, amount });
  return data;
};

export const fetchChartData = async (symbol: string, range: string): Promise<ChartDataPoint[]> => {
  const { data } = await api.get('/chart', { params: { symbol, range } });
  return data;
};

export const fetchTokens = async () => {
    const { data } = await api.get('/tokens');
    return data;
};

export default api;
import { getProviderInfo } from '@/lib/ai-model-provider';

export async function GET() {
  const info = getProviderInfo();
  return Response.json(info);
}

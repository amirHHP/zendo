/**
 * Gemini AI Helper with central + custom key support and rate limiting
 */
import { prisma } from './prisma';

export function parseGeminiJSON(text: string): any {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  cleanText = cleanText.trim();
  return JSON.parse(cleanText);
}

export async function resolveGeminiKey(userId: string): Promise<{
  apiKey: string;
  model: string;
  isCustomKey: boolean;
}> {
  const settings = await prisma.settings.findUnique({
    where: { userId },
  });

  const customKey = settings?.apiKey?.trim();
  const centralKey = process.env.GEMINI_API_KEY?.trim();
  const model = settings?.apiModel || 'gemini-2.5-flash';

  if (customKey) {
    return { apiKey: customKey, model, isCustomKey: true };
  }

  if (centralKey) {
    // Check free tier limits for central key
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isPro) {
      const today = new Date().toISOString().split('T')[0];
      let dailyCount = settings?.dailyAiCount || 0;

      if (settings?.lastAiDate !== today) {
        dailyCount = 0;
      }

      const DAILY_LIMIT = 15;
      if (dailyCount >= DAILY_LIMIT) {
        throw new Error(
          `سقف استفاده رایگان از هوش مصنوعی سرور (${DAILY_LIMIT} بار در روز) به پایان رسید. می‌توانید به اکانت پرو ارتقا دهید یا کلید اختصاصی Gemini خود را در تنظیمات وارد کنید.`
        );
      }

      // Increment daily count
      await prisma.settings.upsert({
        where: { userId },
        create: {
          userId,
          dailyAiCount: 1,
          lastAiDate: today,
        },
        update: {
          dailyAiCount: dailyCount + 1,
          lastAiDate: today,
        },
      });
    }

    return { apiKey: centralKey, model, isCustomKey: false };
  }

  throw new Error('کلید API جمینای تنظیم نشده است. لطفاً در بخش تنظیمات کلید اختصاصی خود را وارد نمایید.');
}

export async function callGeminiApi(apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`خطا در ارتباط با هوش مصنوعی (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error('پاسخی از هوش مصنوعی دریافت نشد.');
  }

  return textResponse;
}

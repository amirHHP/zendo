import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { zarinpal } from '@/lib/zarinpal';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const plan = body.plan === 'PRO_YEARLY' ? 'PRO_YEARLY' : 'PRO_MONTHLY';

    const amount = plan === 'PRO_YEARLY'
      ? parseInt(process.env.PRO_YEARLY_PRICE || '390000', 10)
      : parseInt(process.env.PRO_MONTHLY_PRICE || '49000', 10);

    const description = plan === 'PRO_YEARLY'
      ? 'خرید اشتراک سالانه پرو Zendo GTD'
      : 'خرید اشتراک ماهانه پرو Zendo GTD';

    // Construct callback URL
    const host = req.headers.get('host') || 'theminiceo.ir';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const callbackUrl = `${proto}://${host}${basePath}/api/payment/verify`;

    const result = await zarinpal.requestPayment({
      amount,
      description,
      callbackUrl,
      email: user.email,
    });

    if (!result.success || !result.authority || !result.url) {
      return NextResponse.json({ error: result.error || 'خطا در ارتباط با درگاه پرداخت' }, { status: 500 });
    }

    // Save pending payment record in DB
    await prisma.payment.create({
      data: {
        userId: user.id,
        authority: result.authority,
        amount,
        plan,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, url: result.url });
  } catch (err: any) {
    console.error('Payment request error:', err);
    return NextResponse.json({ error: err.message || 'خطا در صدور فاکتور پرداخت' }, { status: 500 });
  }
}

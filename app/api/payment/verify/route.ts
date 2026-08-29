import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { zarinpal } from '@/lib/zarinpal';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const authority = url.searchParams.get('Authority');
  const status = url.searchParams.get('Status');
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  if (!authority) {
    return NextResponse.redirect(new URL(`${basePath}/dashboard?payment=invalid`, req.url));
  }

  // Find payment record
  const payment = await prisma.payment.findUnique({
    where: { authority },
    include: { user: true },
  });

  if (!payment) {
    return NextResponse.redirect(new URL(`${basePath}/dashboard?payment=not_found`, req.url));
  }

  if (status !== 'OK') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
    return NextResponse.redirect(new URL(`${basePath}/dashboard?payment=cancelled`, req.url));
  }

  // Verify with ZarinPal
  const verifyResult = await zarinpal.verifyPayment({
    amount: payment.amount,
    authority: payment.authority,
  });

  if (!verifyResult.success) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
    return NextResponse.redirect(new URL(`${basePath}/dashboard?payment=failed`, req.url));
  }

  // Success! Upgrade user to Pro
  const daysToAdd = payment.plan === 'PRO_YEARLY' ? 365 : 30;
  const proUntil = new Date();
  proUntil.setDate(proUntil.getDate() + daysToAdd);

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        refId: verifyResult.refId,
      },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data: {
        isPro: true,
        proSince: new Date(),
        proUntil,
      },
    }),
  ]);

  return NextResponse.redirect(new URL(`${basePath}/dashboard?payment=success`, req.url));
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'ایمیل و رمز عبور الزامی است.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'این ایمیل قبلاً ثبت‌نام کرده است.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name ? name.trim() : normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: hashedPassword,
        settings: {
          create: {
            apiModel: 'gemini-2.5-flash',
            theme: 'light',
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        isPro: true,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'خطای سرور در ثبت نام. لطفاً دوباره تلاش کنید.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { resolveGeminiKey, callGeminiApi, parseGeminiJSON } from '@/lib/gemini';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { apiKey, model } = await resolveGeminiKey(user.id);

    const allProjects = await prisma.project.findMany({
      where: { userId: user.id },
    });

    // Loose projects: parentId is null AND no children
    const looseProjects = allProjects.filter(
      p => !p.parentId && !allProjects.some(child => child.parentId === p.id)
    );

    if (looseProjects.length <= 15) {
      return NextResponse.json(
        { error: 'برای استفاده از این قابلیت حداقل باید بیش از ۱۵ پروژه بدون دسته‌بندی داشته باشید.' },
        { status: 400 }
      );
    }

    const existingFolders = allProjects.filter(
      p => !p.parentId && allProjects.some(child => child.parentId === p.id)
    );

    const prompt = `You are an expert personal productivity coach and GTD (Getting Things Done) organizer.
The user has a list of "loose" projects that are currently not organized into any folder (goal/objective).

Your task is to organize these loose projects into high-level folders representing goals or objectives (e.g., "زندگی بهتر" (Better Living), "کسب درآمد" (Earning Income), "سلامتی" (Health), "آموزش" (Education/Learning), etc.).

Here are the loose projects to organize:
${JSON.stringify(looseProjects.map(p => ({ id: p.id, name: p.name })))}

Here are the existing folders (goals/objectives) that already exist:
${JSON.stringify(existingFolders.map(f => ({ id: f.id, name: f.name })))}

For each loose project, decide:
1. Which high-level folder (goal/objective) it belongs to.
2. If it fits one of the existing folders, assign it to that existing folder's ID.
3. If it does not fit any existing folder, define a new folder name (goal/objective). Use the same language and tone as the projects (typically Persian or English). Keep folder names general and concise (e.g. "زندگی بهتر", "کسب درآمد", "سلامتی", "آموزش", "Personal Development", "Work/Career").

You must return a JSON response matching the following schema:
{
  "assignments": [
    {
      "projectId": "loose-project-uuid",
      "folderId": "existing-folder-uuid" (or "new" if a new folder should be created),
      "newFolderName": "Name of the new folder/objective (only if folderId is 'new')"
    }
  ]
}

Do not include any Markdown syntax, code block formatting (like \`\`\`json), or extra text. Return ONLY the JSON object.`;

    const responseText = await callGeminiApi(apiKey, model, prompt);
    const parsed = parseGeminiJSON(responseText);

    if (parsed && Array.isArray(parsed.assignments)) {
      const batchFolders: Record<string, string> = {};

      for (const item of parsed.assignments) {
        let targetFolderId = item.folderId;

        if (item.folderId === 'new' && item.newFolderName) {
          const norm = item.newFolderName.trim();
          const key = norm.toLowerCase();

          const existingF = allProjects.find(
            p => !p.parentId && p.name.toLowerCase() === key
          );

          if (existingF) {
            targetFolderId = existingF.id;
          } else if (batchFolders[key]) {
            targetFolderId = batchFolders[key];
          } else {
            const newF = await prisma.project.create({
              data: {
                userId: user.id,
                name: norm,
                parentId: null,
                expanded: true,
              },
            });
            batchFolders[key] = newF.id;
            targetFolderId = newF.id;
          }
        }

        if (targetFolderId && targetFolderId !== 'new') {
          await prisma.project.update({
            where: { id: item.projectId },
            data: { parentId: targetFolderId },
          });
        }
      }
    }

    const updatedProjects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ projects: updatedProjects });
  } catch (err: any) {
    console.error('Organize projects error:', err);
    return NextResponse.json({ error: err.message || 'خطا در سازماندهی پروژه‌ها' }, { status: 500 });
  }
}

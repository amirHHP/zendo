import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { resolveGeminiKey, callGeminiApi, parseGeminiJSON } from '@/lib/gemini';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { apiKey, model } = await resolveGeminiKey(user.id);
    const body = await req.json();
    const { taskId, inbox } = body;

    // 1. Single Task Elaboration
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: { id: taskId, userId: user.id },
        include: { subtasks: true },
      });

      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      const prompt = `You are an expert GTD (Getting Things Done) coach and personal assistant.
The user has created a task: "${task.text}".
Your goal is to elaborate this task, make it highly actionable, add detailed notes/context, and break it down into clear, small, sequential subtasks (to remove friction and procrastination).

You must output your response in JSON format matching this schema:
{
  "elaboratedText": "An actionable, clear rewrite of the task title (keep it under 80 characters, in the same language as the user's input).",
  "notes": "Detailed context, tips, and next steps for the task (in the same language as the user's input).",
  "subtasks": ["subtask 1", "subtask 2", ...] (an array of actionable subtasks in the same language as the user's input).
}

Do not include any Markdown syntax, code block formatting (like \`\`\`json), or extra text. Return ONLY the JSON object.`;

      const responseText = await callGeminiApi(apiKey, model, prompt);
      const parsed = parseGeminiJSON(responseText);

      const newNotes = (task.notes ? task.notes + '\n\n' : '') + (parsed.notes || '');

      const updated = await prisma.task.update({
        where: { id: task.id },
        data: {
          text: parsed.elaboratedText || task.text,
          notes: newNotes,
          subtasks: {
            create: Array.isArray(parsed.subtasks)
              ? parsed.subtasks.map((stText: string, idx: number) => ({
                  text: stText,
                  completed: false,
                  order: task.subtasks.length + idx,
                }))
              : [],
          },
        },
        include: {
          subtasks: { orderBy: { order: 'asc' } },
        },
      });

      return NextResponse.json({ task: updated });
    }

    // 2. Batch Inbox Elaboration
    if (inbox) {
      const inboxTasks = await prisma.task.findMany({
        where: { userId: user.id, projectId: null, completed: false },
        include: { subtasks: true },
      });

      if (inboxTasks.length === 0) {
        return NextResponse.json({ tasks: [] });
      }

      const prompt = `You are an expert GTD (Getting Things Done) coach and personal assistant.
The user has a list of tasks in their Inbox:
${JSON.stringify(inboxTasks.map(t => ({ id: t.id, text: t.text })))}

Your goal is to elaborate each of these tasks, make them highly actionable, add detailed notes/context, and break them down into clear, small, sequential subtasks (to remove friction and procrastination).
Each elaborated task title should be concise (under 80 characters) and in the same language as the task (e.g. Persian/English).

You must output your response in JSON format matching this schema:
{
  "tasks": [
    {
      "id": "original-task-uuid",
      "elaboratedText": "Actionable, clear rewrite of the task title",
      "notes": "Detailed context, tips, and next steps for the task",
      "subtasks": ["subtask 1", "subtask 2", ...]
    }
  ]
}

Do not include any Markdown syntax, code block formatting (like \`\`\`json), or extra text. Return ONLY the JSON object.`;

      const responseText = await callGeminiApi(apiKey, model, prompt);
      const parsed = parseGeminiJSON(responseText);

      if (parsed && Array.isArray(parsed.tasks)) {
        for (const item of parsed.tasks) {
          const original = inboxTasks.find(t => t.id === item.id);
          if (original) {
            const newNotes = (original.notes ? original.notes + '\n\n' : '') + (item.notes || '');
            await prisma.task.update({
              where: { id: original.id },
              data: {
                text: item.elaboratedText || original.text,
                notes: newNotes,
                subtasks: {
                  create: Array.isArray(item.subtasks)
                    ? item.subtasks.map((stText: string, idx: number) => ({
                        text: stText,
                        completed: false,
                        order: original.subtasks.length + idx,
                      }))
                    : [],
                },
              },
            });
          }
        }
      }

      const allUpdated = await prisma.task.findMany({
        where: { userId: user.id },
        include: { subtasks: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ tasks: allUpdated });
    }

    return NextResponse.json({ error: 'Specify taskId or inbox: true' }, { status: 400 });
  } catch (err: any) {
    console.error('Elaboration API error:', err);
    return NextResponse.json({ error: err.message || 'خطا در هوش مصنوعی' }, { status: 500 });
  }
}

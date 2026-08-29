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

    const existingProjects = await prisma.project.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, parentId: true },
    });

    // 1. Single Task Organization
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: { id: taskId, userId: user.id },
      });

      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      const prompt = `You are a GTD (Getting Things Done) organization engine.
The user has a task: "${task.text}".
Here is the list of existing projects:
${JSON.stringify(existingProjects)}

Your goal is to decide:
1. Does this task fit under one of the existing projects? If so, select the most appropriate existing project ID.
2. If it does not fit any existing project, should we create a new project? If so, specify the new project name. Also, should it be a sub-project (nested under an existing project as a child)? If so, specify the parent project ID.

You must output your response in JSON format matching this schema:
{
  "projectId": "existing-project-uuid" (or "new" if we should create a new project, or null if it should remain in the Inbox),
  "newProjectName": "Name of the new project to create (only if projectId is 'new', in the same language as the task)",
  "newProjectParentId": "existing-project-uuid" (if the new project should be nested under an existing project, otherwise null)
}

Do not include any Markdown syntax or extra text. Return ONLY the JSON object.`;

      const responseText = await callGeminiApi(apiKey, model, prompt);
      const parsed = parseGeminiJSON(responseText);

      let targetProjectId: string | null = null;

      if (parsed.projectId === 'new' && parsed.newProjectName) {
        const newProj = await prisma.project.create({
          data: {
            userId: user.id,
            name: parsed.newProjectName,
            parentId: parsed.newProjectParentId || null,
            expanded: true,
          },
        });
        targetProjectId = newProj.id;
      } else if (parsed.projectId && parsed.projectId !== 'new') {
        const exists = existingProjects.some(p => p.id === parsed.projectId);
        targetProjectId = exists ? parsed.projectId : null;
      }

      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: { projectId: targetProjectId },
        include: { subtasks: { orderBy: { order: 'asc' } } },
      });

      const allProjects = await prisma.project.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({ task: updatedTask, projects: allProjects });
    }

    // 2. Batch Inbox Organization & Elaboration
    if (inbox) {
      const inboxTasks = await prisma.task.findMany({
        where: { userId: user.id, projectId: null, completed: false },
        include: { subtasks: true },
      });

      if (inboxTasks.length === 0) {
        return NextResponse.json({ tasks: [], projects: existingProjects });
      }

      const prompt = `You are an expert GTD (Getting Things Done) organization engine and coach.
The user has a list of tasks in their Inbox:
${JSON.stringify(inboxTasks.map(t => ({ id: t.id, text: t.text })))}

Here is the list of existing projects:
${JSON.stringify(existingProjects)}

Your goal is to perform TWO steps for EACH task in the Inbox:
1. Clarify/Elaborate: Rewrite the task title/text to make it highly actionable and clear, add detailed notes/context, and break it down into clear, small, sequential subtasks. Keep each rewritten task title concise (under 80 characters) and in the same language as the task.
2. Organize: Decide where the task belongs.
   - If it fits under one of the existing projects, select the most appropriate existing project's ID.
   - If it does not fit any existing project, decide if a new project should be created. If so, specify the new project's name. (You can also decide if this new project should be nested as a sub-project under an existing project, in which case specify the parent project ID).
   - If it does not belong in any project, set projectId to null.

You must output your response in JSON format matching this schema:
{
  "tasks": [
    {
      "id": "original-task-uuid",
      "elaboratedText": "Actionable, clear rewrite of the task title",
      "notes": "Detailed context, tips, and next steps for the task",
      "subtasks": ["subtask 1", "subtask 2", ...],
      "projectId": "existing-project-uuid" (or "new" or null),
      "newProjectName": "Name of new project" (only if projectId is 'new'),
      "newProjectParentId": "existing-project-uuid" (if nested under an existing project, otherwise null)
    }
  ]
}

Do not include any Markdown syntax, code block formatting (like \`\`\`json), or extra text. Return ONLY the JSON object.`;

      const responseText = await callGeminiApi(apiKey, model, prompt);
      const parsed = parseGeminiJSON(responseText);

      // Track newly created projects during batch to avoid duplicates
      const batchCreatedProjects: Record<string, string> = {};

      if (parsed && Array.isArray(parsed.tasks)) {
        for (const item of parsed.tasks) {
          const original = inboxTasks.find(t => t.id === item.id);
          if (!original) continue;

          let targetProjectId: string | null = null;

          if (item.projectId === 'new' && item.newProjectName) {
            const key = item.newProjectName.trim().toLowerCase();
            if (batchCreatedProjects[key]) {
              targetProjectId = batchCreatedProjects[key];
            } else {
              const newProj = await prisma.project.create({
                data: {
                  userId: user.id,
                  name: item.newProjectName.trim(),
                  parentId: item.newProjectParentId || null,
                  expanded: true,
                },
              });
              batchCreatedProjects[key] = newProj.id;
              targetProjectId = newProj.id;
            }
          } else if (item.projectId && item.projectId !== 'new') {
            const exists = existingProjects.some(p => p.id === item.projectId);
            targetProjectId = exists ? item.projectId : null;
          }

          const newNotes = (original.notes ? original.notes + '\n\n' : '') + (item.notes || '');

          await prisma.task.update({
            where: { id: original.id },
            data: {
              text: item.elaboratedText || original.text,
              notes: newNotes,
              projectId: targetProjectId,
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

      const allTasks = await prisma.task.findMany({
        where: { userId: user.id },
        include: { subtasks: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      });

      const allProjects = await prisma.project.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({ tasks: allTasks, projects: allProjects });
    }

    return NextResponse.json({ error: 'Specify taskId or inbox: true' }, { status: 400 });
  } catch (err: any) {
    console.error('Organization API error:', err);
    return NextResponse.json({ error: err.message || 'خطا در سازماندهی هوش مصنوعی' }, { status: 500 });
  }
}

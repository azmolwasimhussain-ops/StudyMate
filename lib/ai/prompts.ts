export const SYSTEM_PROMPTS = {
  studyBase: (materialTitle?: string) => `You are StudyMate, an expert AI study partner. ${
    materialTitle
      ? `You are helping a student study "${materialTitle}".`
      : "You help students understand complex topics."
  }

Rules:
- Only use information from the provided context/material
- If the answer isn't in the context, say so clearly: "I couldn't find this in your material"
- Never invent facts not present in the context
- Structure your answers with clear headings and bullet points
- Cite relevant parts of the material when possible`,

  simple: `Explain like I'm encountering this topic for the first time. Use:
- Simple, everyday language
- Analogies and real-world examples
- Short, clear sentences
- Avoid technical jargon unless you explain it immediately`,

  detailed: `Give a thorough conceptual explanation. Include:
- Core definition and concept
- Underlying principles and theory
- Multiple examples
- Connections to related concepts
- Common applications`,

  examReady: `Give a structured exam-quality answer. Format it as:
**Definition:** [clear definition]
**Key Points:**
- [point 1]
- [point 2]
- [point 3]
**Example:** [relevant example]
**Important for Exams:** [what examiners look for]`,
};

export function buildChatPrompt({
  query,
  context,
  mode,
  materialTitle,
}: {
  query: string;
  context: string;
  mode: "simple" | "detailed" | "exam_ready";
  materialTitle?: string;
}): { system: string; user: string } {
  const modeInstructions =
    mode === "simple"
      ? SYSTEM_PROMPTS.simple
      : mode === "exam_ready"
      ? SYSTEM_PROMPTS.examReady
      : SYSTEM_PROMPTS.detailed;

  const system = `${SYSTEM_PROMPTS.studyBase(materialTitle)}

${modeInstructions}`;

  const user = context
    ? `Here is the relevant context from the study material:

---
${context}
---

Now answer this question based on the context above:
${query}`
    : query;

  return { system, user };
}

export function buildQuizPrompt({
  context,
  numQuestions,
  difficulty,
  questionType,
}: {
  context: string;
  numQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  questionType: "mcq" | "mixed";
}): { system: string; user: string } {
  const system = `You are an expert quiz generator for students. Generate high-quality multiple choice questions based on the provided study material.

Rules:
- Only use content from the provided material
- Each question must test actual understanding, not trivial facts
- Distractors (wrong options) should be plausible but clearly wrong to someone who understands the material
- Vary the cognitive level: some recall, some application, some analysis
- Provide brief explanations for the correct answer
- Return ONLY valid JSON, no extra text`;

  const difficultyGuide = {
    easy: "Focus on definitions, basic concepts, and direct recall.",
    medium: "Mix recall with application and comparison questions.",
    hard: "Focus on analysis, synthesis, edge cases, and deep understanding.",
  };

  const user = `Study material context:
---
${context}
---

Generate exactly ${numQuestions} multiple-choice questions.
Difficulty: ${difficulty} (${difficultyGuide[difficulty]})

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct",
      "topic": "Topic or concept being tested"
    }
  ]
}

correctAnswer is the 0-based index of the correct option in the options array.
Generate exactly ${numQuestions} questions.`;

  return { system, user };
}

export function buildStudyPlanPrompt({
  goal,
  examDate,
  hoursPerDay,
  topics,
}: {
  goal: string;
  examDate?: string;
  hoursPerDay: number;
  topics: string[];
}): { system: string; user: string } {
  const daysUntilExam = examDate
    ? Math.ceil(
        (new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : 14;

  const system = `You are an expert academic study planner. Create realistic, structured study plans that consider cognitive load, spaced repetition, and exam preparation best practices.

Rules:
- Create a day-by-day plan
- Each day should not exceed the available hours
- Include revision days before the exam
- Space difficult topics appropriately
- Return ONLY valid JSON, no extra text`;

  const user = `Create a study plan for:

Goal: ${goal}
${examDate ? `Exam Date: ${examDate} (${daysUntilExam} days away)` : "Timeline: 2 weeks"}
Available Study Time: ${hoursPerDay} hours per day
Topics to cover: ${topics.join(", ")}

Return a JSON object with this exact structure:
{
  "title": "Study plan title",
  "totalDays": ${Math.min(daysUntilExam, 21)},
  "tasks": [
    {
      "day": 1,
      "title": "Topic name",
      "description": "What to study and how",
      "duration": ${hoursPerDay},
      "topics": ["sub-topic 1", "sub-topic 2"]
    }
  ]
}

Create tasks for all ${Math.min(daysUntilExam, 21)} days. Include review/revision days.`;

  return { system, user };
}

export function buildRevisionPrompt({
  context,
  materialTitle,
}: {
  context: string;
  materialTitle: string;
}): { system: string; user: string } {
  const system = `You are a study revision expert. Create comprehensive revision notes that help students quickly review and retain key concepts before an exam.

Rules:
- Only use content from the provided material
- Be concise but comprehensive
- Structure information for quick scanning
- Return ONLY valid JSON, no extra text`;

  const user = `Create revision notes for: "${materialTitle}"

Material context:
---
${context}
---

Return a JSON object with this exact structure:
{
  "summary": "2-3 sentence overview of the entire topic",
  "keyConcepts": [
    {
      "concept": "Concept name",
      "definition": "Clear, concise definition",
      "example": "Practical example"
    }
  ],
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    }
  ],
  "commonMistakes": [
    "Common mistake 1",
    "Common mistake 2"
  ],
  "examTips": [
    "Exam tip 1",
    "Exam tip 2"
  ],
  "quickRevision": "A 5-10 bullet point summary of the most important points"
}

Generate at least 5 keyConcepts, 8 flashcards, 3 commonMistakes, and 4 examTips.`;

  return { system, user };
}

export function buildWeakTopicPrompt({
  quizResults,
}: {
  quizResults: Array<{
    question: string;
    topic: string;
    isCorrect: boolean;
  }>;
}): { system: string; user: string } {
  const system = `You are a learning analytics expert. Analyze quiz performance to identify weak areas and provide actionable study recommendations.`;

  const incorrectQuestions = quizResults.filter((r) => !r.isCorrect);

  const user = `Analyze this student's quiz performance:

Total Questions: ${quizResults.length}
Incorrect Answers: ${incorrectQuestions.length}
Score: ${Math.round(((quizResults.length - incorrectQuestions.length) / quizResults.length) * 100)}%

Incorrect questions and topics:
${incorrectQuestions.map((q) => `- Topic: ${q.topic} | Question: ${q.question}`).join("\n")}

Identify:
1. The weakest topic areas
2. Specific knowledge gaps
3. Study recommendations

Return a JSON object:
{
  "weakTopics": ["topic1", "topic2"],
  "recommendations": [
    {
      "topic": "topic name",
      "action": "Specific study action",
      "priority": "high|medium|low"
    }
  ],
  "overallFeedback": "Brief overall assessment and encouragement"
}`;

  return { system, user };
}

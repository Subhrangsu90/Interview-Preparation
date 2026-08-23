const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Root of the Interview Preparation repo (parent of web-viewer/)
const REPO_ROOT = path.resolve(__dirname, "..");

// Dynamic .viewerignore parser
function getIgnoredSet() {
	const defaultIgnored = [
		".git",
		".gitignore",
		".viewerignore",
		"node_modules",
		"web-viewer",
		"dist",
		".dist",
		".vercel",
		"api",
		"vercel.json",
		"vite.config.js",
		"package.json",
		"package-lock.json",
		".DS_Store",
		"Thumbs.db",
		// Vercel runtime bundle metadata; not part of the workspace.
		"___vc",
		"___env.encrypted",
		"scripts",
	];

	const ignoreFilePath = path.join(REPO_ROOT, ".viewerignore");
	if (fs.existsSync(ignoreFilePath)) {
		try {
			const content = fs.readFileSync(ignoreFilePath, "utf-8");
			const lines = content
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line && !line.startsWith("#"));
			return new Set([...defaultIgnored, ...lines]);
		} catch {
			/* fallback */
		}
	}
	return new Set(defaultIgnored);
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ─── API: Save file ───
app.post("/api/save", (req, res) => {
	if (process.env.VERCEL) {
		return res.status(501).json({
			error: "Saving files is only available when the viewer runs locally.",
		});
	}

	const { path: filePath, content } = req.body;
	if (!filePath || content === undefined) {
		return res
			.status(400)
			.json({ error: "Missing path or content parameter" });
	}

	const fullPath = path.join(REPO_ROOT, filePath);
	const resolved = path.resolve(fullPath);

	if (!resolved.startsWith(REPO_ROOT)) {
		return res.status(403).json({ error: "Access denied" });
	}

	try {
		fs.writeFileSync(resolved, content, "utf-8");
		res.json({ success: true, path: filePath });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ─── API: Recursive file tree ───
function buildTree(dirPath, relativeTo) {
	const ignored = getIgnoredSet();
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
	const tree = [];

	for (const entry of entries) {
		if (ignored.has(entry.name)) continue;
		if (entry.name.startsWith(".")) continue;

		const fullPath = path.join(dirPath, entry.name);
		const relPath = path.relative(relativeTo, fullPath).replace(/\\/g, "/");

		if (entry.isDirectory()) {
			tree.push({
				name: entry.name,
				path: relPath,
				type: "directory",
				children: buildTree(fullPath, relativeTo),
			});
		} else {
			const ext = path.extname(entry.name).toLowerCase();
			const stats = fs.statSync(fullPath);
			tree.push({
				name: entry.name,
				path: relPath,
				type: "file",
				extension: ext,
				size: stats.size,
				modified: stats.mtime.toISOString(),
			});
		}
	}

	// Sort: directories first, then files, both alphabetically
	tree.sort((a, b) => {
		if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
		return a.name.localeCompare(b.name, undefined, { numeric: true });
	});

	return tree;
}

app.get("/api/tree", (req, res) => {
	try {
		const tree = buildTree(REPO_ROOT, REPO_ROOT);
		res.json({ root: path.basename(REPO_ROOT), tree });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ─── API: File content (text) ───
app.get("/api/file", (req, res) => {
	const filePath = req.query.path;
	if (!filePath)
		return res.status(400).json({ error: "Missing path parameter" });

	const fullPath = path.join(REPO_ROOT, filePath);
	const resolved = path.resolve(fullPath);

	// Security: prevent directory traversal
	if (!resolved.startsWith(REPO_ROOT)) {
		return res.status(403).json({ error: "Access denied" });
	}

	if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
		return res.status(404).json({ error: "File not found" });
	}

	try {
		const content = fs.readFileSync(resolved, "utf-8");
		const ext = path.extname(filePath).toLowerCase();
		res.json({ path: filePath, content, extension: ext });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ─── API: Raw file serving (images, binary) ───
app.get("/api/raw", (req, res) => {
	const filePath = req.query.path;
	if (!filePath)
		return res.status(400).json({ error: "Missing path parameter" });

	const fullPath = path.join(REPO_ROOT, filePath);
	const resolved = path.resolve(fullPath);

	if (!resolved.startsWith(REPO_ROOT)) {
		return res.status(403).json({ error: "Access denied" });
	}

	if (!fs.existsSync(resolved)) {
		return res.status(404).json({ error: "File not found" });
	}

	res.sendFile(resolved);
});

// ─── API: Search files ───
app.get("/api/search", (req, res) => {
	const query = (req.query.q || "").toLowerCase().trim();
	if (!query) return res.json({ results: [] });

	const results = [];

	const ignored = getIgnoredSet();

	function searchDir(dirPath) {
		const entries = fs.readdirSync(dirPath, { withFileTypes: true });
		for (const entry of entries) {
			if (ignored.has(entry.name) || entry.name.startsWith(".")) continue;
			const fullPath = path.join(dirPath, entry.name);
			const relPath = path
				.relative(REPO_ROOT, fullPath)
				.replace(/\\/g, "/");

			if (entry.isDirectory()) {
				searchDir(fullPath);
			} else {
				// Match file name
				if (entry.name.toLowerCase().includes(query)) {
					results.push({
						name: entry.name,
						path: relPath,
						matchType: "filename",
					});
				}
				// Match inside text files
				const ext = path.extname(entry.name).toLowerCase();
				const textExts = [
					".js",
					".ts",
					".md",
					".json",
					".css",
					".html",
					".txt",
					".py",
					".jsx",
					".tsx",
				];
				if (textExts.includes(ext)) {
					try {
						const content = fs.readFileSync(fullPath, "utf-8");
						if (content.toLowerCase().includes(query)) {
							// Find matching lines
							const lines = content.split("\n");
							const matchingLines = [];
							for (
								let i = 0;
								i < lines.length && matchingLines.length < 3;
								i++
							) {
								if (lines[i].toLowerCase().includes(query)) {
									matchingLines.push({
										line: i + 1,
										text: lines[i].trim().substring(0, 120),
									});
								}
							}
							if (matchingLines.length > 0) {
								results.push({
									name: entry.name,
									path: relPath,
									matchType: "content",
									matches: matchingLines,
								});
							}
						}
					} catch {
						/* skip unreadable files */
					}
				}
			}

			if (results.length >= 50) return;
		}
	}

	searchDir(REPO_ROOT);
	res.json({ query, results });
});

// ─── API: Assistant Config & Key Verification ───
app.get("/api/assistant/config", (req, res) => {
	const hasGeminiEnv = Boolean(process.env.GEMINI_API_KEY);
	const hasOpenAIEnv = Boolean(process.env.OPENAI_API_KEY);
	res.json({
		hasGeminiEnv,
		hasOpenAIEnv,
		defaultProvider: hasGeminiEnv ? "gemini" : (hasOpenAIEnv ? "openai" : "mock")
	});
});

// ─── Intelligent A2UI Assistant Engine (Gemini & OpenAI + Local Fallback) ───
const A2UI_SYSTEM_PROMPT = `
You are the AI Technical Interview Coach & Coding Assistant for an engineering candidate.
You are embedded inside a personal study workspace containing JavaScript, TypeScript, and software engineering notes.

CRITICAL PROTOCOL REQUIREMENT - A2UI (Agent-to-User Interface):
You MUST respond with a valid JSON object matching the A2UI Schema below.
Do not output markdown backticks wrapping the whole response if possible, output clean JSON.

A2UI JSON SCHEMA:
{
  "type": "a2ui_payload",
  "components": [
    // 1. Text Component: For conversational answers, explanations, deep dives, code breakdowns.
    {
      "type": "text",
      "content": "Markdown formatted explanation, tips, interview traps, and MDN references."
    },
    // 2. Quiz Component: When user asks for a quiz, question, test, or practice.
    {
      "type": "quiz",
      "title": "Topic Quiz Title",
      "question": "Question text...",
      "code": "// optional snippet if testing output or bug finding",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "B",
      "explanation": "Detailed rationale on why B is correct and common interview misconceptions."
    },
    // 3. Flashcard Component: When user asks for flashcards, quick recall, revision cards.
    {
      "type": "flashcard",
      "topic": "Topic Name",
      "cards": [
        {
          "front": "Concept or Question?",
          "back": "Clear concise answer / mental model.",
          "keyTakeaway": "1-sentence interview pro-tip."
        }
      ]
    },
    // 4. Code Playground Component: When user asks for coding challenge, playground, implement a function.
    {
      "type": "playground",
      "title": "Coding Challenge Title",
      "instructions": "Task description & constraints...",
      "language": "javascript",
      "starterCode": "function solve(arr) {\\n  // Write solution\\n}\\n\\nconsole.log(solve([1, 2, 3]));",
      "testCases": [
        { "input": "solve([1, 2, 3])", "expected": "[3, 2, 1]" }
      ]
    },
    // 5. Progress Tracker Component: To summarize readiness on the topic.
    {
      "type": "progress",
      "topic": "Topic Name",
      "masteryLevel": "Intermediate",
      "readinessScore": 80,
      "recommendations": ["Review Closures", "Practice Event Loop microtasks"]
    }
  ]
}

Instructions:
- Use both the provided workspace notes/code context AND your deep software engineering knowledge base (MDN, ECMAScript specs, modern best practices).
- When asked a question, provide a thorough, articulate answer using the "text" component.
- If the user asks for a quiz, practice, flashcards, or coding challenge, include the respective A2UI component in "components".
`;

// Helper: Smart Local Mock Generator (when no API key is provided)
function generateSmartMockA2UI(query, fileContext, fileName) {
	const q = (query || "").toLowerCase();
	const baseName = fileName ? path.basename(fileName) : "JavaScript";
	const snippet = fileContext ? fileContext.substring(0, 300) : "";

	if (q.includes("quiz") || q.includes("test") || q.includes("question")) {
		return {
			type: "a2ui_payload",
			components: [
				{
					type: "text",
					content: `### Interview Quiz: ${baseName}\nHere is a targeted interview question based on **${baseName}** and core JavaScript runtime principles:`
				},
				{
					type: "quiz",
					title: `Technical Quiz: ${baseName}`,
					question: fileContext 
						? `Considering the concepts in \`${baseName}\`, what is the primary behavior of execution context & scope in this pattern?`
						: `What is the output of \`console.log(1 + +'2' + '2')\` in JavaScript?`,
					code: fileContext 
						? `${snippet.slice(0, 180)}...`
						: `console.log(1 + +'2' + '2');\nconsole.log(typeof NaN);`,
					options: [
						{ id: "A", "text": "Output is '32' and 'number'" },
						{ id: "B", "text": "Output is '122' and 'NaN'" },
						{ id: "C", "text": "Output is '14' and 'undefined'" },
						{ id: "D", "text": "TypeError: Invalid unary operator" }
					],
					correctOptionId: "A",
					explanation: "The unary `+` before `'2'` coerces it into number `2`. `1 + 2 = 3`. Then `3 + '2'` coerces to string concatenation `'32'`. `typeof NaN` is `'number'` (IEEE 754 float)."
				},
				{
					type: "progress",
					topic: baseName,
					masteryLevel: "Practicing",
					readinessScore: 70,
					recommendations: ["Type Coercion rules", "Implicit vs Explicit casting", "Equality comparisons (== vs ===)"]
				}
			]
		};
	}

	if (q.includes("flashcard") || q.includes("card") || q.includes("revision")) {
		return {
			type: "a2ui_payload",
			components: [
				{
					type: "text",
					content: `### Flashcards: ${baseName}\nFlip through these key interview memory cards for **${baseName}**:`
				},
				{
					type: "flashcard",
					topic: baseName,
					cards: [
						{
							front: `What is the core problem solved in ${baseName}?`,
							back: "It manages state, scope encapsulation, or asynchronous operations cleanly while preventing memory leaks and race conditions.",
							keyTakeaway: "Always explain both the 'How it works' and 'Why to use it' in interviews."
						},
						{
							front: "What is the difference between Microtasks and Macrotasks in the Event Loop?",
							back: "Microtasks (Promises, queueMicrotask, MutationObserver) run immediately after the current script and before the next rendering or Macrotask (setTimeout, setInterval, I/O).",
							keyTakeaway: "Microtask queue must be completely emptied before moving to the next macrotask."
						},
						{
							front: "What is Temporal Dead Zone (TDZ)?",
							back: "The phase between entering the block scope where let/const is bound and the actual declaration line where it is initialized. Accessing it triggers ReferenceError.",
							keyTakeaway: "let & const are hoisted, but not initialized."
						}
					]
				}
			]
		};
	}

	if (q.includes("playground") || q.includes("code") || q.includes("challenge") || q.includes("solve")) {
		return {
			type: "a2ui_payload",
			components: [
				{
					type: "text",
					content: `### Interactive Code Challenge: ${baseName}\nTry writing the implementation below and click **Run Code** to test it against test cases:`
				},
				{
					type: "playground",
					title: `Interview Challenge: Flatten Nested Array`,
					instructions: "Write a function `flatten(arr)` that flattens a deeply nested array of arbitrary depth without using `Array.prototype.flat()`.",
					language: "javascript",
					starterCode: `function flatten(arr) {
  // Your code here
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

console.log(flatten([1, [2, [3, [4]], 5]]));`,
					testCases: [
						{ input: "flatten([1, [2, 3], 4])", expected: "[1, 2, 3, 4]" },
						{ input: "flatten([[1], [[2]], 3])", expected: "[1, 2, 3]" }
					]
				}
			]
		};
	}

	// Default assistant response
	return {
		type: "a2ui_payload",
		components: [
			{
				type: "text",
				content: `### Assistant Insights: ${baseName}\n\n` +
					(fileContext 
						? `I analyzed your current file **${baseName}** from the workspace.\n\n` +
						  `**Key Architectural Points:**\n` +
						  `1. **Lexical Scope & Execution Context:** Variables are bound within their respective blocks.\n` +
						  `2. **Performance & Memory:** Avoid unnecessary object allocations inside loops.\n` +
						  `3. **Interview Question Angle:** Interviewers often ask about edge cases (null vs undefined, coercion, async timing).\n\n` +
						  `> *Pro-Tip:* Click **"Quiz File"** or **"Flashcards"** below to test yourself on this exact file!`
						: `Welcome to your Interview Preparation Assistant! Ask me any concept, or click one of the quick actions below to generate a live quiz, flashcards, or code challenge.`)
			}
		]
	};
}

// ─── Assistant Chat Handler (Gemini & OpenAI + Hybrid RAG) ───
app.post("/api/assistant/chat", async (req, res) => {
	const { query, currentFilePath, conversationHistory, provider, apiKey, model } = req.body;

	if (!query && !currentFilePath) {
		return res.status(400).json({ error: "Missing query or file context" });
	}

	// Read local workspace file context if available
	let fileContext = "";
	let fileName = "";
	if (currentFilePath) {
		const fullPath = path.join(REPO_ROOT, currentFilePath);
		const resolved = path.resolve(fullPath);
		if (resolved.startsWith(REPO_ROOT) && fs.existsSync(resolved)) {
			try {
				fileContext = fs.readFileSync(resolved, "utf-8");
				fileName = path.basename(resolved);
			} catch {
				/* skip unreadable */
			}
		}
	}

	const selectedProvider = provider || (process.env.GEMINI_API_KEY ? "gemini" : (process.env.OPENAI_API_KEY ? "openai" : "mock"));
	const activeKey = apiKey || (selectedProvider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);

	// Fallback to local intelligent A2UI engine if no key is configured
	if (!activeKey || selectedProvider === "mock") {
		const mockResponse = generateSmartMockA2UI(query, fileContext, fileName);
		return res.json(mockResponse);
	}

	try {
		const userPromptWithContext = `
USER QUERY:
${query || "Analyze this file and provide interview coaching, quiz, or flashcards."}

CURRENT ACTIVE FILE IN WORKSPACE:
Filename: ${fileName || "None"}
File Content:
${fileContext ? fileContext.substring(0, 4000) : "No file open"}
`;

		if (selectedProvider === "gemini") {
			const geminiModel = model || "gemini-2.5-flash";
			const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${activeKey}`;
			
			const payload = {
				contents: [
					{
						role: "user",
						parts: [
							{ text: A2UI_SYSTEM_PROMPT + "\n\n" + userPromptWithContext }
						]
					}
				],
				generationConfig: {
					responseMimeType: "application/json",
					temperature: 0.4
				}
			};

			const response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const errorData = await response.text();
				throw new Error(`Gemini API error (${response.status}): ${errorData}`);
			}

			const data = await response.json();
			const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
			if (!candidateText) {
				throw new Error("No response generated by Gemini");
			}

			const parsed = JSON.parse(candidateText);
			return res.json(parsed);

		} else if (selectedProvider === "openai") {
			const openaiModel = model || "gpt-4o-mini";
			const url = "https://api.openai.com/v1/chat/completions";

			const isReasoningModel = openaiModel.startsWith("o1") || openaiModel.startsWith("o3");
			const systemRole = isReasoningModel ? "developer" : "system";

			const messages = [
				{ role: systemRole, content: A2UI_SYSTEM_PROMPT },
				...(conversationHistory || []).slice(-4),
				{ role: "user", content: userPromptWithContext }
			];

			const requestBody = {
				model: openaiModel,
				messages,
				response_format: { type: "json_object" }
			};

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${activeKey}`
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				const errorData = await response.text();
				throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
			}

			const data = await response.json();
			const content = data.choices?.[0]?.message?.content;
			const parsed = JSON.parse(content);
			return res.json(parsed);
		}

	} catch (err) {
		console.error("AI Assistant Provider error:", err);
		// Graceful fallback to smart local generator with error alert
		const fallback = generateSmartMockA2UI(query, fileContext, fileName);
		fallback.components.unshift({
			type: "text",
			content: `> ⚠️ **API Notice:** ${err.message}. Showing local offline study insights instead.`
		});
		return res.json(fallback);
	}
});

// ─── Smart Heuristic Prompt Refiner (Offline / Fast Fallback) ───
function smartHeuristicRefine(rawPrompt, mode, fileName, fileContext) {
	const trimmed = (rawPrompt || "").trim();
	const baseName = fileName ? path.basename(fileName) : "";
	const fileTarget = baseName ? `specifically in the context of \`${baseName}\`` : "with modern JavaScript/TypeScript standards";

	let targetMode = mode || "auto";
	if (targetMode === "auto") {
		const lower = trimmed.toLowerCase();
		if (lower.includes("quiz") || lower.includes("test") || lower.includes("question")) targetMode = "quiz";
		else if (lower.includes("code") || lower.includes("implement") || lower.includes("function") || lower.includes("challenge")) targetMode = "challenge";
		else if (lower.includes("fix") || lower.includes("optimize") || lower.includes("performance") || lower.includes("leak")) targetMode = "optimize";
		else if (lower.includes("simple") || lower.includes("beginner") || lower.includes("explain") || lower.includes("eli5")) targetMode = "eli5";
		else targetMode = "depth";
	}

	let refined = "";
	let reason = "";
	let tags = [];

	switch (targetMode) {
		case "quiz":
			refined = `Create an interactive senior-level technical interview quiz on "${trimmed || baseName || 'JavaScript core mechanics'}" ${fileTarget}. Include tricky edge-case code snippets, common candidate misconceptions, and detailed rationale for each option.`;
			reason = "Refactored into a rigorous interview quiz with edge cases and distractor analysis.";
			tags = ["#interview-quiz", "#edge-cases", "#mechanics"];
			break;
		case "challenge":
			refined = `Provide an algorithmic coding challenge based on "${trimmed || baseName || 'Data structures & algorithms'}" ${fileTarget}. Include explicit constraints, Big-O time and space requirements, starter boilerplate, and multiple unit test cases with corner cases.`;
			reason = "Structured as a full technical interview coding problem with constraints and verification test cases.";
			tags = ["#coding-challenge", "#big-o", "#test-cases"];
			break;
		case "optimize":
			refined = `Perform a senior engineer code review and optimization analysis on "${trimmed || baseName || 'the current code'}" ${fileTarget}. Analyze runtime complexity, potential memory leaks (closures, dangling listeners), event loop blocking, and propose a clean, modern refactoring.`;
			reason = "Enhanced for deep performance profiling, memory diagnostics, and clean architecture.";
			tags = ["#optimization", "#memory-leaks", "#code-review"];
			break;
		case "eli5":
			refined = `Explain "${trimmed || baseName || 'this technical concept'}" ${fileTarget} using an intuitive real-world analogy and visual mental model, followed by a crisp breakdown of how the JavaScript engine executes it under the hood.`;
			reason = "Transformed into a dual-layer explanation (intuitive mental model + runtime spec).";
			tags = ["#mental-model", "#eli5", "#visual-analogy"];
			break;
		case "depth":
		default:
			refined = `Provide a comprehensive technical interview deep-dive on "${trimmed || baseName || 'Core JavaScript mechanics'}" ${fileTarget}. Cover underlying ECMAScript specification behavior, execution contexts, common interview traps, and production best practices.`;
			reason = "Upgraded to senior interview depth with ECMAScript spec references and practical pitfalls.";
			tags = ["#interview-depth", "#ecmascript-spec", "#runtime-internals"];
			break;
	}

	return {
		refinedPrompt: refined,
		originalPrompt: trimmed,
		mode: targetMode,
		explanation: reason,
		tags
	};
}

// ─── Assistant Prompt Refine Handler ───
app.post("/api/assistant/refine-prompt", async (req, res) => {
	const { prompt, mode, currentFilePath, provider, apiKey, model } = req.body;

	if (!prompt && !currentFilePath) {
		return res.status(400).json({ error: "Missing prompt or file context to refine" });
	}

	// Read local workspace file context if available
	let fileContext = "";
	let fileName = "";
	if (currentFilePath) {
		const fullPath = path.join(REPO_ROOT, currentFilePath);
		const resolved = path.resolve(fullPath);
		if (resolved.startsWith(REPO_ROOT) && fs.existsSync(resolved)) {
			try {
				fileContext = fs.readFileSync(resolved, "utf-8");
				fileName = path.basename(resolved);
			} catch {
				/* skip unreadable */
			}
		}
	}

	const selectedProvider = provider || (process.env.GEMINI_API_KEY ? "gemini" : (process.env.OPENAI_API_KEY ? "openai" : "mock"));
	const activeKey = apiKey || (selectedProvider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);

	// Fallback to smart heuristic refiner if offline
	if (!activeKey || selectedProvider === "mock") {
		const heuristic = smartHeuristicRefine(prompt, mode, fileName, fileContext);
		return res.json(heuristic);
	}

	try {
		const systemInstruction = `
You are an expert Prompt Engineer specializing in Technical Interview Preparation and Computer Science coaching.
Your job is to transform a user's rough or basic question into an exceptionally clear, structured, high-signal, expert-level prompt tailored for software engineering study.

Refinement Mode requested: ${mode || 'auto'}
- depth: Ask for deep ECMAScript specs, runtime mechanics, and tricky interview traps.
- quiz: Request interactive multiple-choice questions with edge-case code.
- challenge: Request a coding challenge with constraints, Big-O targets, and unit tests.
- optimize: Request performance profiling, memory leak diagnostics, and cleaner refactoring.
- eli5: Request an intuitive real-world analogy and visual mental model.
- auto: Detect best direction based on context.

JSON SCHEMA REQUIREMENT:
You must respond ONLY with valid JSON matching:
{
  "refinedPrompt": "Refined clear, comprehensive prompt string",
  "explanation": "Brief 1-sentence explanation of what was improved",
  "tags": ["#tag1", "#tag2", "#tag3"],
  "mode": "${mode || 'auto'}"
}
`;

		const userContext = `
RAW USER PROMPT:
${prompt || "Explain key concepts from this file."}

ACTIVE WORKSPACE FILE:
Filename: ${fileName || "None"}
Snippet: ${fileContext ? fileContext.substring(0, 1500) : "None"}
`;

		if (selectedProvider === "gemini") {
			const geminiModel = model || "gemini-2.5-flash";
			const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${activeKey}`;

			const payload = {
				contents: [
					{
						role: "user",
						parts: [{ text: systemInstruction + "\n\n" + userContext }]
					}
				],
				generationConfig: {
					responseMimeType: "application/json",
					temperature: 0.3
				}
			};

			const response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				throw new Error(`Gemini Refine error (${response.status})`);
			}

			const data = await response.json();
			const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
			if (candidateText) {
				const parsed = JSON.parse(candidateText);
				parsed.originalPrompt = prompt;
				return res.json(parsed);
			}
		} else if (selectedProvider === "openai") {
			const openaiModel = model || "gpt-4o-mini";
			const url = "https://api.openai.com/v1/chat/completions";

			const isReasoningModel = openaiModel.startsWith("o1") || openaiModel.startsWith("o3");
			const systemRole = isReasoningModel ? "developer" : "system";

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${activeKey}`
				},
				body: JSON.stringify({
					model: openaiModel,
					messages: [
						{ role: systemRole, content: systemInstruction },
						{ role: "user", content: userContext }
					],
					response_format: { type: "json_object" }
				})
			});

			if (!response.ok) {
				throw new Error(`OpenAI Refine error (${response.status})`);
			}

			const data = await response.json();
			const content = data.choices?.[0]?.message?.content;
			if (content) {
				const parsed = JSON.parse(content);
				parsed.originalPrompt = prompt;
				return res.json(parsed);
			}
		}

		// Fallback
		return res.json(smartHeuristicRefine(prompt, mode, fileName, fileContext));
	} catch (err) {
		console.warn("Prompt refine provider fallback:", err.message);
		return res.json(smartHeuristicRefine(prompt, mode, fileName, fileContext));
	}
});


// ─── File watcher SSE endpoint ───
app.get("/api/watch", (req, res) => {
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache, no-transform",
		Connection: "keep-alive",
	});

	// Serverless / Vercel deployment check: disable live watch gracefully
	if (process.env.VERCEL) {
		res.write("data: disabled-on-vercel\n\n");
		return res.end();
	}

	let chokidar;
	try {
		chokidar = require("chokidar");
	} catch {
		res.write("data: chokidar-not-available\n\n");
		return res.end();
	}

	try {
		res.write("data: connected\n\n");
		const watcher = chokidar.watch(REPO_ROOT, {
			ignored: /(^|[\/\\])(\.|node_modules|web-viewer|\.git)/,
			persistent: true,
			ignoreInitial: true,
		});

		const sendEvent = (event, filePath) => {
			const relPath = path
				.relative(REPO_ROOT, filePath)
				.replace(/\\/g, "/");
			res.write(`data: ${JSON.stringify({ event, path: relPath })}\n\n`);
		};

		watcher.on("add", (p) => sendEvent("add", p));
		watcher.on("change", (p) => sendEvent("change", p));
		watcher.on("unlink", (p) => sendEvent("unlink", p));
		watcher.on("addDir", (p) => sendEvent("addDir", p));
		watcher.on("unlinkDir", (p) => sendEvent("unlinkDir", p));

		req.on("close", () => {
			watcher.close();
		});
	} catch (err) {
		res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
		res.end();
	}
});

// ─── Fallback: serve index.html ───
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (require.main === module) {
	app.listen(PORT, () => {
		console.log(`\n  ✏️  Interview Prep Viewer`);
		console.log(`  ────────────────────────`);
		console.log(`  📖  Open: http://localhost:${PORT}`);
		console.log(`  📂  Watching: ${REPO_ROOT}`);
		console.log(`  🔄  Live reload enabled\n`);
	});
}

module.exports = app;

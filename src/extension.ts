import * as vscode from "vscode";

// Array of emojis to randomly insert
const emojis = ["🐛", "🐞", "🤡", "🚀", "💩", "🤯", "😵‍💫"];

// Useless mode messages and comments
const uselessMessages = [
  "The bug is not a bug, it is a feature.",
  "It is not a bug, it is a distraction.",
  "You are not coding, you are debugging.",
  "It is a bug, but it is not my bug.",
  "Hold my beer.",
  'What do you mean, "it is a bug"? I did not write that code.',
  "Is that a feature, or are you just happy to see it?",
];

const sarcasticComments = [
  "// This is definitely the best way to do this.",
  "// I'm sure this will be fine in production.",
  "// Don't worry, the compiler will fix this.",
  "// Look at this elegant and clean code!",
  "// Future self will thank me for this.",
];

// Configuration for regular mode
const REGULAR_CHAR_TRIGGER = 50;
const REGULAR_TIME_TRIGGER = 10000;
const REGULAR_COOLDOWN = 2000;

// Configuration for extreme mode
const EXTREME_CHAR_TRIGGER = 20;
const EXTREME_TIME_TRIGGER = 5000;
const EXTREME_COOLDOWN = 1000;

// State variables
let charCount = 0;
let lastInsert = Date.now();
let timeInterval: NodeJS.Timeout | undefined;
let changeTextDisposable: vscode.Disposable | undefined;

// Function to start the bug insertion with specified settings
function startBugInsertion(
  charTrigger: number,
  timeTrigger: number,
  cooldown: number
) {
  // Stop any existing bug insertion first
  stopBugInsertion();

  // Set up the activity-based listener
  changeTextDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
    charCount += event.contentChanges.reduce(
      (acc, change) => acc + change.text.length,
      0
    );
    if (charCount >= charTrigger) {
      insertRandomEmoji(cooldown);
      charCount = 0;
    }
  });

  // Set up the time-based interval
  timeInterval = setInterval(() => {
    insertRandomEmoji(cooldown);
  }, timeTrigger);
}

// Function to stop the bug insertion
function stopBugInsertion() {
  if (changeTextDisposable) {
    changeTextDisposable.dispose();
    changeTextDisposable = undefined;
  }
  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = undefined;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("🎉 Hold My Bug🪲 extension is ready!");

  // Register the "start" command
  let startDisposable = vscode.commands.registerCommand(
    "hold-my-bug.start",
    () => {
      startBugInsertion(
        REGULAR_CHAR_TRIGGER,
        REGULAR_TIME_TRIGGER,
        REGULAR_COOLDOWN
      );
      vscode.window.showInformationMessage(
        "Hold My Bug: Regular mode started! 🪲"
      );
    }
  );

  // Register the "extreme" command
  let extremeDisposable = vscode.commands.registerCommand(
    "hold-my-bug.extreme",
    () => {
      startBugInsertion(
        EXTREME_CHAR_TRIGGER,
        EXTREME_TIME_TRIGGER,
        EXTREME_COOLDOWN
      );
      vscode.window.showInformationMessage(
        "Hold My Bug: EXTREME mode activated! 💥"
      );
    }
  );

  // Register the "stop" command
  let stopDisposable = vscode.commands.registerCommand(
    "hold-my-bug.stop",
    () => {
      stopBugInsertion();
      vscode.window.showInformationMessage(
        "Hold My Bug: Emoji insertion stopped! 🛑"
      );
    }
  );

  // Register other useless commands
  let uselessModeDisposable = vscode.commands.registerCommand(
    "hold-my-bug.useless-mode",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const message =
        uselessMessages[Math.floor(Math.random() * uselessMessages.length)];
      vscode.window.showInformationMessage(message);
      const doc = editor.document;
      const totalLines = doc.lineCount;
      if (totalLines === 0) {
        return;
      }
      const lineNum = Math.floor(Math.random() * totalLines);
      const line = doc.lineAt(lineNum);
      const charPos = Math.floor(Math.random() * (line.text.length + 1));
      editor.edit((editBuilder) => {
        const newText = `🤡 ${
          emojis[Math.floor(Math.random() * emojis.length)]
        }`;
        editBuilder.insert(new vscode.Position(lineNum, charPos), newText);
      });
    }
  );

  let typoDisposable = vscode.commands.registerCommand(
    "hold-my-bug.introduce-typo",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const doc = editor.document;
      const totalLines = doc.lineCount;
      if (totalLines === 0) {
        return;
      }
      const lineNum = Math.floor(Math.random() * totalLines);
      const line = doc.lineAt(lineNum);
      if (line.text.length > 0) {
        const charPos = Math.floor(Math.random() * line.text.length);
        const originalChar = line.text.charAt(charPos);
        const newChar = String.fromCharCode(
          originalChar.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1)
        );
        editor
          .edit((editBuilder) => {
            const range = new vscode.Range(
              new vscode.Position(lineNum, charPos),
              new vscode.Position(lineNum, charPos + 1)
            );
            editBuilder.replace(range, newChar);
          })
          .then(() => {
            vscode.window.showInformationMessage(
              "Hold My Bug: Typo introduced! Have fun debugging 🤯"
            );
          });
      }
    }
  );

  let sarcasticDisposable = vscode.commands.registerCommand(
    "hold-my-bug.sarcastic-comment",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const doc = editor.document;
      const totalLines = doc.lineCount;
      if (totalLines === 0) {
        return;
      }
      const lineNum = Math.floor(Math.random() * totalLines);
      const line = doc.lineAt(lineNum);
      const comment =
        sarcasticComments[Math.floor(Math.random() * sarcasticComments.length)];
      const formattedComment = getFormattedComment(comment, doc.languageId);
      editor
        .edit((editBuilder) => {
          editBuilder.insert(
            new vscode.Position(lineNum, 0),
            formattedComment + "\n"
          );
        })
        .then(() => {
          vscode.window.showInformationMessage(
            "Hold My Bug: A sarcastic comment has been added. You're welcome. 🤪"
          );
        });
    }
  );

  context.subscriptions.push(
    startDisposable,
    extremeDisposable,
    stopDisposable,
    uselessModeDisposable,
    typoDisposable,
    sarcasticDisposable
  );
}

// Inserts a random emoji at a random position in the active editor
function insertRandomEmoji(cooldown: number) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const now = Date.now();
  if (now - lastInsert < cooldown) {
    return;
  }
  lastInsert = now;
  const doc = editor.document;
  const totalLines = doc.lineCount;
  if (totalLines === 0) {
    return;
  }
  const lineNum = Math.floor(Math.random() * totalLines);
  const line = doc.lineAt(lineNum);
  const charPos = Math.floor(Math.random() * (line.text.length + 1));
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  editor.edit((editBuilder) => {
    editBuilder.insert(new vscode.Position(lineNum, charPos), emoji);
  });
}

// Helper function to format comments based on language
function getFormattedComment(comment: string, languageId: string): string {
  switch (languageId) {
    case "html":
    case "xml":
      return ``;
    case "python":
      return `# ${comment.replace("//", "")}`;
    case "javascript":
    case "typescript":
    case "csharp":
    case "java":
    default:
      return `${comment}`;
  }
}

export function deactivate() {
  stopBugInsertion();
}

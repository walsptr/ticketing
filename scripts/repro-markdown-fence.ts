import {
  normalizeMarkdownForStorage,
  markdownToAiChunks,
  markdownToAiText,
} from "../lib/ai/markdownPipeline";

type TestCase = {
  id: string;
  name: string;
  input?: any;
  check: (r: any, raw: string) => boolean | string[];
};

type TestResult = {
  id: string;
  name: string;
  result: "PASS" | "FAIL";
  errors?: string[];
};

const testCases: TestCase[] = [
  {
    id: "TC1",
    name: "Basic fenced code",
    input: "```bash\necho hi $HOME\n```",
    check: (r: any, raw: string) => {
      const errs: string[] = [];
      if (typeof raw !== "string" || !raw.includes("```bash")) {
        errs.push("output tidak mengandung '```bash'");
      }
      if (typeof raw !== "string" || !raw.includes("echo hi")) {
        errs.push("output tidak mengandung 'echo hi'");
      }
      return errs.length === 0 ? true : errs;
    },
  },
  {
    id: "TC2",
    name: "Bug report exact description (Http failure + inline backtick URL 404)",
    input:
      "Http failure response for \n `http://kubevirt.kube.local/k8s/apis/cdi.kubevirt.io/v1beta1/namespaces/cdi/datavolumes/test:\n`  404 Not Found",
    check: (r: any, raw: string) => {
      const errs: string[] = [];
      if (typeof raw !== "string" || raw.length <= 0) {
        errs.push("output length harus > 0");
      }
      if (typeof raw !== "string" || !raw.includes("404 Not Found")) {
        errs.push("output tidak mengandung '404 Not Found'");
      }
      return errs.length === 0 ? true : errs;
    },
  },
  {
    id: "TC3",
    name: "Malformed fence 6 backticks normalized to 3",
    input: "``````javascript\nconst a = 1;\n```````",
    check: (r: any, raw: string) => {
      const errs: string[] = [];
      if (typeof raw !== "string" || raw.includes("``````")) {
        errs.push("output masih mengandung enam backtick berurutan");
      }
      if (typeof raw !== "string" || !raw.includes("```javascript")) {
        errs.push("output tidak mengandung '```javascript'");
      }
      return errs.length === 0 ? true : errs;
    },
  },
  {
    id: "TC4",
    name: "Mixed fence marker opening / closing",
    input: "```python\nprint(1)\n~~~~~",
    check: (r: any, raw: string) => {
      const errs: string[] = [];
      if (typeof raw !== "string" || raw.length <= 0) {
        errs.push("output panjang harus > 0");
      }
      return errs.length === 0 ? true : errs;
    },
  },
  {
    id: "TC5",
    name: "Inline code only (no fenced block)",
    input: "Panggil method `foo()` lalu `bar` dengan value `baz`.",
    check: (r: any, raw: string) => {
      const errs: string[] = [];
      if (typeof raw !== "string" || !raw.includes("`foo()`")) {
        errs.push("output tidak mengandung inline backtick `foo()`");
      }
      return errs.length === 0 ? true : errs;
    },
  },
  {
    id: "TC6",
    name: "Null / undefined / empty",
    check: () => {
      const errs: string[] = [];
      let outNull = "";
      let outUndefined = "";
      let outEmpty = "";

      try {
        outNull = normalizeMarkdownForStorage(null as any);
      } catch (e: any) {
        errs.push(`null throw error: ${e.message}`);
      }
      try {
        outUndefined = normalizeMarkdownForStorage(undefined as any);
      } catch (e: any) {
        errs.push(`undefined throw error: ${e.message}`);
      }
      try {
        outEmpty = normalizeMarkdownForStorage("");
      } catch (e: any) {
        errs.push(`empty string throw error: ${e.message}`);
      }

      if (outNull !== "") errs.push(`null tidak dikonversi ke '', hasil: '${outNull}'`);
      if (outUndefined !== "") errs.push(`undefined tidak dikonversi ke '', hasil: '${outUndefined}'`);
      if (outEmpty !== "") errs.push(`empty string tidak dikonversi ke '', hasil: '${outEmpty}'`);

      return errs.length === 0 ? true : errs;
    },
  },
  {
    id: "TC7",
    name: "Heading + list + blockquote kombinasi",
    input: "# Halo\n\n- item A\n- item B\n\n> Quote ini keren",
    check: (r: any, raw: string) => {
      const errs: string[] = [];
      if (typeof raw !== "string" || !raw.includes("# Halo")) {
        errs.push("output tidak mengandung '# Halo'");
      }
      if (typeof raw !== "string" || !raw.includes("- item A")) {
        errs.push("output tidak mengandung '- item A'");
      }
      if (typeof raw !== "string" || !raw.includes("> Quote")) {
        errs.push("output tidak mengandung '> Quote'");
      }
      return errs.length === 0 ? true : errs;
    },
  },
  {
    id: "TC8",
    name: "markdownToAiChunks basic",
    input: "# Halo\n\n- item A\n- item B\n\n> Quote ini keren",
    check: () => {
      const errs: string[] = [];
      const input = "# Halo\n\n- item A\n- item B\n\n> Quote ini keren";

      let chunks: any[] = [];
      let aiText = "";

      try {
        chunks = markdownToAiChunks(input);
      } catch (e: any) {
        errs.push(`markdownToAiChunks throw: ${e.message}`);
      }

      if (!Array.isArray(chunks)) {
        errs.push("chunks bukan array");
      } else {
        if (chunks.length < 3) {
          errs.push(`chunks.length (${chunks.length}) < 3`);
        }
        if (chunks.length >= 1 && chunks[0]?.type !== "heading") {
          errs.push(`chunks[0].type bukan 'heading', tapi: ${chunks[0]?.type}`);
        }
      }

      try {
        aiText = markdownToAiText(input);
      } catch (e: any) {
        errs.push(`markdownToAiText throw: ${e.message}`);
      }

      if (typeof aiText !== "string" || aiText.length <= 0) {
        errs.push("markdownToAiText return length <= 0");
      }

      return errs.length === 0 ? true : errs;
    },
  },
];

function runTestCase(tc: TestCase): TestResult {
  try {
    let resultValue: any = undefined;
    let rawOutput = "";

    if (tc.id !== "TC6" && tc.id !== "TC8") {
      rawOutput = normalizeMarkdownForStorage(tc.input);
      resultValue = rawOutput;
    }

    const checkResult = tc.check(resultValue, rawOutput);

    if (checkResult === true) {
      return { id: tc.id, name: tc.name, result: "PASS" };
    }

    if (Array.isArray(checkResult) && checkResult.length > 0) {
      return { id: tc.id, name: tc.name, result: "FAIL", errors: checkResult };
    }

    if (checkResult === false) {
      return { id: tc.id, name: tc.name, result: "FAIL", errors: ["check return false tanpa detail"] };
    }

    return { id: tc.id, name: tc.name, result: "PASS" };
  } catch (err: any) {
    const stack = err?.stack ? String(err.stack) : String(err);
    return {
      id: tc.id,
      name: tc.name,
      result: "FAIL",
      errors: [`throw exception: ${err?.message ?? String(err)}\nSTACK: ${stack}`],
    };
  }
}

function padRight(s: string, len: number): string {
  const str = String(s ?? "");
  if (str.length >= len) return str.substring(0, len);
  return str + " ".repeat(len - str.length);
}

function main(): void {
  const results: TestResult[] = testCases.map((tc) => {
    const res = runTestCase(tc);
    if (res.result === "FAIL") {
      console.error(`\n[${res.id}] FAIL: ${res.name}`);
      if (res.errors && res.errors.length) {
        for (const e of res.errors) {
          console.error(`   - ${e}`);
        }
      }
    } else {
      console.log(`[${res.id}] PASS: ${res.name}`);
    }
    return res;
  });

  console.log("\n");
  const sepId = "-".repeat(6);
  const sepName = "-".repeat(70);
  const sepResult = "-".repeat(8);
  console.log(`${sepId}+${sepName}+${sepResult}`);
  console.log(
    `${padRight("ID", 5)} | ${padRight("NAME", 69)} | ${padRight("RESULT", 7)}`
  );
  console.log(`${sepId}+${sepName}+${sepResult}`);

  let allPass = true;
  for (const r of results) {
    if (r.result !== "PASS") allPass = false;
    console.log(
      `${padRight(r.id, 5)} | ${padRight(r.name, 69)} | ${padRight(r.result, 7)}`
    );
  }
  console.log(`${sepId}+${sepName}+${sepResult}`);

  const passCount = results.filter((r) => r.result === "PASS").length;
  const failCount = results.filter((r) => r.result === "FAIL").length;
  console.log(`\nSUMMARY: ${passCount} PASS, ${failCount} FAIL / ${results.length}`);

  if (allPass) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();

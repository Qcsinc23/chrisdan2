# ──────────────────────────────────────────────────────────────────────────────
# mcp_servers.py – Minimal reference implementation of five Model‑Context‑Protocol
#                  servers, plus a registry for chat‑time orchestration.
# ──────────────────────────────────────────────────────────────────────────────
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Any, List
import json
import os
import subprocess
import tempfile
import uuid
# Optional: pip install httpx playwright semgrep exa_py
# import httpx, playwright.sync_api as pw, semgrep, exa

# ── Base contract ─────────────────────────────────────────────────────────────
class MCPServer:
    """Abstract base class for Model‑Context‑Protocol servers."""
    name: str = "BASE"

    def __init__(self, config: Dict[str, Any] | None = None) -> None:
        self.config = config or {}

    def call(self, *args, **kwargs) -> Any:          # noqa: D401
        """Run the server's main operation. Override in subclasses."""
        raise NotImplementedError


# ── 1. REF – Context‑aware documentation retrieval ────────────────────────────
class REFServer(MCPServer):
    name = "REF"

    def call(self, symbol: str, lang: str = "python") -> str:
        """
        Return a minimal doc snippet for *symbol*.

        In production you would query DevDocs, MDN, or an internal vector DB.
        """
        # Pseudo‑implementation using a local docs folder ----------------------
        docs_root = Path(self.config.get("docs_root", "./docs"))
        matches = list(docs_root.rglob(f"{symbol}*.md"))
        if not matches:
            return f"⚠️ No docs found for `{symbol}`"
        return matches[0].read_text(encoding="utf‑8")[:800]  # truncated


# ── 2. SEMGREP – Security & quality scanner ───────────────────────────────────
class SEMGREPMCPServer(MCPServer):
    name = "SEMGREP"

    def call(self, code: str, lang: str = "python") -> List[Dict[str, str]]:
        """
        Scan *code* with Semgrep and return a list of actionable findings.

        Real usage would shell out to `semgrep --json` or use the Python API.
        """
        with tempfile.NamedTemporaryFile("w+", suffix=f".{lang}") as fp:
            fp.write(code)
            fp.flush()
            try:
                res = subprocess.run(
                    ["semgrep", "--json", fp.name],
                    capture_output=True,
                    text=True,
                    check=False,
                )
                output = json.loads(res.stdout or "{}")
                return output.get("results", [])
            except FileNotFoundError:
                return [
                    {
                        "severity": "INFO",
                        "message": "Semgrep CLI not installed; skipping scan.",
                    }
                ]


# ── 3. PIECES – Developer memory graph ────────────────────────────────────────
class PIECESServer(MCPServer):
    name = "PIECES"
    _store: Path = Path(".pieces_store.json")  # simple local persistence

    def _load(self) -> Dict[str, Any]:
        if self._store.exists():
            return json.loads(self._store.read_text("utf‑8"))
        return {}

    def _save(self, data: Dict[str, Any]) -> None:
        self._store.write_text(json.dumps(data, indent=2))

    def add_event(self, title: str, payload: Dict[str, Any]) -> str:
        db = self._load()
        key = str(uuid.uuid4())
        db[key] = {"title": title, "payload": payload}
        self._save(db)
        return key

    def query(self, keywords: str) -> List[Dict[str, Any]]:
        db = self._load()
        return [
            v for v in db.values() if all(k.lower() in json.dumps(v).lower() for k in keywords.split())
        ]


# ── 4. EXASEARCH – Dev‑focused web search (freshness‑ranked) ──────────────────
class ExaSearchServer(MCPServer):
    name = "EXASEARCH"

    def call(self, query: str, recency_days: int = 30) -> List[Dict[str, str]]:
        """
        Return a short list of {title, url, snippet} dicts.

        Replace stub with real Exa API call (`exa.search(query, ...)`) or other engine.
        """
        # Stubbed deterministic response --------------------------------------
        return [
            {
                "title": f"Simulated result for '{query}'",
                "url": f"https://example.com/{uuid.uuid4().hex[:8]}",
                "snippet": "Lorem ipsum … (replace with live data)",
            }
        ]


# ── 5. PLAYWRIGHT – Automated UI snapshot grading & iteration ─────────────────
class PlaywrightMCPServer(MCPServer):
    name = "PLAYWRIGHT"

    def call(self, url: str, style_guide: Dict[str, Any] | None = None) -> Dict[str, Any]:
        """
        Take a screenshot of *url* and run heuristic grading.

        Real implementation would launch a headless browser, capture the DOM,
        then feed the image + computed a11y stats to an LLM or rule engine.
        """
        # Minimal placeholder grade -------------------------------------------
        grade = 92  # pretend we passed
        return {"url": url, "score": grade, "issues": [] if grade >= 90 else ["contrast"]}


# ── Registry & simple orchestration layer ─────────────────────────────────────
@dataclass
class MCPRegistry:
    servers: Dict[str, MCPServer] = field(default_factory=dict)

    def register_default(self) -> None:
        """Instantiate and register all five default MCPs."""
        self.servers = {
            REFServer.name: REFServer(),
            SEMGREPMCPServer.name: SEMGREPMCPServer(),
            PIECESServer.name: PIECESServer(),
            ExaSearchServer.name: ExaSearchServer(),
            PlaywrightMCPServer.name: PlaywrightMCPServer(),
        }

    def __getitem__(self, key: str) -> MCPServer:
        return self.servers[key]

    def list(self) -> List[str]:
        return list(self.servers)

    # convenience one‑liner -----------------------------------------------------
    def call(self, server: str, *args, **kwargs) -> Any:
        return self[server].call(*args, **kwargs)


# ── Example usage (would normally live in your chat agent) ────────────────────
if __name__ == "__main__":  # quick smoke test
    mcp = MCPRegistry()
    mcp.register_default()

    # 1. Fetch doc snippet
    print("REF >", mcp.call("REF", symbol="openai.ChatCompletion.create"))

    # 2. Scan code
    demo_code = "import os\npassword = os.getenv('PASSWORD')\nprint('Hi')"
    print("SEMGREP >", mcp.call("SEMGREP", code=demo_code))

    # 3. Store & recall memory
    key = mcp["PIECES"].add_event("First run", {"result": "success"})
    print("PIECES search >", mcp["PIECES"].query("success"))

    # 4. Web search
    print("EXASEARCH >", mcp.call("EXASEARCH", "agentic RAG CrewAI"))

    # 5. UI grade
    print("PLAYWRIGHT >", mcp.call("PLAYWRIGHT", url="https://example.org"))

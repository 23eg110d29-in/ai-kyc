import sys
import os
import types

# ──────────────────────────────────────────────────────────────
# Vercel Python serverless entry point for AI KYC backend.
#
# On Vercel the *backend/* directory is the deployment root, so:
#   /var/task/          ← backend root (what was backend/ locally)
#   /var/task/api/index.py  ← this file
#   /var/task/main.py
#   /var/task/core/...
#
# The application code uses `from backend.X import …` throughout.
# We create a virtual `backend` package that maps to /var/task so
# all those imports resolve correctly without touching any source.
# ──────────────────────────────────────────────────────────────

# /var/task  (the backend root)
_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add backend root to sys.path so `import main` works
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

# Create a virtual `backend` package pointing at _backend_root
if "backend" not in sys.modules:
    _pkg = types.ModuleType("backend")
    _pkg.__path__ = [_backend_root]
    _pkg.__package__ = "backend"
    _pkg.__spec__ = None
    sys.modules["backend"] = _pkg

# Now import the FastAPI app — all `from backend.X` imports will resolve
from main import app  # noqa: E402

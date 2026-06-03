import sys
import os
import types

# On Vercel, the backend/ directory is deployed as root.
# So /var/task/ = backend root, and /var/task/api/index.py = this file.
# But main.py uses `from backend.core.X import ...` style imports.
# We fix this by creating a virtual 'backend' package pointing to the root.

backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Create a virtual 'backend' package so all internal imports resolve correctly
if 'backend' not in sys.modules:
    backend_pkg = types.ModuleType('backend')
    backend_pkg.__path__ = [backend_root]
    backend_pkg.__package__ = 'backend'
    sys.modules['backend'] = backend_pkg

# Also add backend_root to sys.path for direct module imports
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from main import app

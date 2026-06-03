import uuid
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# This ensures that whenever you use logging.info(), the trace_id is included
class TraceIDFilter(logging.Filter):
    def __init__(self, trace_id: str):
        super().__init__()
        self.trace_id = trace_id

    def filter(self, record):
        record.trace_id = self.trace_id
        return True

class TracingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Grab Trace ID from header (if it comes from another service) 
        # or generate a new one if this is the first service hit.
        trace_id = request.headers.get("X-Trace-ID", str(uuid.uuid4()))
        
        # 2. Attach it to the request state
        request.state.trace_id = trace_id
        
        # 3. Proceed with the request
        response = await call_next(request)
        
        # 4. Always send it back in the response header for easier debugging
        response.headers["X-Trace-ID"] = trace_id
        return response
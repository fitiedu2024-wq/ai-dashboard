"""
Simple file-based cache (no Redis needed for MVP)
"""

import json
import os
import time
from typing import Any, Optional
from hashlib import md5

CACHE_DIR = '/tmp/analysis_cache'
os.makedirs(CACHE_DIR, exist_ok=True)

class SimpleCache:
    def __init__(self, ttl: int = 3600):
        self.ttl = ttl  # Time to live in seconds
    
    def _get_key_path(self, key: str) -> str:
        """Get file path for cache key"""
        key_hash = md5(key.encode()).hexdigest()
        return os.path.join(CACHE_DIR, f"{key_hash}.json")
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value"""
        path = self._get_key_path(key)
        
        if not os.path.exists(path):
            return None
        
        try:
            with open(path, 'r') as f:
                data = json.load(f)
            
            # Check if expired
            if time.time() - data['timestamp'] > self.ttl:
                os.remove(path)
                return None
            
            return data['value']
        except:
            return None
    
    def set(self, key: str, value: Any):
        """Set cache value"""
        path = self._get_key_path(key)
        
        data = {
            'timestamp': time.time(),
            'value': value
        }
        
        with open(path, 'w') as f:
            json.dump(data, f)
    
    def delete(self, key: str):
        """Delete cache key"""
        path = self._get_key_path(key)
        if os.path.exists(path):
            os.remove(path)
    
    def clear_old(self):
        """Clear expired cache entries"""
        for filename in os.listdir(CACHE_DIR):
            path = os.path.join(CACHE_DIR, filename)
            try:
                with open(path, 'r') as f:
                    data = json.load(f)
                
                if time.time() - data['timestamp'] > self.ttl:
                    os.remove(path)
            except:
                pass

# Global cache instance
cache = SimpleCache(ttl=3600)  # 1 hour cache

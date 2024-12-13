import os
import subprocess

def setup_chrome():
    """Install Chrome and required dependencies on Linux systems"""
    try:
        # Check if we're on a Linux system (like Vercel)
        if os.path.exists('/etc/os-release'):
            # Install Chrome and its dependencies
            subprocess.run([
                'apt-get', 'update'
            ], check=True)
            
            subprocess.run([
                'apt-get', 'install', '-y',
                'chromium-browser',
                'chromium-chromedriver'
            ], check=True)
            
            return True
    except Exception as e:
        print(f"Failed to setup Chrome: {str(e)}")
        return False 
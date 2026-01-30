import paramiko
import time
import sys
import socket

# Configuration
HOST = "46.224.232.91"
USER = "root"
PASSWORD = "bwAp3Rr4TT7r9wHhWkAj"

def handler(title, instructions, prompt_list):
    resp = []
    for prompt, echo in prompt_list:
        if 'password' in prompt.lower():
            resp.append(PASSWORD)
        else:
            resp.append(PASSWORD) # Fallback
    return resp

def run_command(client, command):
    print(f"[{HOST}] Running: {command}")
    stdin, stdout, stderr = client.exec_command(command)
    exit_status = stdout.channel.recv_exit_status()
    output = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    
    if exit_status != 0:
        print(f"Error executing command: {command}")
        print(f"Exit Code: {exit_status}")
        print(f"Error Output: {error}")
        return False
    
    print(output)
    return True

def main():
    print("Initiating deployment (Method 3: Keyboard Interactive)...")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((HOST, 22))
        transport = paramiko.Transport(sock)
        transport.start_client()
        
        try:
             # Try keyboard-interactive
             transport.auth_interactive(USER, handler)
             print("Interactive Auth successful!")
        except Exception as e:
             print(f"Interactive Auth failed: {e}")
             # Retry standard password
             try:
                transport.auth_password(USER, PASSWORD)
                print("Password Auth successful!")
             except Exception as e2:
                print(f"Password Auth also failed: {e2}")
                return

        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client._transport = transport
        
        # 1. Update system packages
        print("Step 1: Updating system...")
        run_command(client, "apt-get update")
        
        # 2. Install Docker if not present
        print("Step 2: Checking/Installing Docker...")
        check_docker = run_command(client, "docker --version")
        if not check_docker:
             print("Docker not found. Installing...")
             if not run_command(client, "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"):
                 print("Failed to install Docker.")
                 # Fallback
                 run_command(client, "apt-get install -y docker.io")
        else:
            print("Docker is already installed.")

        # 3. Deploy WAHA
        print("Step 3: Deploying WAHA container...")
        run_command(client, "docker rm -f waha")
        deploy_cmd = "docker run -d --restart=always --name waha -p 3000:3000 devlikeapro/waha"
        
        if run_command(client, deploy_cmd):
            print("\nSUCCESS! WAHA deployed.")
            print(f"Access it at: http://{HOST}:3000/dashboard")
        else:
            print("\nFailed to deploy WAHA container.")
            
    except Exception as e:
        print(f"Connection failed: {e}")
    finally:
         if 'transport' in locals():
            transport.close()
         if 'sock' in locals():
            sock.close()

if __name__ == "__main__":
    main()

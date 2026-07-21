import os
import urllib.request
import zipfile
import subprocess
import shutil

def main():
    print("Downloading protoc...")
    # Windows protoc url
    url = "https://github.com/protocolbuffers/protobuf/releases/download/v26.1/protoc-26.1-win64.zip"
    zip_path = "tmp_protoc.zip"
    urllib.request.urlretrieve(url, zip_path)
    
    print("Extracting protoc...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall("tmp_protoc")
        
    protoc_path = os.path.abspath("tmp_protoc/bin/protoc.exe")
    
    print("Installing go plugins...")
    env = os.environ.copy()
    go_bin_path = r"C:\Program Files\Go\bin"
    if os.path.exists(go_bin_path):
        env["PATH"] = go_bin_path + os.pathsep + env.get("PATH", "")

    go_cmd = shutil.which("go", path=env.get("PATH"))
    if not go_cmd and os.path.exists(r"C:\Program Files\Go\bin\go.exe"):
        go_cmd = r"C:\Program Files\Go\bin\go.exe"

    if go_cmd:
        try:
            subprocess.run([go_cmd, "version"], env=env, check=True)
            go_available = True
        except Exception as e:
            print(f"Error checking go version: {e}")
            go_available = False
    else:
        go_available = False
        print("Go is not available on host. Skipping Go proto generation on host.")
        
    if go_available and go_cmd:
        subprocess.run([go_cmd, "install", "google.golang.org/protobuf/cmd/protoc-gen-go@v1.33.0"], env=env, check=True)
        subprocess.run([go_cmd, "install", "google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0"], env=env, check=True)
        
        # Add GOBIN to path
        go_path = subprocess.check_output([go_cmd, "env", "GOPATH"], env=env).decode().strip()
        gobin = os.path.join(go_path, "bin")
        env["PATH"] = gobin + os.pathsep + env.get("PATH", "")
        
        print("Generating Go proto files...")
        os.makedirs("api/internal/pb", exist_ok=True)
        subprocess.run([
            protoc_path,
            "--proto_path=inference/proto",
            "--go_out=api/internal/pb",
            "--go_opt=paths=source_relative",
            "--go-grpc_out=api/internal/pb",
            "--go-grpc_opt=paths=source_relative",
            "inference/proto/inference.proto"
        ], env=env, check=True)
        
    # Clean up
    os.remove(zip_path)
    shutil.rmtree("tmp_protoc")
    print("Proto generation script finished.")

if __name__ == "__main__":
    main()

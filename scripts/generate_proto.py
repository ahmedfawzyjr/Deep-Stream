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
    # Run go install
    env = os.environ.copy()
    # Find go in typical user path or let shell resolve if available
    # Since go is not in PATH, let's check if we can run it, or if we need to skip go generation
    try:
        subprocess.run(["go", "version"], check=True)
        go_available = True
    except Exception:
        go_available = False
        print("Go is not available on host. Skipping Go proto generation on host.")
        
    if go_available:
        subprocess.run(["go", "install", "google.golang.org/protobuf/cmd/protoc-gen-go@v1.33.0"], check=True)
        subprocess.run(["go", "install", "google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0"], check=True)
        
        # Add GOBIN to path
        go_path = subprocess.check_output(["go", "env", "GOPATH"]).decode().strip()
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

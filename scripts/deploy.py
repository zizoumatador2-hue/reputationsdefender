#!/usr/bin/env python3
"""
Deploy to Cloudflare Pages using the API directly
"""

import os
import sys
import json
import hashlib
import requests
from pathlib import Path

def get_file_hash(file_path):
    """Calculate SHA1 hash of a file"""
    sha1 = hashlib.sha1()
    with open(file_path, 'rb') as f:
        sha1.update(f.read())
    return sha1.hexdigest()

def deploy_to_cloudflare():
    """Deploy the dist folder to Cloudflare Pages"""

    # Get environment variables
    api_token = os.environ.get('CLOUDFLARE_API_TOKEN', '').strip()
    account_id = os.environ.get('CLOUDFLARE_ACCOUNT_ID', '').strip()
    project_name = os.environ.get('PROJECT', 'reputationsdefender')

    # Validate credentials
    if not api_token or not account_id:
        print("❌ Error: Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID")
        return False

    print(f"✅ Credentials found")
    print(f"   Project: {project_name}")
    print(f"   Account ID: {account_id[:10]}...")
    print(f"   Token length: {len(api_token)} chars")

    # Find dist folder
    dist_path = Path('dist')
    if not dist_path.exists():
        print(f"❌ Error: {dist_path} directory not found")
        return False

    # Collect files
    files = {}
    manifest = {}

    print(f"\n📦 Scanning files...")
    for file_path in dist_path.rglob('*'):
        if file_path.is_file():
            rel_path = file_path.relative_to(dist_path)
            rel_path_str = str(rel_path).replace('\\', '/')

            with open(file_path, 'rb') as f:
                content = f.read()

            file_hash = get_file_hash(file_path)
            files[rel_path_str] = content
            manifest[rel_path_str] = file_hash

    print(f"✅ Found {len(files)} files to deploy")

    # Create deployment
    print(f"\n🚀 Creating deployment...")

    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }

    # Step 1: Create deployment
    deploy_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments"

    deploy_payload = {
        'branch': 'main'
    }

    response = requests.post(deploy_url, json=deploy_payload, headers=headers)

    print(f"   Response status: {response.status_code}")

    if response.status_code not in [200, 201]:
        print(f"❌ Error: Failed to create deployment")
        print(f"   Response: {response.text}")
        return False

    deploy_data = response.json()

    if not deploy_data.get('success'):
        print(f"❌ Error: API returned success=false")
        print(f"   Response: {json.dumps(deploy_data, indent=2)}")
        return False

    deployment_id = deploy_data['result'].get('id')
    print(f"✅ Deployment created: {deployment_id}")

    # Step 2: Upload files
    print(f"\n📤 Uploading {len(files)} files...")

    upload_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}/files"

    for file_path, content in files.items():
        # Prepare multipart form data
        files_multipart = {
            'files': (file_path, content)
        }

        response = requests.post(
            f"{upload_url}",
            files=files_multipart,
            headers={'Authorization': f'Bearer {api_token}'}
        )

        if response.status_code not in [200, 201]:
            print(f"⚠️  Warning: Failed to upload {file_path}")
            print(f"    Status: {response.status_code}")
        else:
            print(f"✅ Uploaded: {file_path}")

    print(f"\n✅ Deployment completed!")
    print(f"🔗 Deployment ID: {deployment_id}")
    print(f"🌐 Project: https://{project_name}.pages.dev")

    return True

if __name__ == '__main__':
    success = deploy_to_cloudflare()
    sys.exit(0 if success else 1)

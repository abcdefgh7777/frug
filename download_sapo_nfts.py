import requests
import os
import time
from urllib.parse import urlparse

# Configuration
CONTRACT_ADDRESS = "0x7b12f69a6521ea57a71684b54ced45feca884760"
OUTPUT_DIR = "un-sapo-images"
MAX_IMAGES = 100

# Alchemy API endpoint (using demo key for Base mainnet)
API_URL = f"https://base-mainnet.g.alchemy.com/nft/v3/demo/getNFTsForCollection"

def fetch_nfts(start_token=None):
    """Fetch NFTs from Alchemy API"""
    params = {
        "contractAddress": CONTRACT_ADDRESS,
        "withMetadata": "true",
        "limit": 100
    }
    if start_token:
        params["startToken"] = start_token

    response = requests.get(API_URL, params=params)
    response.raise_for_status()
    return response.json()

def download_image(url, filepath):
    """Download image from URL and save to filepath"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        with open(filepath, "wb") as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"  Error downloading: {e}")
        return False

def get_file_extension(url, content_type=None):
    """Get file extension from URL or content type"""
    path = urlparse(url).path
    if path.endswith('.png'):
        return '.png'
    elif path.endswith('.jpg') or path.endswith('.jpeg'):
        return '.jpg'
    elif path.endswith('.gif'):
        return '.gif'
    elif path.endswith('.webp'):
        return '.webp'
    else:
        return '.png'  # Default to PNG

def main():
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Fetching NFTs from collection {CONTRACT_ADDRESS}")
    print(f"Saving images to: {OUTPUT_DIR}/")
    print("-" * 50)

    downloaded = 0
    start_token = None

    while downloaded < MAX_IMAGES:
        # Fetch batch of NFTs
        print(f"\nFetching NFTs (starting from token {start_token or '0'})...")
        data = fetch_nfts(start_token)

        nfts = data.get("nfts", [])
        if not nfts:
            print("No more NFTs found")
            break

        for nft in nfts:
            if downloaded >= MAX_IMAGES:
                break

            token_id = nft.get("tokenId", "unknown")
            image_url = nft.get("image", {}).get("cachedUrl") or \
                        nft.get("image", {}).get("originalUrl") or \
                        nft.get("raw", {}).get("metadata", {}).get("image")

            if not image_url:
                print(f"  #{token_id}: No image URL found, skipping")
                continue

            # Get file extension and create filename
            ext = get_file_extension(image_url)
            filename = f"sapo_{token_id.zfill(4)}{ext}"
            filepath = os.path.join(OUTPUT_DIR, filename)

            # Skip if already downloaded
            if os.path.exists(filepath):
                print(f"  #{token_id}: Already exists, skipping")
                downloaded += 1
                continue

            print(f"  #{token_id}: Downloading... ", end="", flush=True)
            if download_image(image_url, filepath):
                print("OK")
                downloaded += 1
            else:
                print("FAILED")

            # Small delay to be respectful
            time.sleep(0.2)

        # Get next page token
        start_token = data.get("pageKey")
        if not start_token:
            print("\nNo more pages")
            break

    print("-" * 50)
    print(f"Downloaded {downloaded} images to {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()

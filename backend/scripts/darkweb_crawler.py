import time
import random
import requests
from datetime import datetime, timezone

# This is a simulated Dark Web Crawler agent.
# In a production environment, this script would run through Tor (e.g., using stem and requests with proxies)
# and use tools like BeautifulSoup or Scrapy to parse onion forum pages.

TARGET_ONION_SITES = [
    "http://exampleforumxxxxxxxxxxxxxxxx.onion/market",
    "http://pastebinxxxxxxxxxxxxxxxxxxxx.onion/dumps"
]

BACKEND_API_URL = "http://127.0.0.1:8000/api/v1/darkweb"

SIMULATED_DUMPS = [
    {"indicator": "admin_portal_db_dump.sql", "indicator_type": "file", "severity": "critical", "related_entity": "SYS-001"},
    {"indicator": "johndoe@banking-corp.com:password123", "indicator_type": "credential", "severity": "high", "related_entity": "EMP-942"},
    {"indicator": "banking-corp-internal-ip-list", "indicator_type": "network", "severity": "medium", "related_entity": "NET-099"},
]

def scrape_darkweb():
    print("[*] Initializing Dark Web Crawler Agent...")
    print("[*] Connecting to Tor network (Simulated)...")
    time.sleep(2)

    for site in TARGET_ONION_SITES:
        print(f"[*] Crawling {site}...")
        time.sleep(random.uniform(1.0, 3.0)) # Simulate network delay
        
        # Simulate finding a threat
        if random.random() > 0.3:
            threat = random.choice(SIMULATED_DUMPS)
            print(f"[!] Threat found on {site}: {threat['indicator']}")
            
            payload = {
                "indicator": threat["indicator"],
                "indicator_type": threat["indicator_type"],
                "source": site,
                "related_entity": threat["related_entity"],
                "description": f"Automated scrape discovered potential leak on {site}",
                "severity": threat["severity"],
                "status": "new"
            }
            
            # Post to our backend API
            try:
                print("[-] Sending threat to ThreatLink Backend...")
                response = requests.post(BACKEND_API_URL, json=payload)
                if response.status_code == 200 or response.status_code == 201:
                    print("[+] Successfully stored threat in database!")
                else:
                    print(f"[ERR] Failed to store threat: {response.text}")
            except Exception as e:
                print(f"[ERR] Could not reach backend API: {e}")
                
        else:
            print(f"[-] No relevant banking threats found on {site} today.")
            
    print("[*] Crawl cycle complete. Sleeping until next cycle...")

if __name__ == "__main__":
    while True:
        scrape_darkweb()
        print("--------------------------------------------------")
        time.sleep(10) # Run every 10 seconds for demo purposes

from tqdm import tqdm
from trafilatura.sitemaps import sitemap_search
from trafilatura import extract_metadata

import requests
from bs4 import BeautifulSoup


def get_urls_from_sitemap(resource_url: str) -> list:
    """
    Recovers the sitemap through Trafilatura
    """
    urls = sitemap_search(resource_url)
    return urls


def create_dataset(list_of_websites: list) :
    """
    scrapes the data from the list of websites
    """
    data = []
    for website in tqdm(list_of_websites, desc="Websites"):
        urls = get_urls_from_sitemap(website)

        for url in tqdm(urls, desc="URLs"):
            try:
                # Send HTTP request to the URL
                response = requests.get(url)
                response.raise_for_status()  # Check for successful response

                # Parse HTML content
                soup = BeautifulSoup(response.content, "html.parser")

                metadata = extract_metadata(response.content)
                title = soup.title.string
                description = metadata.description

                # Extract text from each paragraph
                paragraphs = [p.get_text(strip=True) for p in soup.find_all("p")]
                content = "\n".join(paragraphs)
                d = {
                    "url": url,
                    "title": title,
                    "body": content,
                    "description": description,
                }
                data.append(d)
            except requests.exceptions.HTTPError as errh:
                print(f"HTTP Error: {errh}")
            except requests.exceptions.ConnectionError as errc:
                print(f"Error Connecting: {errc}")
            except requests.exceptions.Timeout as errt:
                print(f"Timeout Error: {errt}")
            except requests.RequestException as err:
                print(f"Error during requests to {url}: {str(err)}")
    return data


def scrape(list_of_websites: list) -> None:
    data = create_dataset(list_of_websites)
    with open("./docs/dataset.txt", "w", encoding="utf-8") as file:
        for paragraph in data:
            file.write(paragraph["title"] + "\n")
            file.write(paragraph["body"])

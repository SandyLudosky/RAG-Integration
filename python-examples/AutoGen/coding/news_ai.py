# filename: news_ai.py
import feedparser

# RSS feed URL
url = "https://example.com/rss"  # Replace with the actual RSS feed URL

# Parse the RSS feed
feed = feedparser.parse(url)

# Check if the feed was parsed successfully
if feed.entries:
    # Extract the entries from the feed
    entries = feed.entries

    # Print the news articles
    for entry in entries:
        print(entry.title)
        print(entry.description)
        print(entry.link)
        print()

else:
    print("Error occurred while parsing the RSS feed")

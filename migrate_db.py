import json
import os

db_path = 'c:/Users/admin/Documents/web/story-app/db.json'

try:
    with open(db_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Initialize chapters if not exist
    if 'chapters' not in data:
        data['chapters'] = []

    # Iterate stories and extract chapters
    for story in data.get('stories', []):
        if 'chapters' in story and isinstance(story['chapters'], list):
            print(f"Migrating {len(story['chapters'])} chapters from story {story['id']}...")
            for idx, chapter in enumerate(story['chapters']):
                chapter['storyId'] = story['id']
                # Add order if missing
                if 'order' not in chapter:
                    chapter['order'] = idx + 1
                
                # Add createdAt if missing
                if 'createdAt' not in chapter:
                    chapter['createdAt'] = story.get('createdAt', "2024-01-01T00:00:00.000Z")
                
                # check if chapter already in data['chapters'] to avoid duplicates if run multiple times
                # Assuming ID is unique.
                existing = [c for c in data['chapters'] if c['id'] == chapter['id']]
                if not existing:
                    data['chapters'].append(chapter)
            
            # Remove chapters from story
            del story['chapters']
    
    # Sort chapters by storyId and order
    data['chapters'].sort(key=lambda x: (x['storyId'], x['order']))

    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("Migration successful.")

except Exception as e:
    print(f"Error: {e}")

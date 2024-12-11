#!/bin/bash

while true; do
    # Check if there are any changes
    if [[ -n $(git status -s) ]]; then
        # Stage all changes
        git add .
        
        # Create commit message with timestamp
        commit_msg="Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
        
        # Commit the changes
        git commit -m "$commit_msg"
        
        echo "Changes committed at $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # Wait for 30 seconds before checking again
    sleep 30
done

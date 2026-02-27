#!/bin/bash

# Set the root directory to scan
ROOT_DIR="/workspace/angular/time-caps/tc-app/src/app"
OUTPUT_FILE="/workspace/angular/time-caps/tc-app/src/assets/i18n/messages.json"
TEMP_FILE="/tmp/static_strings_with_spaces.txt"

# Clear the temporary file
> "$TEMP_FILE"

# Find all TypeScript files in components and services folders and extract static strings with spaces
find "$ROOT_DIR/Components" "$ROOT_DIR/Services" -type f -name "*.ts" | while read -r file; do
    # Extract all strings enclosed in single or double quotes that contain spaces
    grep -oE "'[^']* [^']*'|\"[^\"]* [^\"]*\"" "$file" | sed -E "s/^['\"]|['\"]$//g" >> "$TEMP_FILE"
done

# Remove duplicates and sort
sort -u "$TEMP_FILE" > "${TEMP_FILE}.sorted"

# Create JSON structure with English as default
echo "{" > "$OUTPUT_FILE"
echo "  \"en\": {" >> "$OUTPUT_FILE"

# Add each message as a key-value pair
first_line=true
while IFS= read -r message; do
    if [ "$first_line" = true ]; then
        first_line=false
        echo "    \"$message\": \"$message\"" >> "$OUTPUT_FILE"
    else
        echo "    ,\"$message\": \"$message\"" >> "$OUTPUT_FILE"
    fi
done < "${TEMP_FILE}.sorted"

echo "  }," >> "$OUTPUT_FILE"

# Add placeholder sections for other languages
for lang in "it" "es" "fr" "ka" "ru"; do
    echo "  \"$lang\": {" >> "$OUTPUT_FILE"
    first_line=true
    while IFS= read -r message; do
        if [ "$first_line" = true ]; then
            first_line=false
            echo "    \"$message\": \"$message\"" >> "$OUTPUT_FILE"
        else
            echo "    ,\"$message\": \"$message\"" >> "$OUTPUT_FILE"
        fi
    done < "${TEMP_FILE}.sorted"
    
    if [ "$lang" = "ru" ]; then
        echo "  }" >> "$OUTPUT_FILE"
    else
        echo "  }," >> "$OUTPUT_FILE"
    fi
done

echo "}" >> "$OUTPUT_FILE"

echo "Messages extracted to $OUTPUT_FILE"
echo "Total unique messages found: $(wc -l < ${TEMP_FILE}.sorted)"

# Clean up
rm "$TEMP_FILE" "${TEMP_FILE}.sorted"
#!/bin/bash
# Fixed Heights Detection Script for Time Capsule Project
# This script analyzes SCSS files to identify potential fixed height issues

# Set output location following project structure guidelines
output_file="/workspace/angular/time-caps/tc-app/.github/fixed-heights-report.md"

echo "<!-- filepath: ${output_file} -->" > "$output_file"
echo "# Fixed Heights Report for Time Capsule Project" >> "$output_file"
echo "" >> "$output_file"
echo "Generated on: $(date)" >> "$output_file"
echo "" >> "$output_file"

# Function to add a section to the report
add_section() {
  echo "" >> "$output_file"
  echo "## $1" >> "$output_file"
  echo "" >> "$output_file"
}

# Function to append search results
append_findings() {
  section_title=$1
  find_pattern=$2
  
  add_section "$section_title"
  
  # Use a temporary file to avoid SIGPIPE issues
  temp_file=$(mktemp)
  find /workspace/angular/time-caps/tc-app/src -name "*.scss" -type f -exec grep -l "$find_pattern" {} \; > "$temp_file" || true
  
  # Check if we found any results
  if [ ! -s "$temp_file" ]; then
    echo "No findings in this category." >> "$output_file"
  else
    echo "### Files affected:" >> "$output_file"
    echo "\`\`\`" >> "$output_file"
    cat "$temp_file" | sort >> "$output_file"
    echo "\`\`\`" >> "$output_file"
  fi
  
  rm "$temp_file"
}

# Find explicit height declarations
append_findings "Explicit Fixed Heights" "height: [0-9]\\+px"

# Find min-height declarations
append_findings "Min-Height Declarations" "min-height: [0-9]\\+px"

# Find max-height declarations
append_findings "Max-Height Declarations" "max-height: [0-9]\\+px"

# Find viewport height declarations
append_findings "Viewport Height Declarations" "height: [0-9]\\+vh"

# Find percentage height declarations
append_findings "Percentage Height Declarations" "height: [0-9]\\+%"

# Find overflow properties
append_findings "Overflow Properties (potential fixed height indicators)" "overflow-y: \\(auto\\|scroll\\)"

# Check for inline styles in HTML
add_section "Inline Style Height Attributes in HTML"
temp_file=$(mktemp)
find /workspace/angular/time-caps/tc-app/src -name "*.html" -type f -exec grep -l "style=.*height" {} \; > "$temp_file" || true

if [ ! -s "$temp_file" ]; then
  echo "No findings in this category." >> "$output_file"
else
  echo "### Files affected:" >> "$output_file"
  echo "\`\`\`" >> "$output_file"
  cat "$temp_file" | sort >> "$output_file" 
  echo "\`\`\`" >> "$output_file"
fi
rm "$temp_file"

# Add detailed examples section with file paths
add_section "Examples of Fixed Height Code"
echo "These examples show the actual code with surrounding context:" >> "$output_file"
echo "" >> "$output_file"

# Create temporary file for examples
examples_file=$(mktemp)

# Find height examples
find /workspace/angular/time-caps/tc-app/src -name "*.scss" -type f -exec grep -n -B 1 -A 1 "height: [0-9]\\+px" {} \; | head -20 > "$examples_file" || true

# If we have examples, show them with file paths
if [ ! -s "$examples_file" ]; then
  echo "No explicit height examples found." >> "$output_file"
else
  echo "### Fixed pixel heights:" >> "$output_file"
  echo "\`\`\`scss" >> "$output_file"
  cat "$examples_file" >> "$output_file"
  echo "\`\`\`" >> "$output_file"
fi
rm "$examples_file"

# Create another temp file for overflow examples
overflow_examples=$(mktemp)
find /workspace/angular/time-caps/tc-app/src -name "*.scss" -type f -exec grep -n -B 1 -A 1 "overflow-y: \\(auto\\|scroll\\)" {} \; | head -15 > "$overflow_examples" || true

if [ -s "$overflow_examples" ]; then
  echo "" >> "$output_file"
  echo "### Overflow with potential fixed heights:" >> "$output_file"
  echo "\`\`\`scss" >> "$output_file"
  cat "$overflow_examples" >> "$output_file"
  echo "\`\`\`" >> "$output_file"
fi
rm "$overflow_examples"

# Add next steps section with Angular-specific recommendations
add_section "Recommended Fixes Based on Angular Development Guidelines"
echo "When fixing fixed height issues, follow these Angular development guidelines for the Time Capsule project:" >> "$output_file"
echo "" >> "$output_file"
echo "1. **Remove explicit height values** wherever possible:" >> "$output_file"
echo "   - Let content determine container sizes naturally" >> "$output_file"
echo "   - Use Angular Material components' native sizing behavior" >> "$output_file"
echo "" >> "$output_file"
echo "2. **Replace fixed heights with flexible alternatives:**" >> "$output_file"
echo "   - Use CSS Flexbox or Grid for layouts instead of fixed heights" >> "$output_file"
echo "   - Use `min-height` only when absolutely necessary (and with careful consideration)" >> "$output_file"
echo "   - For scrollable areas, consider using Material's scrolling containers" >> "$output_file"
echo "" >> "$output_file"
echo "3. **Improve responsive behavior:**" >> "$output_file"
echo "   - Replace fixed heights with relative units (%, rem, vh) when a height constraint is necessary" >> "$output_file" 
echo "   - Use media queries to adjust sizes for different viewport widths" >> "$output_file"
echo "   - Test all changes on multiple device sizes" >> "$output_file"
echo "" >> "$output_file"
echo "4. **Follow Material Design standards:**" >> "$output_file"
echo "   - Use standard Material component dimensions" >> "$output_file"
echo "   - Avoid custom styling that overrides Material defaults" >> "$output_file"
echo "   - Use Material's layout components like mat-card, mat-list, etc." >> "$output_file"

echo "Report generated at $output_file"
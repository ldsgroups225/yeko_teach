#!/bin/bash

# Add alternative Maven repositories to the Android build configuration
echo "Adding Maven mirrors to build.gradle"

# Create the sed command to add repositories after google()
cat << 'EOF' > /tmp/maven-repos.txt
        maven { url "https://maven.aliyun.com/repository/public" }
        maven { url "https://repo1.maven.org/maven2" }
EOF

# Function to modify build.gradle
modify_gradle() {
    local build_gradle=$1
    if [ -f "$build_gradle" ]; then
        echo "Modifying $build_gradle"
        sed -i '/google()/r /tmp/maven-repos.txt' "$build_gradle"
    else
        echo "Warning: $build_gradle not found"
    fi
}

# Modify both buildscript and allprojects sections
modify_gradle "android/build.gradle"

echo "Build configuration updated successfully"
